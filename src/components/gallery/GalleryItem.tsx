'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useState } from 'react';
import Link from 'next/link';
import { Heart, BarChart2 } from 'lucide-react';
import { toggleWishlist } from '@/app/actions/wishlist';
import { useSession } from 'next-auth/react';
import { useCompare } from '@/context/CompareContext';

interface GalleryItemProps {
    artwork: {
        _id: string;
        title: string;
        artist_name: string;
        firebase_image_url: string;
        category: string;
        price: number;
        rental_price?: number;
        rental_status?: 'available' | 'processing' | 'rented' | 'unavailable';
        isWished?: boolean;
    };
}

export default function GalleryItem({ artwork }: GalleryItemProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [isWished, setIsWished] = useState(artwork.isWished || false);
    const { data: session } = useSession();
    const { addToCompare, removeFromCompare, isInCompare } = useCompare();

    const isCompared = isInCompare(artwork._id);

    const handleWishToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!session) {
            alert('찜하기 기능을 사용하려면 로그인이 필요합니다.');
            return;
        }

        // Optimistic update
        setIsWished(!isWished);

        const res = await toggleWishlist(artwork._id);
        if (!res.success) {
            setIsWished(isWished); // Revert on failure
            alert('처리 중 오류가 발생했습니다.');
        }
    };

    const handleCompareToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isCompared) {
            removeFromCompare(artwork._id);
        } else {
            addToCompare({
                _id: artwork._id,
                title: artwork.title,
                artist_name: artwork.artist_name,
                firebase_image_url: artwork.firebase_image_url,
                category: artwork.category,
                price: artwork.price,
                rental_price: artwork.rental_price
            });
        }
    };

    return (
        <Link href={`/artwork/${artwork._id}`}>
            <motion.div
                className="relative overflow-hidden bg-white group cursor-pointer"
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
                <div className="aspect-[3/4] relative overflow-hidden bg-gray-50 border border-transparent group-hover:border-gray-50 transition-all rounded-[30px]">
                    <motion.div
                        animate={{ scale: isHovered ? 1.08 : 1 }}
                        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                        className="w-full h-full relative"
                    >
                        <Image
                            src={artwork.firebase_image_url}
                            alt={artwork.title}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                            className="object-cover"
                            placeholder="blur"
                            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
                        />
                    </motion.div>

                    {/* 제어 버튼 영역 */}
                    <div className={`absolute top-6 right-6 z-20 flex flex-col gap-3 transition-all duration-300 ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}>
                        {/* 찜하기 버튼 */}
                        <button
                            onClick={handleWishToggle}
                            title={isWished ? "찜 해제" : "찜하기"}
                            className={`p-3 rounded-full backdrop-blur-md transition-all duration-300 ${isWished
                                ? 'bg-accent text-white'
                                : 'bg-white/40 text-white hover:bg-white/60'
                                }`}
                        >
                            <Heart className={`w-4 h-4 ${isWished ? 'fill-current' : ''}`} />
                        </button>

                        {/* 비교하기 버튼 */}
                        <button
                            onClick={handleCompareToggle}
                            title={isCompared ? "비교 목록에서 제거" : "비교 목록에 추가"}
                            className={`p-3 rounded-full backdrop-blur-md transition-all duration-300 ${isCompared
                                ? 'bg-black text-white'
                                : 'bg-white/40 text-white hover:bg-white/60'
                                }`}
                        >
                            <BarChart2 className={`w-4 h-4 ${isCompared ? 'rotate-90' : ''} transition-transform`} />
                        </button>
                    </div>

                    {/* 오버레이 (마우스 호버 시 정보 노출) */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isHovered ? 1 : 0 }}
                        transition={{ duration: 0.4 }}
                        className="absolute inset-0 bg-black/30 backdrop-blur-[4px] flex flex-col justify-end p-8 text-white transition-all"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] uppercase tracking-[0.3em] opacity-80">{artwork.category}</span>
                            {artwork.rental_status && artwork.rental_status !== 'available' && (
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${artwork.rental_status === 'rented' ? 'bg-red-500 text-white' :
                                    artwork.rental_status === 'processing' ? 'bg-yellow-500 text-black' :
                                        'bg-gray-500 text-white'
                                    }`}>
                                    {artwork.rental_status === 'rented' ? 'Rented' :
                                        artwork.rental_status === 'processing' ? 'Reserved' : 'Sold Out'}
                                </span>
                            )}
                        </div>
                        <h3 className="text-xl font-light leading-tight mb-1 font-serif italic">{artwork.title}</h3>
                        <p className="text-sm opacity-90 font-extralight tracking-widest uppercase mb-4">{artwork.artist_name}</p>

                        <div className="flex flex-col border-t border-white/20 pt-4 gap-1">
                            {artwork.rental_price && (
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-extralight uppercase">월 렌탈료</span>
                                    <span className="text-sm font-light">₩ {artwork.rental_price.toLocaleString()}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center opacity-80">
                                <span className="text-[10px] font-extralight uppercase">구매가</span>
                                <span className="text-sm font-light">₩ {artwork.price.toLocaleString()}</span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* 하단 텍스트 정보 (모바일 및 기본 상태 가독성) */}
                <div className="mt-5 space-y-2 px-2">
                    <div className="flex justify-between items-start">
                        <h3 className="text-lg font-serif italic text-black leading-none">{artwork.title}</h3>
                        <span className="text-[9px] font-black tracking-widest text-gray-300 uppercase shrink-0 pt-0.5">
                            {artwork.category}
                        </span>
                    </div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-black">{artwork.artist_name}</p>
                    <p className="text-xs text-black font-medium pt-1">
                        <span className="text-gray-400 font-light mr-1">월</span>
                        ₩ {artwork.rental_price ? `${artwork.rental_price.toLocaleString()}` : artwork.price.toLocaleString()}
                    </p>
                </div>
            </motion.div>
        </Link>
    );
}
