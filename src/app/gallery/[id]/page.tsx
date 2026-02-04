import dbConnect from "@/lib/mongodb";
import Artwork from "@/models/Artwork";
import { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import InquiryButtons from "@/components/gallery/InquiryButtons";
import ArtworkImageViewer from "@/components/gallery/ArtworkImageViewer";

interface Props {
    params: { id: string };
}

export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const { id } = await params;
    await dbConnect();
    const artwork = await Artwork.findById(id).populate('artist_id', 'name');

    if (!artwork) {
        return { title: '작품을 찾을 수 없습니다 | Arts Factory' };
    }

    const previousImages = (await parent).openGraph?.images || [];

    return {
        title: `${artwork.title} - ${artwork.artist_id.name} | Arts Factory`,
        description: artwork.description,
        openGraph: {
            title: artwork.title,
            description: artwork.description,
            images: [artwork.firebase_image_url, ...previousImages],
            type: 'article',
        },
    };
}

export default async function ArtworkPage({ params }: Props) {
    const { id } = await params;
    await dbConnect();
    const artwork = await Artwork.findById(id).populate('artist_id', 'name');

    if (!artwork) notFound();

    return (
        <main className="min-h-screen bg-white pt-32 pb-20 px-6 lg:px-12">
            <div className="max-w-7xl mx-auto mb-12">
                <Link
                    href="/gallery"
                    className="inline-flex items-center gap-2 text-gray-400 hover:text-black transition-all font-black text-[10px] tracking-widest uppercase group px-4 py-2 bg-gray-50 rounded-full"
                >
                    <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    Back to Collection
                </Link>
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
                <ArtworkImageViewer src={artwork.firebase_image_url} alt={artwork.title} />

                <div className="flex flex-col">
                    <div className="border-b border-gray-100 pb-8 mb-8">
                        <div className="flex justify-between items-start mb-2">
                            <h1 className="text-4xl font-serif font-light tracking-tight text-black italic">{artwork.title}</h1>
                            {artwork.year && <span className="text-gray-400 font-serif italic">{artwork.year}</span>}
                        </div>
                        <p className="text-xl text-gray-500 font-serif italic mb-4">
                            {artwork.artist_id.name}
                        </p>
                        <div className="flex gap-2">
                            <span className="text-[10px] px-3 py-1 bg-black text-white font-black uppercase tracking-widest">
                                {artwork.category}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-10 flex-grow">
                        <div>
                            <h2 className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-4 font-black">Description</h2>
                            <p className="font-serif leading-relaxed text-gray-700 whitespace-pre-wrap text-lg italic">
                                {artwork.description || "이 작품에 대한 상세 설명이 준비 중입니다."}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12">
                            {artwork.size && (
                                <div>
                                    <h2 className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-2 font-black">Size</h2>
                                    <p className="font-serif italic text-lg text-gray-800">{artwork.size}</p>
                                </div>
                            )}
                            {artwork.material && (
                                <div>
                                    <h2 className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-2 font-black">Material</h2>
                                    <p className="font-serif italic text-lg text-gray-800">{artwork.material}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-16 pt-10 border-t border-gray-100">
                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between items-baseline">
                                <span className="text-xs font-black uppercase tracking-widest text-gray-400">Ownership</span>
                                <span className="text-2xl font-serif italic text-gray-300">₩ {artwork.price.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-baseline">
                                <span className="text-xs font-black uppercase tracking-widest text-accent">Monthly Rental</span>
                                <span className="text-3xl font-serif italic text-black">₩ {artwork.rental_price.toLocaleString()}</span>
                            </div>
                        </div>

                        <InquiryButtons
                            artwork={{
                                id: id,
                                title: artwork.title,
                                artist: artwork.artist_id.name
                            }}
                        />
                    </div>
                </div>
            </div>
        </main>
    );
}
