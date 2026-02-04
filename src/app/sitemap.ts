import { MetadataRoute } from 'next'
import dbConnect from "@/lib/mongodb";
import Artwork from "@/models/Artwork";
import User from "@/models/User";
import Magazine from "@/models/Magazine";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://artsfactory.co.kr'

    try {
        await dbConnect();

        // 1. 작품 정보
        const artworks = await Artwork.find({ status: 'approved' }).select('_id updatedAt');
        const artworkUrls = artworks.map((art) => ({
            url: `${baseUrl}/artwork/${art._id}`,
            lastModified: art.updatedAt || new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        }));

        // 2. 작가 정보
        const artists = await User.find({ role: 'partner', status: 'approved' }).select('_id updatedAt');
        const artistUrls = artists.map((artist) => ({
            url: `${baseUrl}/artists/${artist._id}`,
            lastModified: artist.updatedAt || new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.7,
        }));

        // 3. 매거진 정보
        const magazines = await Magazine.find({ status: 'published' }).select('_id updatedAt');
        const magazineUrls = magazines.map((mag) => ({
            url: `${baseUrl}/magazine/${mag._id}`,
            lastModified: mag.updatedAt || new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.6,
        }));

        // 4. 고정 페이지
        const staticPages = [
            '',
            '/gallery',
            '/artists',
            '/magazine',
            '/about',
        ].map((route) => ({
            url: `${baseUrl}${route}`,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 1,
        }));

        return [...staticPages, ...artworkUrls, ...artistUrls, ...magazineUrls];
    } catch (error) {
        console.error('Sitemap generation error:', error);
        return [
            {
                url: baseUrl,
                lastModified: new Date(),
                changeFrequency: 'daily',
                priority: 1,
            },
        ];
    }
}
