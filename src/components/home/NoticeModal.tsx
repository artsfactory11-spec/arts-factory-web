'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Bell } from 'lucide-react';
import { getActiveNotices } from '@/app/actions/notice';
import { INotice } from '@/models/Notice';

export default function NoticeModal() {
    const [notices, setNotices] = useState<INotice[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const checkNotices = async () => {
            // 오늘 하루 보지 않기 체크
            const dontShowUntil = localStorage.getItem('hideNoticeUntil');
            if (dontShowUntil && new Date(dontShowUntil) > new Date()) return;

            const res = await getActiveNotices();
            if (res.success && res.notices.length > 0) {
                setNotices(res.notices);
                setIsVisible(true);
            }
        };
        checkNotices();
    }, []);

    const hideForToday = () => {
        const until = new Date();
        until.setHours(until.getHours() + 24);
        localStorage.setItem('hideNoticeUntil', until.toISOString());
        setIsVisible(false);
    };

    if (!isVisible || notices.length === 0) return null;

    const currentNotice = notices[currentIndex];
    const hasImage = currentNotice.images && currentNotice.images.length > 0;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-[400px] bg-white rounded-[40px] shadow-2xl overflow-hidden"
                >
                    {/* Header with Close */}
                    <div className="absolute top-6 right-6 z-20">
                        <button
                            onClick={() => setIsVisible(false)}
                            title="공지사항 닫기"
                            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white hover:text-black transition-all flex items-center justify-center border border-white/30"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <Link href={`/magazine?tab=notice&id=${currentNotice._id}`} className="block group">
                        {hasImage ? (
                            <div className="aspect-[4/5] relative bg-gray-100 overflow-hidden">
                                <Image
                                    src={currentNotice.images[0].url}
                                    alt={currentNotice.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                <div className="absolute bottom-10 left-10 right-10">
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent mb-3 block">NOTICE</span>
                                    <h2 className="text-2xl font-serif italic text-white leading-tight">
                                        {currentNotice.title}
                                    </h2>
                                </div>
                            </div>
                        ) : (
                            <div className="p-12 pb-16 space-y-8 min-h-[400px] flex flex-col justify-center bg-gray-900 text-white relative h-full">
                                <div className="absolute top-0 left-0 w-full h-full opacity-10">
                                    <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-accent blur-[80px]" />
                                </div>
                                <div className="relative z-10">
                                    <Bell className="w-8 h-8 text-accent mb-6" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent mb-4 block">Official Notice</span>
                                    <h2 className="text-3xl font-serif italic mb-6 leading-tight leading-relaxed">
                                        {currentNotice.title}
                                    </h2>
                                    <p className="text-sm text-gray-400 line-clamp-3 leading-relaxed">
                                        {currentNotice.content}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="p-10 pt-4 flex items-center justify-between text-black">
                            <span className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2">
                                Details
                                <ChevronRight className="w-4 h-4 text-accent transition-transform group-hover:translate-x-1" />
                            </span>
                        </div>
                    </Link>

                    {/* Bottom Toolbar */}
                    <div className="bg-gray-50 px-10 py-5 flex items-center justify-between border-t border-gray-100">
                        <button
                            onClick={hideForToday}
                            className="text-[11px] font-bold text-gray-400 hover:text-black transition-colors"
                        >
                            오늘 하루 보지 않기
                        </button>
                        {notices.length > 1 && (
                            <div className="flex gap-1.5">
                                {notices.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentIndex(idx)}
                                        title={`공지사항 ${idx + 1}로 이동`}
                                        className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentIndex ? 'bg-black w-4' : 'bg-gray-200'}`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
