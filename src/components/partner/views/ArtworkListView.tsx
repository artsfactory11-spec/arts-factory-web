"use client";

import React, { useEffect, useState } from 'react';
import { getArtworks } from '@/app/actions/artwork';
import {
    MoreVertical,
    ExternalLink,
    Edit2,
    Trash2,
    Search,
    Filter,
    Eye,
    Calendar,
    Tag
} from 'lucide-react';

const ArtworkListView = ({ artistId, onNewClick }: { artistId: string, onNewClick: () => void }) => {
    const [artworks, setArtworks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArtworks = async () => {
            const result = await getArtworks({ artist_id: artistId });
            if (result.success) {
                setArtworks(result.artworks);
            }
            setLoading(false);
        };
        fetchArtworks();
    }, [artistId]);


    if (loading) {
        return (
            <div className="w-full h-64 flex flex-col items-center justify-center gap-4">
                <div className="w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
                <p className="text-gray-400 font-medium">작품 목록을 불러오는 중...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Search and Filter bar */}
            <div className="bg-white p-4 rounded-2xl border border-gray-50 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="작품명 또는 카테고리 검색"
                        className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-black transition-all"
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                        <Filter className="w-4 h-4" /> 필터
                    </button>
                    <button
                        onClick={onNewClick}
                        className="flex-1 md:flex-none px-6 py-2.5 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors active:scale-95"
                    >
                        신규 등록
                    </button>
                </div>
            </div>

            {/* Artworks List */}
            <div className="bg-white rounded-2xl border border-gray-50 shadow-sm overflow-hidden">
                {artworks.length === 0 ? (
                    <div className="py-32 flex flex-col items-center justify-center text-gray-300">
                        <Tag className="w-16 h-16 mb-4 opacity-10" />
                        <p className="text-lg font-medium">등록된 작품이 없습니다.</p>
                        <p className="text-sm">먼저 첫 번째 작품을 등록해보세요!</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-50">
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">작품 정보</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">상태</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">판매가 / 렌탈료</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">등록일</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">관리</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {artworks.map((art) => (
                                    <tr key={art._id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100 shadow-sm">
                                                    <img src={art.firebase_image_url} alt={art.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900 line-clamp-1">{art.title}</h4>
                                                    <p className="text-xs text-gray-400 mt-0.5">{art.category} • {art.size || '사이즈 미정'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${art.status === 'approved' ? 'bg-green-50 text-green-600' :
                                                art.status === 'pending' ? 'bg-orange-50 text-orange-600' : 'bg-gray-50 text-gray-600'
                                                }`}>
                                                {art.status === 'approved' ? '노출 중' : art.status === 'pending' ? '심사 대기' : '미노출'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm">
                                                <p className="font-bold text-gray-900">{art.price?.toLocaleString()}원</p>
                                                <p className="text-xs text-gray-400 mt-1">대여: {art.rental_price?.toLocaleString()}원</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(art.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-gray-400 hover:text-black transition-all">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-gray-400 hover:text-blue-600 transition-all">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-gray-400 hover:text-red-500 transition-all">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                <div className="w-px h-4 bg-gray-200 mx-1"></div>
                                                <button className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-gray-400 hover:text-black transition-all">
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ArtworkListView;
