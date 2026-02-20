'use client';

import React from 'react';
import { useCompare } from '@/context/CompareContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function CompareTray() {
    const { compareList, removeFromCompare, clearCompare } = useCompare();

    if (compareList.length === 0) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] w-full max-w-4xl px-6"
            >
                <div className="bg-black text-white rounded-[40px] shadow-2xl overflow-hidden border border-white/10 backdrop-blur-xl bg-black/90">
                    <div className="px-8 py-6 flex items-center justify-between gap-8">
                        {/* Selected Count & Info */}
                        <div className="flex items-center gap-6 shrink-0">
                            <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center text-black font-black italic shadow-lg shadow-accent/20">
                                {compareList.length}
                            </div>
                            <div className="hidden sm:block">
                                <h4 className="text-sm font-bold tracking-tight">작품 비교하기</h4>
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Max 4 Artworks</p>
                            </div>
                        </div>

                        {/* Artworks List */}
                        <div className="flex-grow flex gap-4 overflow-x-auto no-scrollbar py-2">
                            {compareList.map((art) => (
                                <motion.div
                                    key={art._id}
                                    layout
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="relative group shrink-0"
                                >
                                    <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/10 bg-white/5">
                                        <Image
                                            src={art.firebase_image_url}
                                            alt={art.title}
                                            width={64}
                                            height={64}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <button
                                        onClick={() => removeFromCompare(art._id)}
                                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100"
                                        title="삭제"
                                    >
                                        <X size={12} />
                                    </button>
                                </motion.div>
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-4 shrink-0">
                            <button
                                onClick={clearCompare}
                                className="hidden lg:block text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
                            >
                                Clear All
                            </button>
                            <Link
                                href="/gallery/compare"
                                className={`flex items-center gap-3 px-8 py-4 rounded-full text-xs font-black uppercase tracking-widest transition-all ${compareList.length >= 2
                                    ? 'bg-white text-black hover:bg-gray-100 active:scale-95'
                                    : 'bg-white/10 text-white/30 cursor-not-allowed'
                                    } shadow-xl shadow-black/50`}
                            >
                                {compareList.length < 2 ? 'Select More' : 'Compare Now'}
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
