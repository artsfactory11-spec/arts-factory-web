import dbConnect from "@/lib/mongodb";
import Artwork from "@/models/Artwork";
import GalleryContainer from "@/components/gallery/GalleryContainer";
import Navbar from "@/components/layout/Navbar";

export const dynamic = 'force-dynamic';

export default async function GalleryPage() {
    await dbConnect();
    const artworks = await Artwork.find({ status: 'approved' })
        .sort({ createdAt: -1 })
        .populate('artist_id', 'name');

    const formattedArtworks = JSON.parse(JSON.stringify(artworks));

    return (
        <main className="min-h-screen bg-white pt-32 pb-20">
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
                <header className="mb-20">
                    <span className="text-[10px] font-black tracking-[0.5em] text-accent uppercase mb-4 block">Archive</span>
                    <h1 className="text-6xl font-serif font-light tracking-tight italic">All Collections</h1>
                    <p className="text-gray-400 mt-6 text-lg font-serif italic max-w-xl">
                        "아트팩토리가 큐레이션한 모든 작품들을 한자리에서 만나보세요."
                    </p>
                </header>

                <GalleryContainer initialArtworks={formattedArtworks} />
            </div>
        </main>
    );
}
