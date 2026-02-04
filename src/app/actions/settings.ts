'use server';

import dbConnect from "@/lib/mongodb";
import Settings from "@/models/Settings";
import { revalidatePath } from "next/cache";

/**
 * 플랫폼 설정 정보 조회
 */
export async function getSettings() {
    try {
        const conn = await dbConnect();
        if (!conn) return { success: false, error: "Database connection failed." };

        let settings = await Settings.findOne({}).lean();

        // 만약 설정이 하나도 없다면 기본값으로 하나 생성
        if (!settings) {
            settings = await Settings.create({});
            settings = JSON.parse(JSON.stringify(settings));
        }

        return {
            success: true,
            settings: JSON.parse(JSON.stringify(settings))
        };
    } catch (error: any) {
        console.error("Error fetching settings:", error);
        return { success: false, error: error.message };
    }
}

/**
 * 플랫폼 설정 정보 업데이트
 */
export async function updateSettings(data: any) {
    try {
        const conn = await dbConnect();
        if (!conn) return { success: false, error: "Database connection failed." };

        // _id 필드가 포함되어 있으면 업데이트 시 충돌이 발생할 수 있으므로 제거
        const { _id, __v, ...updateData } = data;

        console.log("Updating settings with:", updateData);

        const settings = await Settings.findOneAndUpdate(
            {},
            { $set: updateData },
            { new: true, upsert: true }
        );

        console.log("Settings updated successfully");

        revalidatePath('/'); // 메인 페이지 푸터 반영을 위해 재검증
        revalidatePath('/admin');

        return {
            success: true,
            settings: JSON.parse(JSON.stringify(settings))
        };
    } catch (error: any) {
        console.error("Error updating settings:", error);
        return { success: false, error: error.message };
    }
}
