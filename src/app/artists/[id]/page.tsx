export const dynamic = 'force-dynamic';

import { getArtistProfileById } from "@/app/actions/user";
import { getArtworks } from "@/app/actions/gallery";
import Link from "next/link";
import NextImage from "next/image";
import GalleryItem from "@/components/gallery/GalleryItem";
import { ChevronLeft, Instagram, Youtube, Globe, MapPin, Palette, History } from "lucide-react";
import { Metadata, ResolvingMetadata } from "next";

interface Props {
    params: { id: string };
}

export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const { id } = await params;
    const res = await getArtistProfileById(id);
    if (!res.success || !res.artist) return { title: 'Artist | Arts Factory' };

    const artist = res.artist;
    const previousImages = (await parent).openGraph?.images || [];

    return {
        title: `${artist.name} - ${artist.artist_specialty || 'Artist'} | Arts Factory`,
        description: artist.artist_bio?.substring(0, 160),
        openGraph: {
            title: artist.name,
            description: artist.artist_bio?.substring(0, 160),
            images: artist.avatar_url ? [artist.avatar_url, ...previousImages] : previousImages,
            type: 'profile',
        },
    };
}

export default async function ArtistPortfolioPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const artistRes = await getArtistProfileById(id);
    const artworkRes = await getArtworks({ filter: { artist_id: id }, limit: 100 });

    if (!artistRes.success || !artistRes.artist) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
                <h1 className="text-3xl font-black tracking-tighter mb-4 text-black text-center">작가를 찾을 수 없습니다</h1>
                <Link href="/artists" className="text-gray-400 hover:text-black transition-colors font-bold text-xs uppercase tracking-widest border-b border-transparent hover:border-black pb-1">
                    Back to Artists
                </Link>
            </div>
        );
    }

    const { artist } = artistRes;
    const artworks = artworkRes.success ? artworkRes.artworks : [];

    return (
        <main className="min-h-screen bg-white">
            {/* Minimal Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 px-6 lg:px-12 py-8 flex justify-between items-center bg-white/80 backdrop-blur-md border-b border-gray-50">
                <Link href="/artists" className="flex items-center gap-2 text-gray-400 hover:text-black transition-all font-black text-[10px] tracking-widest uppercase group">
                    <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Back to Artists
                </Link>
                <div className="flex gap-12 text-[10px] font-black tracking-widest uppercase text-gray-300">
                    <Link href="/" className="hover:text-black transition-colors">Artworks</Link>
                    <Link href="/magazine" className="hover:text-black transition-colors">Magazine</Link>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="pt-48 pb-24 px-6 lg:px-12">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row gap-20 items-center lg:items-end">
                        <div className="w-64 h-64 lg:w-80 lg:h-80 rounded-[60px] overflow-hidden shadow-2xl shadow-black/5 bg-gray-50 border border-gray-100 flex-shrink-0 relative">
                            {artist.avatar_url ? (
                                <NextImage
                                    src={artist.avatar_url}
                                    alt={artist.name}
                                    fill
                                    className="object-cover"
                                    placeholder="blur"
                                    blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-200">
                                    <Palette className="w-20 h-20" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 space-y-8 text-center lg:text-left">
                            <div className="space-y-4">
                                <span className="text-[10px] font-black tracking-[0.5em] text-accent uppercase block mb-6">Master Artist</span>
                                <h1 className="text-7xl lg:text-9xl font-serif italic tracking-tighter text-black leading-none">
                                    {artist.name}
                                </h1>
                                <p className="text-xl lg:text-3xl font-light text-gray-300 italic font-serif">
                                    {artist.artist_specialty || 'Contemporary Artist'}
                                </p>
                            </div>

                            <div className="pt-12 border-t border-gray-100 flex flex-col sm:flex-row gap-12 text-[10px] font-black tracking-widest text-gray-400 uppercase">
                                <span className="flex items-center gap-3"><MapPin className="w-4 h-4 text-black" /> {artist.activity_region || 'Seoul, Korea'}</span>
                                <span className="flex items-center gap-3"><Palette className="w-4 h-4 text-black" /> {artist.activity_material || 'Mixed Media'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Bio & Exhibitions */}
            <section className="px-6 lg:px-12 py-32 bg-[#fafafa]">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-32">
                    <div className="space-y-12">
                        <div className="space-y-6">
                            <h2 className="text-[10px] font-black tracking-[0.4em] text-gray-400 uppercase">Biography</h2>
                            <p className="text-xl font-light leading-relaxed text-gray-600 whitespace-pre-wrap">
                                {artist.artist_bio || '작가의 상세 소개가 등록되지 않았습니다.'}
                            </p>
                        </div>
                        {artist.signature_url && (
                            <div className="pt-12">
                                <img src={artist.signature_url} alt="Artist Signature" className="h-16 opacity-30 grayscale" />
                            </div>
                        )}
                    </div>

                    <div className="space-y-12">
                        <h2 className="text-[10px] font-black tracking-[0.4em] text-gray-400 uppercase">Career & Exhibitions</h2>
                        <div className="space-y-8">
                            {artist.activity_exhibitions ? (
                                <p className="text-lg font-medium leading-loose text-black whitespace-pre-wrap">
                                    {artist.activity_exhibitions}
                                </p>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[40px] border border-gray-100 text-gray-300 gap-4">
                                    <History className="w-8 h-8 opacity-20" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">No exhibitions recorded</p>
                                </div>
                            )}
                        </div>

                        {/* Art Factory Centralized Contact */}
                        <div className="flex flex-col sm:flex-row gap-6 pt-12">
                            <Link
                                href="/partner"
                                className="flex-1 px-8 py-5 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-center hover:bg-zinc-800 transition-all shadow-2xl shadow-black/20"
                            >
                                Inquire about Artist
                            </Link>
                            <a
                                href="https://instagram.com/artsfactory_official"
                                target="_blank"
                                className="px-8 py-5 bg-white border border-gray-100 text-black rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-center hover:bg-gray-50 transition-all flex items-center justify-center gap-3"
                            >
                                <Instagram size={14} /> Arts Factory Official
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Artist's Gallery */}
            <section className="px-6 lg:px-12 py-32">
                <div className="max-w-7xl mx-auto space-y-20">
                    <div className="flex flex-col items-center text-center space-y-6">
                        <span className="text-[10px] font-black tracking-[0.4em] text-gray-300 uppercase">Portfolio</span>
                        <h2 className="text-5xl font-black tracking-tighter">WORKS</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
                        {artworks.map((art: any) => (
                            <GalleryItem key={art._id} artwork={{
                                ...art,
                                artist_name: artist.name
                            }} />
                        ))}
                    </div>

                    {artworks.length === 0 && (
                        <div className="py-40 text-center">
                            <p className="text-gray-300 font-light italic">등록된 작품이 없습니다.</p>
                        </div>
                    )}
                </div>
            </section>

        </main>
    );
}
