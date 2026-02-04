'use server';

import dbConnect from "@/lib/mongodb";
import Notification from "@/models/Notification";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

export async function getNotifications() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) return { success: false, notifications: [] };

        await dbConnect();
        const notifications = await Notification.find({ recipient_id: session.user.id })
            .sort({ createdAt: -1 })
            .limit(20);

        return {
            success: true,
            notifications: JSON.parse(JSON.stringify(notifications))
        };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function markAsRead(notificationId: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) return { success: false, error: 'Unauthorized' };

        await dbConnect();
        await Notification.findByIdAndUpdate(notificationId, { isRead: true });

        revalidatePath('/');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function markAllAsRead() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) return { success: false, error: 'Unauthorized' };

        await dbConnect();
        await Notification.updateMany(
            { recipient_id: session.user.id, isRead: false },
            { isRead: true }
        );

        revalidatePath('/');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function createNotification(data: {
    recipient_id: string;
    type: 'inquiry' | 'artwork_approval' | 'artwork_rejection' | 'system';
    title: string;
    message: string;
    link?: string;
}) {
    try {
        await dbConnect();
        const notification = await Notification.create(data);
        return { success: true, notification: JSON.parse(JSON.stringify(notification)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
