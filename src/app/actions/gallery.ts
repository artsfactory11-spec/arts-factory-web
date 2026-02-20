'use server';

import dbConnect from "@/lib/mongodb";
import Artwork from "@/models/Artwork";
import mongoose from "mongoose";
import "@/models/User";

interface IFilter {
    category?: string;
    style?: string;
    subject?: string;
    season?: string;
    space?: string;
    artist_id?: string;
    price_range?: string;
    size?: string;
}

export async function getArtworks({
    page = 1,
    limit = 20,
    filter = {},
    search = ''
}: {
    page?: number;
    limit?: number;
    filter?: IFilter;
    search?: string;
}) {
    try {
        await dbConnect();

        const query: Record<string, unknown> = { status: 'approved' };

        // 검색어 처리
        if (search) {
            const User = mongoose.models.User || mongoose.model('User');
            const matchingArtists = await User.find({
                role: 'partner',
                name: { $regex: search, $options: 'i' }
            }).select('_id');
            const artistIds = matchingArtists.map((a) => a._id);

            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { artist_id: { $in: artistIds } }
            ];
        }

        if (filter.category && filter.category !== 'All') query.category = filter.category;
        if (filter.style && filter.style !== 'All') query.style = filter.style;
        if (filter.subject && filter.subject !== 'All') query.subject = filter.subject;
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

        const skip = (page - 1) * limit;
        const totalCount = await Artwork.countDocuments(query);
        const artworks = await Artwork.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('artist_id', 'name');

        return {
            success: true,
            artworks: JSON.parse(JSON.stringify(artworks)),
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalCount / limit),
                totalCount,
                hasMore: page * limit < totalCount
            }
        };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
}

