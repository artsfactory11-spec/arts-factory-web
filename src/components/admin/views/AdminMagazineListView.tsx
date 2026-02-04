"use client";

import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    MoreHorizontal,
    Edit2,
    Trash2,
    Eye,
    Clock,
    CheckCircle2,
    XCircle,
    Star,
    Loader2
} from 'lucide-react';
import { getAllMagazinesAdmin, deleteMagazine } from '@/app/actions/magazine';
import { toggleMagazineFeatured } from '@/app/actions/admin';

interface AdminMagazineListViewProps {
    onEdit: (magazine: any) => void;
    onCreate: () => void;
}

export default function AdminMagazineListView({ onEdit, onCreate }: AdminMagazineListViewProps) {
    const [magazines, setMagazines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [loadingId, setLoadingId] = useState<string | null>(null);

    useEffect(() => {
        fetchMagazines();
    }, []);

    const fetchMagazines = async () => {
        setLoading(true);
        const res = await getAllMagazinesAdmin();
        if (res.success) {
            setMagazines(res.magazines);
        }
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (confirm('정말로 이 기사를 삭제하시겠습니까?')) {
            const res = await deleteMagazine(id);
            if (res.success) {
                fetchMagazines();
            }
        }
    };

    const handleToggleFeatured = async (id: string, isFeatured: boolean) => {
        setLoadingId(id);
        try {
            const res = await toggleMagazineFeatured(id, isFeatured);
            if (res.success) {
                setMagazines((prev: any) => prev.map((m: any) =>
                    m._id === id ? { ...m, isFeatured } : m
                ));
            }
        } finally {
            setLoadingId(null);
        }
    };

    const filteredMagazines = magazines.filter((m: any) =>
        m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-black transition-colors" />
                    <input
                        type="text"
                        placeholder="기사 제목 또는 카테고리 검색"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all shadow-sm"
                    />
                </div>
                <button
                    onClick={onCreate}
                    className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-all shadow-lg shadow-black/5 active:scale-95"
                >
                    <Plus className="w-4 h-4" /> 새 기사 작성
                </button>
            </div>

            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-50">
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">기사 정보</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">카테고리</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">조회수</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">홈 추천</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">상태</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">관리</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredMagazines.map((mag: any) => (
                                <tr key={mag._id} className="hover:bg-gray-50/30 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                                <img src={mag.thumbnail_url} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 text-sm line-clamp-1">{mag.title}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Clock className="w-3 h-3 text-gray-400" />
                                                    <span className="text-[10px] text-gray-400 font-medium">
                                                        {new Date(mag.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="px-3 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-full uppercase tracking-tighter">
                                            {mag.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Eye className="w-4 h-4 text-gray-300" />
                                            {mag.view_count || 0}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <button
                                            onClick={() => handleToggleFeatured(mag._id, !mag.isFeatured)}
                                            disabled={loadingId === mag._id}
                                            className={`p-2 rounded-xl transition-all shadow-sm mx-auto flex items-center justify-center ${mag.isFeatured
                                                    ? 'bg-yellow-50 text-yellow-400 border border-yellow-100'
                                                    : 'bg-gray-50 text-gray-300 border border-gray-100 hover:text-gray-500 hover:bg-gray-100'
                                                }`}
                                            title="홈페이지 추천 기사 노출"
                                        >
                                            {loadingId === mag._id ? (
                                                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                                            ) : (
                                                <Star fill={mag.isFeatured ? "currentColor" : "none"} className="w-5 h-5" />
                                            )}
                                        </button>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2">
                                            {mag.is_published ? (
                                                <span className="flex items-center gap-1.5 text-[10px] font-black text-green-500 uppercase tracking-widest">
                                                    <CheckCircle2 className="w-3 h-3" /> 공개 중
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1.5 text-[10px] font-black text-gray-300 uppercase tracking-widest">
                                                    <XCircle className="w-3 h-3" /> 비공개
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                            <button
                                                onClick={() => onEdit(mag)}
                                                className="p-2 bg-gray-50 text-gray-400 rounded-lg hover:bg-black hover:text-white transition-all shadow-sm"
                                                title="수정"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(mag._id)}
                                                className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                                title="삭제"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {!loading && filteredMagazines.length === 0 && (
                    <div className="py-32 text-center text-gray-300 font-medium">
                        등록된 매거진 기사가 없습니다.
                    </div>
                )}
                {loading && (
                    <div className="py-32 flex justify-center">
                        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
            </div>
        </div>
    );
}
