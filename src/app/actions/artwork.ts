'use strict';
'use server';

import dbConnect from "@/lib/mongodb";
import Artwork from "@/models/Artwork";
import { revalidatePath } from "next/cache";

export async function createArtwork(data: {
    title: string;
    description: string;
    artist_id: string;
    category: string;
    season?: string;
    space?: string;
    size?: string;
    year?: string;
    material?: string;
    price: number;
    rental_price: number;
    firebase_image_url: string;
    firebase_storage_path: string;
    vr_url?: string;
    status?: string;
}) {
    try {
        await dbConnect();

        const artwork = await Artwork.create({
            ...data,
            status: data.status || 'pending',
            isCurated: false
        });

        revalidatePath('/');
        revalidatePath('/partner');

        return { success: true, artwork: JSON.parse(JSON.stringify(artwork)) };
    } catch (error: any) {
        console.error("Error creating artwork:", error);
        return { success: false, error: error.message };
    }
}

export async function getArtworks(filter: { artist_id?: string } = {}) {
    try {
        await dbConnect();
        const artworks = await Artwork.find(filter)
            .sort({ createdAt: -1 })
            .populate('artist_id', 'name');

        return { success: true, artworks: JSON.parse(JSON.stringify(artworks)) };
    } catch (error: any) {
        console.error("Error fetching artworks:", error);
        return { success: false, error: error.message };
    }
}
export async function updateArtwork(id: string, data: any) {
    try {
        await dbConnect();
        const artwork = await Artwork.findByIdAndUpdate(id, data, { new: true });
        revalidatePath('/');
        revalidatePath(`/artwork/${id}`);
        revalidatePath('/admin');
        return { success: true, artwork: JSON.parse(JSON.stringify(artwork)) };
    } catch (error: any) {
        console.error("Error updating artwork:", error);
        return { success: false, error: error.message };
    }
}

export async function deleteArtwork(id: string) {
    try {
        await dbConnect();
        await Artwork.findByIdAndDelete(id);

        revalidatePath('/');
        revalidatePath('/admin');
        revalidatePath('/partner');

        return { success: true };
    } catch (error: any) {
        console.error("Error deleting artwork:", error);
        return { success: false, error: error.message };
    }
}

/**
 * 파트너용 대시보드 통계 조회
 */
export async function getPartnerStats(artist_id: string) {
    try {
        await dbConnect();
        const [total, approved, pending, rejected] = await Promise.all([
            Artwork.countDocuments({ artist_id }),
            Artwork.countDocuments({ artist_id, status: 'approved' }),
            Artwork.countDocuments({ artist_id, status: 'pending' }),
            Artwork.countDocuments({ artist_id, status: 'rejected' }),
        ]);

        return {
            success: true,
            stats: { total, approved, pending, rejected }
        };
    } catch (error: any) {
        console.error("Error fetching partner stats:", error);
        return { success: false, error: error.message };
    }
}

