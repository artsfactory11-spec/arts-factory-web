'use server';

import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Artwork from "@/models/Artwork";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";

export async function toggleWishlist(artworkId: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return { success: false, error: 'Unauthorized' };
        }

        await dbConnect();
        const userId = session.user.id;

        const user = await User.findById(userId);
        if (!user) return { success: false, error: 'User not found' };

        // Ensure string comparison for ObjectId
        const index = user.wishlist.findIndex((id: any) => id.toString() === artworkId);

        let isWished = false;

        if (index > -1) {
            // Remove from wishlist
            user.wishlist.splice(index, 1);
            isWished = false;
        } else {
            // Add to wishlist
            user.wishlist.push(new mongoose.Types.ObjectId(artworkId));
            isWished = true;
        }

        await user.save();
        revalidatePath('/gallery');
        revalidatePath(`/artwork/${artworkId}`);

        return {
            success: true,
            isWished
        };
    } catch (error: any) {
        console.error("Toggle Wishlist Error:", error);
        return { success: false, error: error.message };
    }
}

export async function getWishlist() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) return { success: false, wishlist: [] };

        await dbConnect();
        const user = await User.findById(session.user.id).populate({
            path: 'wishlist',
            populate: { path: 'artist_id', select: 'name' }
        });

        // Serialize Mongoose documents
        const wishlist = JSON.parse(JSON.stringify(user?.wishlist || []));

        return {
            success: true,
            wishlist
        };
    } catch (error: any) {
        console.error("Get Wishlist Error:", error);
        return { success: false, error: error.message };
    }
}
