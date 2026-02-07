'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GalleryItem from '@/components/gallery/GalleryItem';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ArtworkSliderProps {
    artworks: any[];
}

export default function ArtworkSlider({ artworks }: ArtworkSliderProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const itemsPerPage = 8;
    const totalPages = Math.ceil(artworks.length / itemsPerPage);

    useEffect(() => {
        if (isPaused) return;

        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % totalPages);
        }, 3000);

        return () => clearInterval(timer);
    }, [totalPages, isPaused]);

    const currentArtworks = artworks.slice(
        currentIndex * itemsPerPage,
        (currentIndex + 1) * itemsPerPage
    );

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages);
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % totalPages);
    };

    return (
        <div
            className="relative group"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div className="overflow-hidden min-h-[800px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ x: 100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -100, opacity: 0 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16"
                    >
                        {currentArtworks.map((art: any) => (
                            <GalleryItem key={art._id} artwork={{
                                ...art,
                                artist_name: art.artist_id?.name || '작가 미상'
                            }} />
                        ))}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* 인디케이터 & 컨트롤 */}
            <div className="flex items-center justify-center gap-6 mt-12">
                <button
                    onClick={handlePrev}
                    className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-black transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex gap-2">
                    {Array.from({ length: totalPages }).map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex
                                    ? 'w-8 bg-black'
                                    : 'w-1.5 bg-gray-200 hover:bg-gray-300'
                                }`}
                        />
                    ))}
                </div>

                <button
                    onClick={handleNext}
                    className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-black transition-colors"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
