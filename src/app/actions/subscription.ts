'use server';

import dbConnect from "@/lib/mongodb";
import Subscription from "@/models/Subscription";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function getAdminSubscriptions() {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session || !session.user) return { success: false, error: "Unauthorized" };

        // Admin check
        const admin = await User.findOne({ email: session.user.email });
        if (!admin || admin.role !== 'admin') return { success: false, error: "Forbidden" };

        const subscriptions = await Subscription.find({})
            .populate('user_id', 'name email')
            .populate('artwork_id', 'title')
            .sort({ createdAt: -1 });

        return { success: true, subscriptions: JSON.parse(JSON.stringify(subscriptions)) };

    } catch (error) {
        console.error("Get Admin Subscriptions Error:", error);
        return { success: false, error: "Failed to fetch subscriptions" };
    }
}
