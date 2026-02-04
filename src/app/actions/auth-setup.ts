'use server'

import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function seedAdmin() {
    try {
        await dbConnect();

        const adminEmail = 'artrental@artsfactory.co.kr';
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log("Admin already exists. Updating password...");
            const hashedPassword = await bcrypt.hash('dks753852!', 10);
            await User.updateOne({ email: adminEmail }, { password: hashedPassword, role: 'admin', isApproved: true, status: 'approved' });
            return { success: true, message: "Admin password updated" };
        }

        const hashedPassword = await bcrypt.hash('dks753852!', 10);
        await User.create({
            name: 'Administrator',
            email: adminEmail,
            password: hashedPassword,
            role: 'admin',
            isApproved: true,
            status: 'approved'
        });

        return { success: true, message: "Admin seeded successfully" };
    } catch (error: any) {
        console.error("Seed error:", error);
        return { success: false, error: error.message };
    }
}
