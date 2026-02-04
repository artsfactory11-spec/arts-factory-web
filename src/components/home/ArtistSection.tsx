"use client";

import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import ArtistCard from '../gallery/ArtistCard';

interface ArtistSectionProps {
    artists: any[];
}

const ArtistSection = ({ artists }: ArtistSectionProps) => {
    if (!artists || artists.length === 0) return null;

    return (
        <section className="py-24 bg-[#fafafa]">
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                    <div>
                        <span className="text-[10px] font-black tracking-[0.3em] text-gray-400 uppercase mb-4 block">
                            Our Visionary Creators
                        </span>
                        <h2 className="text-5xl font-extralight tracking-tighter text-black">
                            MEET THE ARTISTS
                        </h2>
                    </div>
                    <Link
                        href="/artists"
                        className="group flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-black transition-colors"
                    >
                        전체 작가 보기
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {artists.slice(0, 4).map((artist) => (
                        <ArtistCard key={artist._id} artist={artist} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ArtistSection;
