'use server';

import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function registerPartner(data: {
    name: string;
    email: string;
    password: string;
    artist_specialty?: string;
    artist_bio?: string;
    activity_region?: string;
}) {
    try {
        const conn = await dbConnect();
        if (!conn) return { success: false, error: "Database connection failed." };

        // Check if user already exists
        const existingUser = await User.findOne({ email: data.email });
        if (existingUser) {
            return { success: false, error: "이미 가입된 이메일입니다." };
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(data.password, 10);

        // Create new partner user
        const newUser = await User.create({
            ...data,
            password: hashedPassword,
            role: 'partner',
            status: 'pending',
            isApproved: false
        });

        return { success: true, user: JSON.parse(JSON.stringify(newUser)) };
    } catch (error: any) {
        console.error("Error registering partner:", error);
        return { success: false, error: error.message };
    }
}

export async function updateArtistProfile(userId: string, data: {
    name?: string;
    artist_specialty?: string;
    artist_bio?: string;
    avatar_url?: string;
    signature_url?: string;
    activity_region?: string;
    activity_material?: string;
    activity_exhibitions?: string;
    instagram_url?: string;
    youtube_url?: string;
    blog_url?: string;
    tiktok_url?: string;
}) {
    try {
        const conn = await dbConnect();
        if (!conn) return { success: false, error: "Database connection failed. Please check IP whitelist." };

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: data },
            { new: true }
        );

        if (!updatedUser) {
            return { success: false, error: "User not found" };
        }

        revalidatePath('/partner');
        revalidatePath('/artists');

        return { success: true, user: JSON.parse(JSON.stringify(updatedUser)) };
    } catch (error: any) {
        console.error("Error updating artist profile:", error);
        return { success: false, error: error.message };
    }
}

export async function getArtists() {
    try {
        const conn = await dbConnect();
        if (!conn) return { success: false, error: "Database connection failed. Please check IP whitelist." };
        const artists = await User.find({ role: 'partner' }).sort({ createdAt: -1 });
        return { success: true, artists: JSON.parse(JSON.stringify(artists)) };
    } catch (error: any) {
        console.error("Error fetching artists:", error);
        return { success: false, error: error.message };
    }
}
export async function getArtistProfileById(userId: string) {
    try {
        const conn = await dbConnect();
        if (!conn) return { success: false, error: "Database connection failed." };

        const user = await User.findById(userId);
        if (!user) return { success: false, error: "Artist not found" };

        return { success: true, artist: JSON.parse(JSON.stringify(user)) };
    } catch (error: any) {
        console.error("Error fetching artist profile:", error);
        return { success: false, error: error.message };
    }
}
