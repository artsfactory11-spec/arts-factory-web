import dbConnect from "@/lib/mongodb";
import Artwork from "@/models/Artwork";
import { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import InquiryButtons from "@/components/gallery/InquiryButtons";
import ArtworkImageViewer from "@/components/gallery/ArtworkImageViewer";
import ShareButtons from "@/components/artwork/ShareButtons";
import React from 'react';

interface Props {
    params: { id: string };
}

// 1. 동적 SEO 메타데이터
export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const { id } = await params;
    const conn = await dbConnect();
    if (!conn) return { title: 'Arts Factory' };

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
    const conn = await dbConnect();
    if (!conn) return (
        <div className="min-h-screen flex items-center justify-center">
            <p>데이터베이스 연결이 필요합니다. 환경 변수를 설정해 주세요.</p>
        </div>
    );

    const artwork = await Artwork.findById(id).populate('artist_id', 'name');

    if (!artwork) notFound();

    return (
        <main className="min-h-screen bg-white pt-20 pb-20 px-6 lg:px-12">
            <div className="max-w-7xl mx-auto mb-12">
                <div className="flex justify-between items-center bg-gray-50/50 rounded-[40px] px-8 py-3">
                    <Link
                        href="/gallery"
                        className="inline-flex items-center gap-2 text-gray-400 hover:text-black transition-all font-black text-[10px] tracking-widest uppercase group py-2"
                    >
                        <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                        Back to Gallery
                    </Link>
                    <ShareButtons title={artwork.title} />
                </div>
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
                {/* 작품 이미지 영역 (Client Component) */}
                <ArtworkImageViewer src={artwork.firebase_image_url} alt={artwork.title} />

                {/* 작품 상세 정보 영역 */}
                <div className="flex flex-col">
                    <div className="border-b border-gray-100 pb-8 mb-8">
                        <div className="flex justify-between items-start mb-2">
                            <h1 className="text-4xl font-bold tracking-tight text-black">{artwork.title}</h1>
                            {artwork.year && <span className="text-gray-900 font-medium">{artwork.year}</span>}
                        </div>
                        <p className="text-xl text-gray-900 font-medium tracking-widest uppercase mb-4">
                            {artwork.artist_id.name}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            <span className="text-[10px] px-2.5 py-1 bg-black text-white font-black uppercase tracking-tighter">
                                {artwork.category}
                            </span>
                            {artwork.style && (
                                <span className="text-[10px] px-2.5 py-1 border border-black/10 text-gray-900 font-bold uppercase tracking-tighter">
                                    {artwork.style}
                                </span>
                            )}
                            {artwork.subject && (
                                <span className="text-[10px] px-2.5 py-1 border border-black/10 text-gray-900 font-bold uppercase tracking-tighter">
                                    {artwork.subject}
                                </span>
                            )}
                            {artwork.space && (
                                <span className="text-[10px] px-2.5 py-1 bg-gray-100 text-gray-600 font-bold uppercase tracking-tighter">
                                    {artwork.space}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="space-y-12 flex-grow">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-10 gap-x-12">
                            <div>
                                <h2 className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-4 font-black">Dimensions</h2>
                                <div className="space-y-1">
                                    <p className="font-bold text-lg text-black">
                                        {artwork.width && artwork.height ? `${artwork.width} × ${artwork.height} cm` : artwork.size}
                                    </p>
                                    {artwork.ho && (
                                        <p className="text-[11px] text-gray-400 font-medium tracking-widest">{artwork.ho}호</p>
                                    )}
                                </div>
                            </div>
                            <div>
                                <h2 className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-4 font-black">Specifications</h2>
                                <div className="space-y-3">
                                    {artwork.material && (
                                        <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                                            <span className="text-[11px] text-gray-400 font-medium">Material</span>
                                            <span className="text-xs text-black font-bold">{artwork.material}</span>
                                        </div>
                                    )}
                                    {artwork.season && artwork.season !== 'All' && (
                                        <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                                            <span className="text-[11px] text-gray-400 font-medium">Season</span>
                                            <span className="text-xs text-black font-bold">{artwork.season}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-5 font-black">Description</h2>
                            <p className="font-serif italic leading-loose text-gray-600 text-[15px] whitespace-pre-wrap max-w-lg">
                                {artwork.description || "이 작품에 대한 상세 설명이 준비 중입니다."}
                            </p>
                        </div>
                    </div>

                    <div className="mt-20 pt-12 border-t border-gray-100">
                        <div className="grid grid-cols-2 gap-8 mb-10">
                            <div className="space-y-1">
                                <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest block mb-2">Estimated Value</span>
                                <span className="text-2xl font-bold text-black opacity-30 tracking-tighter">₩ {artwork.price.toLocaleString()}</span>
                            </div>
                            <div className="space-y-1 border-l border-gray-100 pl-8">
                                <span className="text-[10px] text-accent font-black uppercase tracking-widest block mb-2">Monthly Rental</span>
                                <span className="text-3xl font-black text-black tracking-tighter">₩ {artwork.rental_price.toLocaleString()}</span>
                            </div>
                        </div>

                        {/* 렌탈 상태 표시 */}
                        {artwork.rental_status && artwork.rental_status !== 'available' && (
                            <div className={`mb-8 p-5 rounded-2xl text-center font-black text-[11px] tracking-[0.2em] uppercase shadow-sm ${artwork.rental_status === 'rented' ? 'bg-red-50 text-red-600' :
                                artwork.rental_status === 'processing' ? 'bg-yellow-50 text-yellow-600' :
                                    'bg-gray-100 text-gray-500'
                                }`}>
                                {artwork.rental_status === 'rented' ? 'Sold Out / Rented' :
                                    artwork.rental_status === 'processing' ? 'In Negotiation' : 'Currently Unavailable'}
                            </div>
                        )}

                        {(!artwork.rental_status || artwork.rental_status === 'available') ? (
                            <InquiryButtons
                                artwork={{
                                    id: id,
                                    title: artwork.title,
                                    artist: artwork.artist_id.name
                                }}
                            />
                        ) : (
                            <button
                                disabled
                                className="w-full py-4 bg-gray-200 text-gray-400 rounded-full font-bold cursor-not-allowed"
                            >
                                {artwork.rental_status === 'rented' ? 'RENTED OUT' : 'UNAVAILABLE'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}

