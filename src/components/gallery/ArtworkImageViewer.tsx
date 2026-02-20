'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, X } from 'lucide-react';

interface ArtworkImageViewerProps {
    src: string;
    alt: string;
}

export default function ArtworkImageViewer({ src, alt }: ArtworkImageViewerProps) {
    const [isFullscreen, setIsFullscreen] = useState(false);

    // ESC 키로 닫기 기능
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsFullscreen(false);
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    // 전체화면 시 스크롤 방지
    useEffect(() => {
        if (isFullscreen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isFullscreen]);

    return (
        <>
            {/* 기본 이미지 영역 */}
            <div
                className="relative aspect-[3/4] bg-gray-50 flex items-center justify-center overflow-hidden cursor-zoom-in group"
                onClick={() => setIsFullscreen(true)}
            >
                <Image
                    src={src}
                    alt={alt}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-contain transition-transform duration-700 group-hover:scale-105"
                />

                {/* 힌트 오버레이 */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
                    <div className="p-4 bg-white/80 backdrop-blur-md rounded-full opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0 shadow-xl">
                        <Maximize2 className="w-6 h-6 text-black" />
                    </div>
                </div>
            </div>

            {/* 전체화면 오버레이 */}
            <AnimatePresence>
                {isFullscreen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-12 cursor-zoom-out"
                        onClick={() => setIsFullscreen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="relative w-full h-full"
                        >
                            <Image
                                src={src}
                                alt={alt}
                                fill
                                className="object-contain"
                                priority
                            />
                        </motion.div>

                        {/* 컨트롤 버튼 */}
                        <div className="absolute top-8 right-8 flex gap-4">
                            <button
                                className="p-4 bg-black text-white rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsFullscreen(false);
                                }}
                                title="닫기"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* 정보 텍스트 */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gray-400 text-[10px] font-bold uppercase tracking-[0.3em]">
                            Click anywhere to return
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
