'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Check, X, Download, Star } from 'lucide-react';
import * as XLSX from 'xlsx';

interface IAdminArtwork {
    _id: string;
    title: string;
    firebase_image_url: string;
    category: string;
    artist_id?: { name: string };
    size?: string;
    year?: string;
    material?: string;
    price: number;
    rental_price: number;
    status: 'pending' | 'approved' | 'rejected';
    isCurated: boolean;
    createdAt: string | Date;
}

interface AdminDashboardProps {
    initialArtworks: IAdminArtwork[];
}

export default function AdminDashboard({ initialArtworks }: AdminDashboardProps) {
    const [artworks, setArtworks] = useState<IAdminArtwork[]>(initialArtworks);

    const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected' | 'pending') => {
        // Optimistic UI
        setArtworks(prev => prev.map(art => art._id === id ? { ...art, status } : art));
        // 실제 운영 시 여기에 서버 액션 호출 추가 (updateArtworkStatus)
    };

    const handleToggleCurated = async (id: string, isCurated: boolean) => {
        setArtworks(prev => prev.map(art => art._id === id ? { ...art, isCurated } : art));
        // 실제 운영 시 여기에 서버 액션 호출 추가 (toggleArtworkCurated)
    };

    const exportToExcel = () => {
        // 내보내기용 데이터 가공 (한글 필드명 적용)
        const exportData = artworks.map(art => ({
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
        XLSX.writeFile(workbook, `ArtsFactory_Inventory_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-light tracking-tight text-gray-900 border-l-4 border-black pl-4">재고 및 작품 관리</h1>
                <button
                    onClick={exportToExcel}
                    className="flex items-center gap-2 px-6 py-2.5 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-all shadow-sm"
                >
                    <Download size={16} />
                    엑셀 데이터 내보내기
                </button>
            </div>

            <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-100">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-[0.1em]">작품</th>
                            <th className="px-6 py-4 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-[0.1em]">작가</th>
                            <th className="px-6 py-4 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-[0.1em]">상세 정보</th>
                            <th className="px-6 py-4 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-[0.1em]">판매/렌탈가</th>
                            <th className="px-6 py-4 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-[0.1em]">상태</th>
                            <th className="px-6 py-4 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-[0.1em]">추천</th>
                            <th className="px-6 py-4 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-[0.1em]">관리</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {artworks.map((art) => (
                            <tr key={art._id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-12 w-12 flex-shrink-0 relative">
                                            <Image className="object-cover rounded shadow-sm" src={art.firebase_image_url} alt={art.title} fill />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{art.title}</div>
                                            <div className="text-[10px] text-gray-400 uppercase tracking-tighter">{art.category}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {art.artist_id?.name || '미정'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                                    <div className="flex flex-col gap-0.5">
                                        <span>{art.size || '크기 미입력'}</span>
                                        <span>{art.material || '재료 미입력'}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    <div className="flex flex-col gap-0.5 font-light">
                                        <span>₩{art.price?.toLocaleString() || 0}</span>
                                        <span className="text-gray-400 text-xs text-blue-500 font-medium whitespace-pre">월 ₩{art.rental_price?.toLocaleString() || 0}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-3 py-1 inline-flex text-[10px] leading-4 font-semibold rounded-full border ${art.status === 'approved' ? 'bg-green-50 text-green-700 border-green-100' :
                                        art.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-yellow-50 text-yellow-700 border-yellow-100'
                                        }`}>
                                        {art.status === 'approved' ? '승인완료' : art.status === 'rejected' ? '거절됨' : '승인대기'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <button
                                        onClick={() => handleToggleCurated(art._id, !art.isCurated)}
                                        className={`${art.isCurated ? 'text-yellow-400' : 'text-gray-200'} hover:scale-110 transition-transform`}
                                        title="추천 상태 변경"
                                    >
                                        <Star fill={art.isCurated ? "currentColor" : "none"} size={18} />
                                    </button>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                                    <button
                                        onClick={() => handleUpdateStatus(art._id, 'approved')}
                                        className="text-gray-400 hover:text-green-600 transition-colors"
                                        title="승인"
                                    >
                                        <Check size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleUpdateStatus(art._id, 'rejected')}
                                        className="text-gray-400 hover:text-red-500 transition-colors"
                                        title="거절"
                                    >
                                        <X size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {artworks.length === 0 && (
                <div className="text-center py-20 text-gray-400 font-light">
                    등록된 작품이 없습니다.
                </div>
            )}
        </div>
    );
}
