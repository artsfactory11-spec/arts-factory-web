'use client';

import { getMagazines } from "@/app/actions/magazine";
import { getActiveNotices, getNoticeById } from "@/app/actions/notice";
import Link from "next/link";
import { Suspense, useState, useEffect } from "react";
import { Clock, Eye, ChevronRight } from "lucide-react";
import { useSearchParams, useRouter } from 'next/navigation';
import NoticeListView from "@/components/notice/NoticeListView";
import NoticeDetailView from "@/components/notice/NoticeDetailView";
import { IBaseNotice } from "@/models/Notice";

import { IMagazine } from "@/models/Magazine";
import Image from "next/image";

function MagazineList({ magazines }: { magazines: IMagazine[] }) {
    if (!magazines.length) {
        return (
            <div className="py-32 text-center text-gray-300">
                <p className="text-xl font-light font-serif italic">발행된 소식이 없습니다.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-20">
            {magazines.map((mag) => (
                <Link key={mag._id.toString()} href={`/magazine/${mag._id}`} className="group block">
                    <div className="aspect-[21/10] overflow-hidden rounded-[40px] mb-8 bg-gray-50 border border-gray-100 shadow-sm transition-all duration-700 group-hover:shadow-2xl group-hover:shadow-black/10 group-hover:-translate-y-2">
                        <div className="relative w-full h-full">
                            <Image
                                src={mag.thumbnail_url}
                                alt={mag.title}
                                fill
                                className="object-cover transition-transform duration-1000 group-hover:scale-110"
                            />
                        </div>
                    </div>
                    <div className="px-4 space-y-4">
                        <div className="flex items-center gap-4">
                            <span className="px-4 py-1.5 bg-black text-white text-[10px] font-black rounded-full uppercase tracking-tighter shadow-xl shadow-black/10">
                                {mag.category}
                            </span>
                            <div className="flex items-center gap-4 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {new Date(mag.createdAt).toLocaleDateString()}</span>
                                <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" /> {mag.view_count || 0}</span>
                            </div>
                        </div>
                        <h3 className="text-3xl font-bold tracking-tighter text-black group-hover:text-gray-600 transition-colors leading-tight">
                            {mag.title}
                        </h3>
                        <p className="text-gray-400 font-light line-clamp-2 text-lg leading-relaxed">
                            {(mag.content || '').replace(/<[^>]*>/g, '').substring(0, 160)}...
                        </p>
                        <div className="flex items-center gap-2 text-black font-black text-xs uppercase tracking-[0.2em] pt-2 group-hover:translate-x-2 transition-transform">
                            기사 읽기 <ChevronRight className="w-4 h-4" />
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}

function MagazineContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const tab = searchParams.get('tab') || 'magazine';
    const noticeId = searchParams.get('id');

    const [magazines, setMagazines] = useState<IMagazine[]>([]);
    const [notices, setNotices] = useState<IBaseNotice[]>([]);
    const [selectedNotice, setSelectedNotice] = useState<IBaseNotice | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            const [magRes, noticeRes] = await Promise.all([
                getMagazines(),
                getActiveNotices()
            ]);

            if (magRes.success) setMagazines(magRes.magazines);
            if (noticeRes.success) setNotices(noticeRes.notices);

            if (noticeId) {
                const res = await getNoticeById(noticeId);
                if (res.success) setSelectedNotice(res.notice);
            } else {
                setSelectedNotice(null);
            }
            setLoading(false);
        };
        loadInitialData();
    }, [noticeId]);

    const handleTabChange = (newTab: string) => {
        router.push(`/magazine?tab=${newTab}`);
    };

    const handleNoticeSelect = (id: string) => {
        router.push(`/magazine?tab=notice&id=${id}`);
    };

    const handleBackToList = () => {
        router.push(`/magazine?tab=notice`);
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-pulse">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="aspect-[21/10] bg-gray-50 rounded-[40px]" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-20">
            {/* Tab Switcher */}
            <div className="flex justify-center border-b border-gray-100">
                <div className="flex gap-20">
                    <button
                        onClick={() => handleTabChange('magazine')}
                        className={`pb-8 text-xs font-black uppercase tracking-[0.3em] transition-all relative ${tab === 'magazine' ? 'text-black' : 'text-gray-300 hover:text-gray-500'}`}
                    >
                        Magazines
                        {tab === 'magazine' && <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-black animate-in fade-in duration-500" />}
                    </button>
                    <button
                        onClick={() => handleTabChange('notice')}
                        className={`pb-8 text-xs font-black uppercase tracking-[0.3em] transition-all relative ${tab === 'notice' ? 'text-black' : 'text-gray-300 hover:text-gray-500'}`}
                    >
                        Notices
                        {tab === 'notice' && <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-black animate-in fade-in duration-500" />}
                    </button>
                </div>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
                {tab === 'magazine' ? (
                    <MagazineList magazines={magazines} />
                ) : (
                    <>
                        {selectedNotice ? (
                            <NoticeDetailView notice={selectedNotice} onBack={handleBackToList} />
                        ) : (
                            <NoticeListView notices={notices} onSelect={handleNoticeSelect} />
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default function MagazinePage() {
    return (
        <main className="min-h-screen bg-white">
            {/* Premium Header */}
            <header className="pt-60 pb-20 px-6 lg:px-12 bg-surface">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div>
                            <span className="text-[10px] font-black tracking-[0.5em] text-accent uppercase mb-6 block animate-in fade-in slide-in-from-bottom-2 duration-700">
                                아트팩토리 소식
                            </span>
                            <h1 className="text-7xl md:text-8xl font-serif font-light tracking-tighter text-black mb-10 animate-in fade-in slide-in-from-bottom-3 duration-1000">
                                컬렉티브
                            </h1>
                            <p className="max-w-xl text-xl text-gray-400 font-serif italic leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
                                예술공장이 전하는 예술가들의 이야기와 <br />
                                동시대 미술의 새로운 흐름을 제안합니다.
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <section className="px-6 lg:px-12 py-32">
                <div className="max-w-7xl mx-auto">
                    <Suspense fallback={<div>Loading...</div>}>
                        <MagazineContent />
                    </Suspense>
                </div>
            </section>
        </main>
    );
}
