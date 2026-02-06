'use strict';
'use server';

import dbConnect from "@/lib/mongodb";
import Inquiry from "@/models/Inquiry";
import { revalidatePath } from "next/cache";
import { createNotification } from "./notifications";

export async function createInquiry(data: {
    name: string;
    email: string;
    phone: string;
    organization?: string;
    type: 'purchase' | 'rental' | 'general';
    artwork_id?: string;
    message?: string;
}) {
    try {
        await dbConnect();

        const inquiry = await Inquiry.create({
            ...data,
            status: 'pending'
        });

        // 관리자 알림 생성 (모든 admin 권한 사용자에게 발송하거나 시스템 계정 관리)
        await createNotification({
            recipient_id: '67a186483562479e00000000', // 관리자 고정 ID 또는 동적 조회 필요 (여기선 예시로 관리자 계정 ID 사용)
            type: 'inquiry',
            title: '새로운 작품 문의가 접수되었습니다.',
            message: `${data.name} 고객님으로부터 ${data.type === 'purchase' ? '구매' : '렌탈'} 문의가 도착했습니다.`,
            link: '/admin/inquiries'
        });

        revalidatePath('/admin'); // Revalidate admin dashboard to show new inquiries

        return { success: true, inquiry: JSON.parse(JSON.stringify(inquiry)) };
    } catch (error: any) {
        console.error("Error creating inquiry:", error);
        return { success: false, error: error.message };
    }
}

export async function getInquiries() {
    try {
        await dbConnect();
        const inquiries = await Inquiry.find({})
            .sort({ createdAt: -1 })
            .populate('artwork_id', 'title');

        return { success: true, inquiries: JSON.parse(JSON.stringify(inquiries)) };
    } catch (error: any) {
        console.error("Error fetching inquiries:", error);
        return { success: false, error: error.message };
    }
}

export async function updateInquiryStatus(id: string, status: 'pending' | 'contacted' | 'completed') {
    try {
        await dbConnect();
        const inquiry = await Inquiry.findByIdAndUpdate(id, { status }, { new: true });
        revalidatePath('/admin');
        return { success: true, inquiry: JSON.parse(JSON.stringify(inquiry)) };
    } catch (error: any) {
        console.error("Error updating inquiry status:", error);
        return { success: false, error: error.message };
    }
}
