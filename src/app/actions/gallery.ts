'use server';

import dbConnect from "@/lib/mongodb";
import Artwork from "@/models/Artwork";
import mongoose from "mongoose";
import "@/models/User";

export async function getArtworks({
    cursor = '',
    limit = 12,
    filter = {},
    search = ''
}: {
    cursor?: string,
    limit?: number,
    filter?: any,
    search?: string
}) {
    try {
        await dbConnect();

        let query: any = { status: 'approved' };

        // 커서 처리 (createdAt 기준 내림차순이므로 $lt 사용)
        if (cursor) {
            const lastArtwork = await Artwork.findById(cursor);
            if (lastArtwork) {
                query.createdAt = { $lt: lastArtwork.createdAt };
            }
        }

        // 검색어 처리
        if (search) {
            const User = mongoose.models.User || mongoose.model('User');
            const matchingArtists = await User.find({
                role: 'partner',
                name: { $regex: search, $options: 'i' }
            }).select('_id');
            const artistIds = matchingArtists.map((a: any) => a._id);

            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { artist_id: { $in: artistIds } }
            ];
        }

        if (filter.category && filter.category !== 'All') query.category = filter.category;
        if (filter.season && filter.season !== 'All') query.season = filter.season;
        if (filter.space && filter.space !== 'All') query.space = filter.space;
        if (filter.artist_id) query.artist_id = filter.artist_id;

        // Price range filtering
        if (filter.price_range && filter.price_range !== 'All') {
            const [min, max] = filter.price_range.split('-').map(Number);
            if (max) {
                query.price = { $gte: min, $lte: max };
            } else {
                query.price = { $gte: min };
            }
        }

        // Size filtering
        if (filter.size && filter.size !== 'All') {
            if (filter.size === 'S') query.size = { $regex: /^[0-9]$|^10$/, $options: 'i' };
            else query.size = filter.size;
        }

        const artworks = await Artwork.find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate('artist_id', 'name');

        return {
            success: true,
            artworks: JSON.parse(JSON.stringify(artworks)),
            nextCursor: artworks.length === limit ? artworks[artworks.length - 1]._id : null
        };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

