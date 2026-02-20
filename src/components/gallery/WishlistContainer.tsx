'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, ShoppingBag, Heart, ChevronRight } from 'lucide-react';
import { toggleWishlist } from '@/app/actions/wishlist';

interface WishlistItem {
    _id: string;
    title: string;
    artist_id: {
        _id: string;
        name: string;
    };
    firebase_image_url: string;
    price: number;
    rental_price: number;
    category: string;
}

export default function WishlistContainer({ initialWishlist }: { initialWishlist: WishlistItem[] }) {
    const [wishlist, setWishlist] = useState<WishlistItem[]>(initialWishlist);
    const [isRemoving, setIsRemoving] = useState<string | null>(null);

    const totals = wishlist.reduce((acc, item) => {
        return {
            purchase: acc.purchase + (item.price || 0),
            rental: acc.rental + (item.rental_price || 0)
        };
    }, { purchase: 0, rental: 0 });

    const handleRemove = async (id: string) => {
        setIsRemoving(id);
        const res = await toggleWishlist(id);
        if (res.success && !res.isWished) {
            setWishlist(prev => prev.filter(item => item._id !== id));
        }
        setIsRemoving(null);
    };

    if (wishlist.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-8">
                    <Heart className="w-10 h-10 text-gray-200" />
                </div>
                <h2 className="text-3xl font-serif italic text-black mb-4">위시리스트가 비어 있습니다.</h2>
                <p className="text-gray-400 mb-10 max-w-sm">마음에 드는 작품을 찜하여 나만의 컬렉션을 만들어보세요.</p>
                <Link
                    href="/gallery"
                    className="px-10 py-4 bg-black text-white rounded-full font-bold text-sm tracking-widest uppercase hover:bg-accent transition-all duration-500"
                >
                    작품 보러가기
                </Link>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            {/* Wishlist Items */}
            <div className="lg:col-span-2 space-y-8">
                <div className="flex justify-between items-end border-b border-black pb-6">
                    <h2 className="text-sm font-black uppercase tracking-[0.3em] text-gray-400">My Collection ({wishlist.length})</h2>
                </div>

                <div className="space-y-6">
                    <AnimatePresence mode="popLayout">
                        {wishlist.map((item) => (
                            <motion.div
                                key={item._id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="group flex flex-col sm:flex-row gap-6 p-6 bg-white border border-gray-100 rounded-[30px] hover:shadow-xl hover:shadow-gray-100 transition-all duration-500 relative"
                            >
                                <div className="w-full sm:w-40 aspect-[4/5] relative rounded-2xl overflow-hidden bg-gray-50 shrink-0">
                                    <Image
                                        src={item.firebase_image_url}
                                        alt={item.title}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                </div>

                                <div className="flex-grow flex flex-col justify-between py-2">
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-accent">{item.category}</span>
                                            <button
                                                onClick={() => handleRemove(item._id)}
                                                disabled={isRemoving === item._id}
                                                className="text-gray-300 hover:text-red-500 transition-colors p-2"
                                                title="삭제"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <h3 className="text-2xl font-serif italic text-black mb-1">
                                            <Link href={`/artwork/${item._id}`} className="hover:text-accent transition-colors">
                                                {item.title}
                                            </Link>
                                        </h3>
                                        <p className="text-xs text-gray-400 font-black uppercase tracking-widest">{item.artist_id?.name}</p>
                                    </div>

                                    <div className="mt-6 flex flex-wrap gap-x-10 gap-y-4">
                                        <div className="space-y-1">
                                            <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest block">Purchase Price</span>
                                            <span className="text-lg font-bold text-black opacity-30">₩ {item.price?.toLocaleString()}</span>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest block">Monthly Rental</span>
                                            <span className="text-lg font-black text-black">₩ {item.rental_price?.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* Price Summary (Sidebar) */}
            <div className="lg:col-span-1">
                <div className="sticky top-32 space-y-8">
                    <div className="bg-gray-900 rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl">
                        {/* Decorative Background */}
                        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                            <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-accent blur-[80px]" />
                        </div>

                        <div className="relative z-10 space-y-10">
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-[0.4em] text-accent mb-8">Order Summary</h3>
                                <div className="space-y-6">
                                    <div className="flex justify-between items-end border-b border-white/10 pb-4">
                                        <span className="text-[11px] font-medium text-gray-400 uppercase tracking-widest">Total Value</span>
                                        <div className="text-right">
                                            <span className="text-xs text-gray-500 line-through block mb-1">₩ {totals.purchase.toLocaleString()}</span>
                                            <span className="text-xl font-bold opacity-30">₩ {totals.purchase.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <span className="text-[11px] font-black text-white uppercase tracking-widest">Monthly Total</span>
                                        <span className="text-3xl font-black text-accent tracking-tighter">₩ {totals.rental.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            <Link
                                href="/inquiry"
                                className="w-full py-5 bg-white text-black rounded-full font-black text-sm tracking-[0.2em] uppercase flex items-center justify-center gap-3 hover:bg-accent hover:text-white transition-all duration-500 group"
                            >
                                <ShoppingBag className="w-4 h-4" />
                                Bulk Inquiry
                                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>

                            <p className="text-[10px] text-gray-500 text-center leading-relaxed px-4">
                                * 대량 렌탈 및 구매 문의 시 추가 혜택이 적용될 수 있습니다. 문의하기를 통해 전문 큐레이터의 상담을 받아보세요.
                            </p>
                        </div>
                    </div>

                    {/* Additional Info Card */}
                    <div className="bg-gray-50 rounded-[40px] p-8 border border-gray-100 italic font-serif">
                        <p className="text-sm text-gray-500 leading-loose">
                            &quot;예술은 우리의 영혼에 묻은 일상의 먼지를 닦아준다.&quot; <br />
                            <span className="text-xs text-gray-400 mt-4 block not-italic font-sans font-bold uppercase tracking-widest">— Pablo Picasso</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
