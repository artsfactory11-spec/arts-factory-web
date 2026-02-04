'use server';

import dbConnect from "@/lib/mongodb";
import Magazine from "@/models/Magazine";
import { revalidatePath } from "next/cache";

export async function getMagazines() {
    try {
        await dbConnect();
        const magazines = await Magazine.find({ is_published: true })
            .sort({ createdAt: -1 })
            .lean();
        return { success: true, magazines: JSON.parse(JSON.stringify(magazines)) };
    } catch (error) {
        console.error("Failed to fetch magazines:", error);
        return { success: false, error: "매거진을 불러오는 데 실패했습니다." };
    }
}

export async function getAllMagazinesAdmin() {
    try {
        await dbConnect();
        const magazines = await Magazine.find()
            .sort({ createdAt: -1 })
            .lean();
        return { success: true, magazines: JSON.parse(JSON.stringify(magazines)) };
    } catch (error) {
        console.error("Failed to fetch admin magazines:", error);
        return { success: false, error: "매거진 목록을 불러오는 데 실패했습니다." };
    }
}

export async function getMagazineById(id: string) {
    try {
        await dbConnect();
        const magazine = await Magazine.findById(id).lean();
        if (!magazine) return { success: false, error: "매거진을 찾을 수 없습니다." };

        // Increase view count
        await Magazine.findByIdAndUpdate(id, { $inc: { view_count: 1 } });

        return { success: true, magazine: JSON.parse(JSON.stringify(magazine)) };
    } catch (error) {
        console.error("Failed to fetch magazine:", error);
        return { success: false, error: "매거진을 불러오는 데 실패했습니다." };
    }
}

export async function createMagazine(data: any) {
    try {
        await dbConnect();
        const magazine = await Magazine.create(data);
        revalidatePath('/magazine');
        revalidatePath('/admin');
        return { success: true, magazine: JSON.parse(JSON.stringify(magazine)) };
    } catch (error) {
        console.error("Failed to create magazine:", error);
        return { success: false, error: "매거진 등록에 실패했습니다." };
    }
}

export async function updateMagazine(id: string, data: any) {
    try {
        await dbConnect();
        const magazine = await Magazine.findByIdAndUpdate(id, data, { new: true });
        revalidatePath('/magazine');
        revalidatePath(`/magazine/${id}`);
        revalidatePath('/admin');
        return { success: true, magazine: JSON.parse(JSON.stringify(magazine)) };
    } catch (error) {
        console.error("Failed to update magazine:", error);
        return { success: false, error: "매거진 수정에 실패했습니다." };
    }
}

export async function deleteMagazine(id: string) {
    try {
        await dbConnect();
        await Magazine.findByIdAndDelete(id);
        revalidatePath('/magazine');
        revalidatePath('/admin');
        return { success: true };
    } catch (error) {
        console.error("Failed to delete magazine:", error);
        return { success: false, error: "매거진 삭제에 실패했습니다." };
    }
}
