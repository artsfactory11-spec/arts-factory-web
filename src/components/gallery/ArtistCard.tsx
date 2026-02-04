"use client";

import React from 'react';
import NextImage from 'next/image';
import { Instagram, Youtube, Chrome, MapPin, Palette } from 'lucide-react';
import Link from 'next/link';

interface ArtistCardProps {
    artist: {
        _id: string;
        name: string;
        artist_specialty?: string;
        artist_bio?: string;
        avatar_url?: string;
        signature_url?: string;
        activity_region?: string;
        activity_material?: string;
        instagram_url?: string;
        youtube_url?: string;
        blog_url?: string;
    };
}

const ArtistCard = ({ artist }: ArtistCardProps) => {
    return (
        <Link href={`/artists/${artist._id}`} className="group">
            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-gray-200 transition-all duration-500 flex flex-col items-center p-8 text-center h-full">
                {/* Avatar with Glow Effect on Hover */}
                <div className="relative mb-6">
                    <div className="absolute inset-0 bg-black/5 rounded-full blur-2xl group-hover:bg-black/10 transition-colors duration-500"></div>
                    <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden relative z-10 transition-transform duration-500 group-hover:scale-105 bg-gray-50">
                        <NextImage
                            src={artist.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(artist.name)}`}
                            alt={artist.name}
                            fill
                            className="object-cover"
                            sizes="128px"
                            unoptimized={!artist.avatar_url}
                            placeholder="blur"
                            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQ42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
                        />
                    </div>
                </div>

                {/* Specialty Badge */}
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 py-1 bg-gray-50 rounded-full mb-3">
                    {artist.artist_specialty || "Contemporary Artist"}
                </span>

                <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-2 group-hover:text-black transition-colors">
                    {artist.name}
                </h3>

                <p className="text-sm text-gray-500 line-clamp-2 mb-6 leading-relaxed max-w-[240px]">
                    {artist.artist_bio || "작가의 철학과 감성이 담긴 작품 세계를 만나보세요."}
                </p>

                {/* Artist Activity Quick View */}
                <div className="flex gap-4 mb-8 text-gray-400 text-xs font-medium">
                    {artist.activity_region && (
                        <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span>{artist.activity_region}</span>
                        </div>
                    )}
                    {artist.activity_material && (
                        <div className="flex items-center gap-1">
                            <Palette className="w-3 h-3" />
                            <span>{artist.activity_material}</span>
                        </div>
                    )}
                </div>

                {/* Social & Signature */}
                <div className="w-full pt-6 border-t border-gray-50 flex items-center justify-between mt-auto">
                    <div className="flex gap-2">
                        {/* 개인 SNS 제거 - 예술공장 일원화 정책 */}
                        <div className="px-3 py-1 bg-black text-white text-[8px] font-black uppercase tracking-widest rounded-full">
                            Verified Artist
                        </div>
                    </div>

                    {artist.signature_url ? (
                        <img src={artist.signature_url} alt="Signature" className="h-6 object-contain opacity-40 group-hover:opacity-80 transition-opacity" />
                    ) : (
                        <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest italic font-serif">Original Artist</span>
                    )}
                </div>
            </div>
        </Link>
    );
};

export default ArtistCard;
