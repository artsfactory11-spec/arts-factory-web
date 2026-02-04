"use client";

import React, { useState } from 'react';
import {
    Check,
    X,
    Star,
    Download,
    Search,
    Filter,
    ExternalLink,
    MoreHorizontal,
    Loader2,
    Edit3,
    Trash2
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { updateArtworkStatus, toggleArtworkCurated } from '@/app/actions/admin';
import { deleteArtwork } from '@/app/actions/artwork';
import { storage } from '@/lib/firebase';
import { ref, deleteObject } from 'firebase/storage';

interface AdminArtworkListViewProps {
    initialArtworks: any[];
    onEdit?: (artwork: any) => void;
}

const AdminArtworkListView = ({ initialArtworks, onEdit }: AdminArtworkListViewProps) => {
    const [artworks, setArtworks] = useState(initialArtworks);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const filteredArtworks = artworks.filter(art => {
        const matchesSearch = art.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            art.artist_id?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || art.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
        setLoadingId(id);
        try {
            const res = await updateArtworkStatus(id, status);
            if (res.success) {
                setArtworks(prev => prev.map(art => art._id === id ? { ...art, status } : art));
            }
        } finally {
            setLoadingId(null);
        }
    };

    const handleToggleCurated = async (id: string, isCurated: boolean) => {
        const res = await toggleArtworkCurated(id, isCurated);
        if (res.success) {
            setArtworks(prev => prev.map(art => art._id === id ? { ...art, isCurated } : art));
        }
    };

    const handleDelete = async (artwork: any) => {
        if (!confirm('정말로 이 작품을 삭제하시겠습니까? 관련 이미지 파일도 함께 삭제됩니다.')) return;

        setLoadingId(artwork._id);
        try {
            // 1. Delete image from Firebase Storage if path exists
            if (artwork.firebase_storage_path) {
                try {
                    const storageRef = ref(storage, artwork.firebase_storage_path);
                    await deleteObject(storageRef);
                } catch (error) {
                    console.error("Firebase image deletion failed:", error);
                    // Continue even if image deletion fails (it might have been deleted manually)
                }
            }

            // 2. Delete from DB
            const res = await deleteArtwork(artwork._id);
            if (res.success) {
                setArtworks(prev => prev.filter(art => art._id !== artwork._id));
            } else {
                alert('작품 삭제에 실패했습니다: ' + res.error);
            }
        } finally {
            setLoadingId(null);
        }
    };

    const exportToExcel = () => {
        const exportData = filteredArtworks.map(art => ({
            '작품명': art.title,
            '작가': art.artist_id?.name || '미정',
            '카테고리': art.category,
            '호수': art.size || '-',
            '제작연도': art.year || '-',
            '재료': art.material || '-',
            '판매가': art.price,
            '월렌탈료': art.rental_price,
            '상태': art.status === 'approved' ? '승인' : art.status === 'rejected' ? '거절' : '대기',
            '추천여부': art.isCurated ? 'Y' : 'N',
            '등록일': new Date(art.createdAt).toLocaleDateString()
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "작품목록");
        XLSX.writeFile(workbook, `ArtsFactory_Admin_Artworks_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Control Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                    <div className="relative flex-1 max-w-md group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-black transition-colors" />
                        <input
                            type="text"
                            placeholder="작품명 또는 작가명 검색"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all shadow-sm"
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e: any) => setStatusFilter(e.target.value)}
                            className="pl-12 pr-10 py-3 bg-white border border-gray-100 rounded-2xl text-sm focus:outline-none focus:border-black transition-all shadow-sm appearance-none cursor-pointer"
                        >
                            <option value="all">전체 상태</option>
                            <option value="pending">승인 대기</option>
                            <option value="approved">승인 완료</option>
                            <option value="rejected">거절됨</option>
                        </select>
                    </div>
                </div>

                <button
                    onClick={exportToExcel}
                    className="flex items-center gap-2 px-6 py-3 border border-gray-200 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all active:scale-95"
                >
                    <Download className="w-4 h-4" /> 엑셀 내보내기
                </button>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-50">
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">작품 정보</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">작가</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">가격 정보 (판매/렌탈)</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">큐레이션</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">상태</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">작업</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredArtworks.map((art) => (
                                <tr key={art._id} className="hover:bg-gray-50/30 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-xl overflow-hidden shadow-sm flex-shrink-0 bg-gray-50 border border-gray-100">
                                                <img src={art.firebase_image_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 text-sm">{art.title}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{art.category}</span>
                                                    <span className="w-1 h-1 bg-gray-200 rounded-full" />
                                                    <span className="text-[10px] text-gray-400 font-medium">{art.size}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-sm font-medium text-gray-600">
                                        {art.artist_id?.name || 'Unknown'}
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="space-y-0.5">
                                            <p className="text-sm font-black text-gray-900">₩{art.price?.toLocaleString()}</p>
                                            <p className="text-[10px] font-bold text-blue-500">월 ₩{art.rental_price?.toLocaleString()}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <button
                                            onClick={() => handleToggleCurated(art._id, !art.isCurated)}
                                            className={`p-2 rounded-xl transition-all shadow-sm mx-auto flex items-center justify-center ${art.isCurated
                                                    ? 'bg-yellow-50 text-yellow-400 border border-yellow-100'
                                                    : 'bg-gray-50 text-gray-300 border border-gray-100 hover:text-gray-500 hover:bg-gray-100'
                                                }`}
                                        >
                                            <Star fill={art.isCurated ? "currentColor" : "none"} className="w-5 h-5" strokeWidth={art.isCurated ? 0 : 2} />
                                        </button>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border ${art.status === 'approved' ? 'bg-green-50 text-green-600 border-green-100' :
                                            art.status === 'rejected' ? 'bg-red-50 text-red-600 border-red-100' :
                                                'bg-yellow-50 text-yellow-600 border-yellow-100'
                                            }`}>
                                            {art.status === 'approved' ? '승인됨' : art.status === 'rejected' ? '거절됨' : '대기 중'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {art.status === 'pending' || art.status === 'rejected' ? (
                                                <button
                                                    onClick={() => handleUpdateStatus(art._id, 'approved')}
                                                    className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all shadow-sm"
                                                    title="승인"
                                                >
                                                    {loadingId === art._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                                </button>
                                            ) : null}
                                            {art.status === 'pending' || art.status === 'approved' ? (
                                                <button
                                                    onClick={() => handleUpdateStatus(art._id, 'rejected')}
                                                    className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                                    title="거절"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            ) : null}
                                            {onEdit && (
                                                <button
                                                    onClick={() => onEdit(art)}
                                                    className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                    title="수정"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(art)}
                                                className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                                title="삭제"
                                                disabled={loadingId === art._id}
                                            >
                                                {loadingId === art._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                            </button>
                                            <button className="p-2 bg-gray-50 text-gray-400 rounded-lg hover:bg-black hover:text-white transition-all shadow-sm">
                                                <ExternalLink className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredArtworks.length === 0 && (
                    <div className="py-32 text-center text-gray-300 font-medium">
                        조건에 맞는 작품이 없습니다.
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminArtworkListView;
