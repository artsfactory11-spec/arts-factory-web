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

export interface FilterParams {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    status?: string | string[];
    sort?: string;
    search?: string;
    artist_id?: string;
}

export async function getArtworks(params: FilterParams = {}) {
    try {
        await dbConnect();

        // Base query
        const query: any = {};

        // Status Filter
        if (params.status) {
            if (Array.isArray(params.status)) {
                query.status = { $in: params.status };
            } else if (params.status !== 'all') {
                query.status = params.status;
            }
        } else {
            // Default to approved if not specified, unless strictly querying something else?
            // Actually, existing usage might expect all if param empty?
            // Previous code: `Artwork.find(filter)` where filter default was {}.
            // If I change default, it affects callers.
            // BUT, for Gallery Page, we want only 'approved'.
            // Let's NOT force default here, caller must specify.
        }

        if (params.artist_id) {
            query.artist_id = params.artist_id;
        }

        if (params.category && params.category !== 'all') {
            query.category = params.category;
        }

        if (params.minPrice || params.maxPrice) {
            query.price = {};
            if (params.minPrice) query.price.$gte = Number(params.minPrice);
            if (params.maxPrice) query.price.$lte = Number(params.maxPrice);
        }

        if (params.search) {
            query.$or = [
                { title: { $regex: params.search, $options: 'i' } },
                { description: { $regex: params.search, $options: 'i' } },
            ];
        }

        let sortOption: any = { createdAt: -1 };
        if (params.sort === 'price_asc') sortOption = { price: 1 };
        if (params.sort === 'price_desc') sortOption = { price: -1 };

        const artworks = await Artwork.find(query)
            .sort(sortOption)
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
