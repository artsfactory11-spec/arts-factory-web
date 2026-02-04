'use client';

import React from 'react';
import { useCompare } from '@/context/CompareContext';
import { motion } from 'framer-motion';
import { ChevronLeft, X, ShoppingCart, Heart } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function ComparePage() {
    const { compareList, removeFromCompare, clearCompare } = useCompare();

    if (compareList.length === 0) {
        return (
            <main className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-10 text-gray-200">
                    <X size={48} strokeWidth={1} />
                </div>
                <h1 className="text-4xl font-serif font-light italic mb-6">비교할 작품이 없습니다.</h1>
                <p className="text-gray-400 font-serif italic mb-12">갤러리에서 관심 있는 작품을 선택하여 비교해보세요.</p>
                <Link
                    href="/gallery"
                    className="px-12 py-5 bg-black text-white rounded-full text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform"
                >
                    Go back to Gallery
                </Link>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-white pt-32 pb-40 px-6 lg:px-12">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-12 mb-24 pb-12 border-b border-gray-100">
                    <div className="space-y-6">
                        <Link
                            href="/gallery"
                            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
                        >
                            <ChevronLeft size={14} /> Back to Gallery
                        </Link>
                        <h1 className="text-7xl font-serif font-light italic tracking-tighter">Compare Series</h1>
                        <p className="text-gray-400 font-serif italic text-xl">엄선된 작품들의 가치와 사양을 한눈에 비교해 보세요.</p>
                    </div>
                    <button
                        onClick={clearCompare}
                        className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-600 transition-colors border-b border-red-100 pb-1"
                    >
                        Clear Comparison List
                    </button>
                </div>

                {/* Compare Grid */}
                <div className={`grid gap-12 items-start`} style={{ gridTemplateColumns: `repeat(${compareList.length}, minmax(0, 1fr))` }}>
                    {compareList.map((art) => (
                        <motion.div
                            key={art._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-12 group"
                        >
                            {/* Image Section */}
                            <div className="relative aspect-[3/4] rounded-[40px] overflow-hidden bg-gray-50 shadow-2xl group-hover:-translate-y-4 transition-transform duration-700">
                                <Image
                                    src={art.firebase_image_url}
                                    alt={art.title}
                                    fill
                                    className="object-cover"
                                />
                                <button
                                    onClick={() => removeFromCompare(art._id)}
                                    className="absolute top-6 right-6 w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-black hover:bg-black hover:text-white transition-all shadow-xl"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Basic Info */}
                            <div className="space-y-4">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">{art.category}</span>
                                <h3 className="text-4xl font-serif italic tracking-tight">{art.title}</h3>
                                <p className="text-xs font-black uppercase tracking-widest text-gray-400">{art.artist_name}</p>
                            </div>

                            {/* Specs Table */}
                            <div className="space-y-8 py-10 border-y border-gray-50">
                                <div className="space-y-2">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-300">Materials</p>
                                    <p className="text-sm font-serif italic text-gray-600">{art.material || 'Mixed Media'}</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-300">Dimensions</p>
                                    <p className="text-sm font-serif italic text-gray-600">{art.size || 'Variable Sizes'}</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-300">Monthly Rental</p>
                                    <p className="text-2xl font-black italic tracking-tighter">
                                        {art.rental_price ? `₩ ${art.rental_price.toLocaleString()}` : 'Contact for Price'}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-300">Purchase Price</p>
                                    <p className="text-lg font-light text-gray-400">₩ {art.price.toLocaleString()}</p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-4">
                                <Link
                                    href={`/artwork/${art._id}`}
                                    className="w-full py-5 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-widest text-center hover:bg-zinc-800 transition-colors shadow-2xl shadow-black/20"
                                >
                                    View Details
                                </Link>
                                <div className="flex gap-4">
                                    <button className="flex-1 py-4 border border-gray-100 rounded-full flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors">
                                        <Heart size={14} className="text-accent" />
                                        <span className="text-[9px] font-black uppercase tracking-tighter">Save</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </main>
    );
}
