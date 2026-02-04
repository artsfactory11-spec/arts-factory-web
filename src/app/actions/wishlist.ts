'use server';

import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Artwork from "@/models/Artwork";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

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

        const index = user.wishlist.indexOf(artworkId);
        if (index > -1) {
            // Remove from wishlist
            user.wishlist.splice(index, 1);
        } else {
            // Add to wishlist
            user.wishlist.push(artworkId);
        }

        await user.save();
        revalidatePath('/gallery');
        revalidatePath(`/artwork/${artworkId}`);

        return {
            success: true,
            isWished: index === -1 // Added if it wasn't there
        };
    } catch (error: any) {
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

        return {
            success: true,
            wishlist: JSON.parse(JSON.stringify(user?.wishlist || []))
        };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
