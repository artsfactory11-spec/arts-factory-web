import dbConnect from "@/lib/mongodb";
import Artwork from "@/models/Artwork";
import { Metadata, ResolvingMetadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, X } from "lucide-react";
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
                        <div className="flex gap-2">
                            <span className="text-[10px] px-2 py-1 bg-gray-200 text-gray-900 font-bold uppercase tracking-tighter">
                                {artwork.category}
                            </span>
                            {artwork.space && (
                                <span className="text-[10px] px-2 py-1 bg-gray-100 text-gray-700 font-bold uppercase tracking-tighter">
                                    {artwork.space}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="space-y-10 flex-grow">
                        <div>
                            <h2 className="text-[11px] uppercase tracking-[0.2em] text-gray-400 mb-4 font-medium">DESCRIPTION</h2>
                            <p className="font-light leading-relaxed text-gray-700 whitespace-pre-wrap">
                                {artwork.description || "이 작품에 대한 상세 설명이 준비 중입니다."}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12">
                            {artwork.size && (
                                <div>
                                    <h2 className="text-[11px] uppercase tracking-[0.2em] text-gray-900 mb-2 font-bold">SIZE</h2>
                                    <p className="font-medium text-sm text-gray-800">{artwork.size}</p>
                                </div>
                            )}
                            {artwork.material && (
                                <div>
                                    <h2 className="text-[11px] uppercase tracking-[0.2em] text-gray-900 mb-2 font-bold">MATERIAL</h2>
                                    <p className="font-medium text-sm text-gray-800">{artwork.material}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-16 pt-10 border-t border-gray-100">
                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between items-baseline">
                                <span className="text-sm text-gray-900 font-medium">판매가</span>
                                <span className="text-2xl font-bold text-black opacity-40">₩ {artwork.price.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-baseline">
                                <span className="text-sm text-gray-900 font-bold">월 대여료</span>
                                <span className="text-2xl font-black text-black">₩ {artwork.rental_price.toLocaleString()}</span>
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

