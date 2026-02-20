'use client';

import { Calendar, ChevronRight } from 'lucide-react';
import { IBaseNotice } from '@/models/Notice';

interface NoticeListViewProps {
    notices: IBaseNotice[];
    onSelect: (id: string) => void;
}

export default function NoticeListView({ notices, onSelect }: NoticeListViewProps) {
    if (!notices.length) {
        return (
            <div className="py-32 text-center text-gray-300">
                <p className="text-xl font-light font-serif italic">현재 게시된 공지사항이 없습니다.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 max-w-4xl mx-auto">
            {notices.map((notice) => (
                <button
                    key={notice._id}
                    onClick={() => notice._id && onSelect(notice._id)}
                    className="w-full text-left group bg-white p-8 rounded-[32px] border border-gray-100 hover:border-black transition-all duration-500 hover:shadow-2xl hover:shadow-black/5"
                >
                    <div className="flex items-center justify-between">
                        <div className="space-y-3">
                            <div className="flex items-center gap-4">
                                <span className="px-3 py-1 bg-gray-900 text-white text-[9px] font-black uppercase tracking-widest rounded-full">
                                    Official
                                </span>
                                <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                    <Calendar className="w-3 h-3" />
                                    {notice.createdAt ? new Date(notice.createdAt).toLocaleDateString() : '-'}
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold tracking-tight text-black group-hover:text-accent transition-colors">
                                {notice.title}
                            </h3>
                            <p className="text-gray-400 font-medium line-clamp-1 max-w-2xl">
                                {notice.content}
                            </p>
                        </div>
                        <div className="w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all duration-500">
                            <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                    </div>
                </button>
            ))}
        </div>
    );
}
