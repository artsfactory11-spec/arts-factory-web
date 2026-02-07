'use server';

import dbConnect from "@/lib/mongodb";
import Artwork from "@/models/Artwork";
import User from "@/models/User";
import Magazine from "@/models/Magazine";
import { revalidatePath } from "next/cache";
import { createNotification } from "./notifications";

/**
 * 작품 상태 업데이트 (승인/거절)
 */
export async function updateArtworkStatus(id: string, status: 'pending' | 'approved' | 'rejected') {
    try {
        const conn = await dbConnect();
        if (!conn) return { success: false, error: "Database connection failed. Please check IP whitelist." };
        const artwork = await Artwork.findByIdAndUpdate(id, { status }, { new: true });

        if (!artwork) return { success: false, error: 'Artwork not found' };

        // 파트너(작가)에게 알림 생성
        await createNotification({
            recipient_id: artwork.artist_id.toString(),
            type: status === 'approved' ? 'artwork_approval' : 'artwork_rejection',
            title: status === 'approved' ? '작품이 승인되었습니다!' : '작품 승인이 거절되었습니다.',
            message: `등록하신 작품 "${artwork.title}"의 심사 결과가 나왔습니다.`,
            link: '/partner'
        });

        revalidatePath('/admin');
        revalidatePath('/partner');
        revalidatePath('/'); // 메인 페이지 리스트 갱신

        return { success: true, artwork: JSON.parse(JSON.stringify(artwork)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}


/**
 * 작품 렌탈 상태 업데이트
 */
export async function updateArtworkRentalStatus(id: string, rental_status: 'available' | 'processing' | 'rented' | 'unavailable') {
    try {
        const conn = await dbConnect();
        if (!conn) return { success: false, error: "Database connection failed." };

        const artwork = await Artwork.findByIdAndUpdate(
            id,
            { rental_status },
            { new: true }
        );

        if (!artwork) return { success: false, error: 'Artwork not found' };

        revalidatePath('/admin');
        revalidatePath('/gallery');
        revalidatePath(`/artwork/${id}`);
        revalidatePath('/');

        return { success: true, artwork: JSON.parse(JSON.stringify(artwork)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * 작품 추천 상태 토글
 */
export async function toggleArtworkCurated(id: string, isCurated: boolean) {
    try {
        const conn = await dbConnect();
        if (!conn) return { success: false, error: "Database connection failed. Please check IP whitelist." };
        const artwork = await Artwork.findByIdAndUpdate(id, { isCurated }, { new: true });

        if (!artwork) return { success: false, error: 'Artwork not found' };

        revalidatePath('/admin');
        revalidatePath('/');

        return { success: true, artwork: JSON.parse(JSON.stringify(artwork)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * 아티스트 스포트라이트 상태 토글
 */
export async function toggleArtistSpotlight(id: string, isSpotlight: boolean) {
    try {
        const conn = await dbConnect();
        if (!conn) return { success: false, error: "Database connection failed. Please check IP whitelist." };

        // 만약 true로 설정하는 경우, 다른 모든 작가의 spotlight를 false로 초기화 (단 한 명만 노출)
        if (isSpotlight) {
            await User.updateMany({ isSpotlight: true }, { isSpotlight: false });
        }

        const user = await User.findByIdAndUpdate(id, { isSpotlight }, { new: true });

        if (!user) return { success: false, error: 'Artist not found' };

        revalidatePath('/admin');
        revalidatePath('/artists');
        revalidatePath('/');

        return { success: true, user: JSON.parse(JSON.stringify(user)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * 역할(role)별 사용자 목록 조회
 */
export async function getUsersByRole(role: 'partner' | 'admin' | 'user' = 'partner') {
    try {
        const conn = await dbConnect();
        if (!conn) return { success: false, error: "Database connection failed. Please check IP whitelist." };
        const users = await User.find({ role }).sort({ createdAt: -1 });

        return {
            success: true,
            users: JSON.parse(JSON.stringify(users))
        };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * 관리자용 대시보드 통계 조회
 */
export async function getAdminStats() {
    try {
        const conn = await dbConnect();
        if (!conn) return { success: false, error: "Database connection failed. Please check IP whitelist." };

        const [totalArtworks, pendingArtworks, totalArtists, pendingArtists] = await Promise.all([
            Artwork.countDocuments({}),
            Artwork.countDocuments({ status: 'pending' }),
            User.countDocuments({ role: 'partner' }),
            User.countDocuments({ role: 'user', status: 'pending' })
        ]);

        return {
            success: true,
            stats: {
                totalArtworks,
                pendingArtworks,
                totalArtists,
                pendingArtists,
                // 임시 매출 데이터 (추후 확장 가능)
                monthlyRevenue: 12500000
            }
        };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
/**
 * 신규 작가(파트너) 등록
 */
export async function createArtist(data: any) {
    try {
        const conn = await dbConnect();
        if (!conn) return { success: false, error: "Database connection failed. Please check IP whitelist." };

        // 이메일이 없는 경우 가상 이메일 생성
        let emailToUse = data.email;
        if (!emailToUse || emailToUse.trim() === '') {
            const timestamp = Date.now();
            const randomStr = Math.random().toString(36).substring(2, 8);
            emailToUse = `no_email_${timestamp}_${randomStr}@artsfactory.internal`;
        } else {
            // 이메일 중복 체크 (이메일이 있는 경우에만)
            const existingUser = await User.findOne({ email: emailToUse });
            if (existingUser) {
                return { success: false, error: "이미 등록된 이메일 주소입니다." };
            }
        }

        // 비밀번호는 임시로 설정하거나 추후 이메일 인증을 통해 설정하도록 비워둡니다 (필요시 임시비번 생성)
        const newUser = await User.create({
            ...data,
            email: emailToUse,
            role: 'partner',
        });

        revalidatePath('/admin');
        revalidatePath('/artists');

        return { success: true, user: JSON.parse(JSON.stringify(newUser)) };
    } catch (error: any) {
        console.error("Error creating artist:", error);
        return { success: false, error: error.message };
    }
}

// 5. 파트너 신청 승인/거절
export async function updatePartnerStatus(id: string, status: 'approved' | 'rejected') {
    try {
        await dbConnect();

        const updateData: any = { status };
        if (status === 'approved') {
            updateData.role = 'partner';
        }

        const user = await User.findByIdAndUpdate(id, updateData, { new: true });
        if (!user) return { success: false, error: 'User not found' };

        // 알림 생성
        await createNotification({
            recipient_id: id,
            type: status === 'approved' ? 'artwork_approval' : 'artwork_rejection', // 기존 타입 재사용 혹은 신규 정의
            title: status === 'approved' ? '파트너 승인이 완료되었습니다!' : '파트너 신청이 반려되었습니다.',
            message: status === 'approved'
                ? '이제 아티스트 대시보드에서 작품을 등록하실 수 있습니다.'
                : '신청 내용을 보완하여 다시 신청해 주시기 바랍니다.',
            link: status === 'approved' ? '/partner' : '/partner/join'
        });

        revalidatePath('/admin');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * 매거진 추천 상태 토글
 */
export async function toggleMagazineFeatured(id: string, isFeatured: boolean) {
    try {
        const conn = await dbConnect();
        if (!conn) return { success: false, error: "Database connection failed. Please check IP whitelist." };

        const magazine = await Magazine.findByIdAndUpdate(id, { isFeatured }, { new: true });

        if (!magazine) return { success: false, error: 'Magazine not found' };

        revalidatePath('/admin');
        revalidatePath('/magazine');
        revalidatePath('/');

        return { success: true, magazine: JSON.parse(JSON.stringify(magazine)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * 작가 정보 수정
 */
export async function updateArtist(id: string, data: any) {
    try {
        const conn = await dbConnect();
        if (!conn) return { success: false, error: "Database connection failed. Please check IP whitelist." };

        // 이메일 변경 시 중복 체크 (자신의 이메일은 제외)
        if (data.email) {
            const existingUser = await User.findOne({ email: data.email, _id: { $ne: id } });
            if (existingUser) {
                return { success: false, error: "이미 등록된 이메일 주소입니다." };
            }
        }

        const updatedUser = await User.findByIdAndUpdate(id, data, { new: true });

        if (!updatedUser) return { success: false, error: "작가를 찾을 수 없습니다." };

        revalidatePath('/admin');
        revalidatePath('/artists');

        return { success: true, user: JSON.parse(JSON.stringify(updatedUser)) };
    } catch (error: any) {
        console.error("Error updating artist:", error);
        return { success: false, error: error.message };
    }
}
