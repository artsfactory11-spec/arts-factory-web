'use server';

import dbConnect from "@/lib/mongodb";
import Notice, { IBaseNotice } from "@/models/Notice";
import { revalidatePath } from "next/cache";

/**
 * 모든 공지사항 조회 (관리자용)
 */
export async function getNotices() {
    try {
        await dbConnect();
        const notices = await Notice.find({}).sort({ createdAt: -1 });
        return { success: true, notices: JSON.parse(JSON.stringify(notices)) };
    } catch (error: unknown) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown error occurred" };
    }
}

/**
 * 현재 유효한 공지사항 조회 (사용자용)
 */
export async function getActiveNotices() {
    try {
        await dbConnect();
        const now = new Date();
        const notices = await Notice.find({
            isActive: true,
            startDate: { $lte: now },
            endDate: { $gte: now }
        }).sort({ priority: -1, createdAt: -1 });

        return { success: true, notices: JSON.parse(JSON.stringify(notices)) };
    } catch (error: unknown) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown error occurred" };
    }
}

/**
 * 단일 공지사항 상세 조회
 */
export async function getNoticeById(id: string) {
    try {
        await dbConnect();
        const notice = await Notice.findById(id);
        if (!notice) return { success: false, error: "Notice not found" };
        return { success: true, notice: JSON.parse(JSON.stringify(notice)) };
    } catch (error: unknown) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown error occurred" };
    }
}

/**
 * 공지사항 생성/수정
 */
export async function upsertNotice(data: IBaseNotice) {
    try {
        await dbConnect();
        const { _id, ...updateData } = data;

        let notice;
        if (_id) {
            notice = await Notice.findByIdAndUpdate(_id, updateData, { new: true });
        } else {
            notice = await Notice.create(updateData);
        }

        revalidatePath('/admin');
        revalidatePath('/');
        revalidatePath(`/notice/${notice._id}`);

        return { success: true, notice: JSON.parse(JSON.stringify(notice)) };
    } catch (error: unknown) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown error occurred" };
    }
}

/**
 * 공지사항 삭제
 */
export async function deleteNotice(id: string) {
    try {
        await dbConnect();
        await Notice.findByIdAndDelete(id);
        revalidatePath('/admin');
        revalidatePath('/');
        return { success: true };
    } catch (error: unknown) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown error occurred" };
    }
}

/**
 * 공지사항 상태 토글 (활성화/비활성화)
 */
export async function toggleNoticeActive(id: string, isActive: boolean) {
    try {
        await dbConnect();
        await Notice.findByIdAndUpdate(id, { isActive });
        revalidatePath('/admin');
        revalidatePath('/');
        return { success: true };
    } catch (error: unknown) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown error occurred" };
    }
}
