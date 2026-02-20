'use client';

import { Calendar, Bell, ChevronLeft } from 'lucide-react';
import Image from 'next/image';
import { IBaseNotice } from '@/models/Notice';

interface NoticeDetailViewProps {
    notice: IBaseNotice;
    onBack: () => void;
}

export default function NoticeDetailView({ notice, onBack }: NoticeDetailViewProps) {
    return (
        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            <button
                onClick={onBack}
                className="inline-flex items-center gap-2 text-gray-400 hover:text-black transition-colors mb-12 group"
            >
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest">Back to List</span>
            </button>

            <article className="space-y-16">
                <header className="space-y-8">
                    <div className="flex items-center gap-4">
                        <span className="px-3 py-1 bg-gray-900 text-white text-[9px] font-black uppercase tracking-widest rounded-full">
                            Notice
                        </span>
                        <div className="flex items-center gap-2 text-[11px] text-gray-400 font-bold">
                            <Calendar className="w-3 h-3" />
                            {notice.createdAt ? new Date(notice.createdAt).toLocaleDateString() : '-'}
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-serif italic text-black leading-tight tracking-tight">
                        {notice.title}
                    </h1>
                </header>

                {/* Image Gallery */}
                {notice.images && notice.images.length > 0 && (
                    <div className="space-y-8">
                        {notice.images.map((img, idx) => (
                            <div key={idx} className="relative aspect-[16/9] w-full rounded-[40px] overflow-hidden bg-gray-50 shadow-sm border border-gray-100">
                                <Image
                                    src={img.url}
                                    alt={`${notice.title} image ${idx + 1}`}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        ))}
                    </div>
                )}

                <div className="prose prose-lg max-w-none">
                    <p className="text-xl text-gray-600 leading-relaxed whitespace-pre-wrap font-medium font-serif italic">
                        {notice.content}
                    </p>
                </div>
            </article>

            {/* Footer Section */}
            <div className="mt-32 pt-16 border-t border-gray-100 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 text-gray-200">
                    <Bell className="w-8 h-8" />
                </div>
                <p className="text-sm text-gray-400 font-serif italic">Arts Factory: Where Art Meets Life</p>
            </div>
        </div>
    );
}
