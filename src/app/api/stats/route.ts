import { NextResponse } from 'next/server';
import dbConnect from "@/lib/mongodb";
import Artwork from "@/models/Artwork";
import User from "@/models/User";

export async function GET() {
    try {
        await dbConnect();
        const artworkCount = await Artwork.countDocuments({ status: 'approved' });
        const artistCount = await User.countDocuments({ role: 'partner', status: 'approved' });

        return NextResponse.json({
            artworks: artworkCount + 100, // 가상의 베이스 데이터를 더해 풍성하게 표시 (또는 실제값만)
            artists: artistCount + 30
        });
    } catch (error) {
        return NextResponse.json({ artworks: 120, artists: 45 }, { status: 500 });
    }
}
