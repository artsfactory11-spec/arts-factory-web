"use client";

import React, { useState } from 'react';
import {
    Search,
    Mail,
    Phone,
    Calendar,
    ExternalLink,
    User as UserIcon,
    ChevronRight,
    MapPin,
    Instagram,
    Star,
    Loader2
} from 'lucide-react';
import { toggleArtistSpotlight, updatePartnerStatus, deleteArtist } from '@/app/actions/admin';
import { Check, X, Trash2 } from 'lucide-react';

interface AdminArtistListViewProps {
    users: any[];
    onEdit?: (artist: any) => void;
}

const AdminArtistListView = ({ users: initialUsers, onEdit }: AdminArtistListViewProps) => {
    const [users, setUsers] = useState(initialUsers);
    const [searchTerm, setSearchTerm] = useState('');
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
        setLoadingId(id);
        try {
            const res = await updatePartnerStatus(id, status);
            if (res.success) {
                setUsers(prev => prev.map(u => {
                    if (u._id === id) {
                        return {
                            ...u,
                            status,
                            role: status === 'approved' ? 'partner' : u.role
                        };
                    }
                    return u;
                }));
            }
        } finally {
            setLoadingId(null);
        }
    };

    const handleDelete = async (user: any) => {
        if (!confirm(`'${user.name}' 작가를 정말로 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) return;

        setLoadingId(user._id);
        try {
            const res = await deleteArtist(user._id);
            if (res.success) {
                setUsers(prev => prev.filter(u => u._id !== user._id));
            } else {
                alert('작가 삭제에 실패했습니다: ' + res.error);
            }
        } finally {
            setLoadingId(null);
        }
    };

    const handleToggleSpotlight = async (id: string, isSpotlight: boolean) => {
        setLoadingId(id);
        try {
            const res = await toggleArtistSpotlight(id, isSpotlight);
            if (res.success) {
                // 한 명만 spotlight일 수 있으므로 전체 업데이트
                setUsers(prev => prev.map(u => {
                    if (u._id === id) return { ...u, isSpotlight };
                    if (isSpotlight) return { ...u, isSpotlight: false };
                    return u;
                }));
            }
        } finally {
            setLoadingId(null);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Control Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-black transition-colors" />
                    <input
                        type="text"
                        placeholder="작가명 또는 이메일 검색"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all shadow-sm"
                    />
                </div>
                <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                    총 <span className="text-black">{filteredUsers.length}</span> 명의 작가
                </div>
            </div>

            {/* List Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredUsers.map((user) => (
                    <div key={user._id} className="bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm hover:shadow-md transition-all group relative">
                        {/* Card Click Area */}

                        <div className="flex items-start justify-between mb-8">
                            <div className="flex items-center gap-4 cursor-pointer" onClick={() => onEdit && onEdit(user)}>
                                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                                    {user.avatar_url ? (
                                        <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                            <UserIcon className="w-8 h-8" />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-xl font-black text-gray-900 group-hover:text-black transition-colors">{user.name} 작가</h3>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleToggleSpotlight(user._id, !user.isSpotlight);
                                            }}
                                            disabled={loadingId === user._id}
                                            className={`p-2 rounded-xl transition-all shadow-sm ${user.isSpotlight
                                                ? 'bg-yellow-50 text-yellow-400 border border-yellow-100'
                                                : 'bg-gray-50 text-gray-300 border border-gray-100 hover:text-gray-500 hover:bg-gray-100'
                                                }`}
                                            title="홈페이지 스포트라이트 작가 지정"
                                        >
                                            {loadingId === user._id ? (
                                                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                                            ) : (
                                                <Star fill={user.isSpotlight ? "currentColor" : "none"} className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-tighter">{user.artist_specialty || '분야 미입력'}</p>
                                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest ${user.status === 'pending'
                                            ? 'bg-amber-50 text-amber-500 border border-amber-100'
                                            : user.status === 'approved'
                                                ? 'bg-emerald-50 text-emerald-500 border border-emerald-100'
                                                : 'bg-gray-50 text-gray-400 border border-gray-100'
                                            }`}>
                                            {user.status === 'pending' ? 'Pending' : user.status === 'approved' ? 'Approved' : 'None'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {user.status === 'pending' && (
                                    <>
                                        <button
                                            onClick={() => handleUpdateStatus(user._id, 'approved')}
                                            disabled={loadingId === user._id}
                                            className="p-2 bg-emerald-50 text-emerald-500 rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                                            title="승인"
                                        >
                                            <Check className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleUpdateStatus(user._id, 'rejected')}
                                            disabled={loadingId === user._id}
                                            className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                            title="거절"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </>
                                )}
                                <button
                                    onClick={() => onEdit && onEdit(user)}
                                    className="p-2 bg-gray-50 text-gray-300 rounded-xl hover:bg-black hover:text-white transition-all cursor-pointer"
                                    title="수정"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => handleDelete(user)}
                                    disabled={loadingId === user._id}
                                    className="p-2 bg-red-50 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                                    title="삭제"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <Mail className="w-4 h-4 text-gray-300" />
                                <span className="truncate">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <Phone className="w-4 h-4 text-gray-300" />
                                <span>{user.phone || '연락처 없음'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <MapPin className="w-4 h-4 text-gray-300" />
                                <span>{user.activity_region || '지역 미입력'}</span>
                            </div>
                        </div>

                        <div className="h-px bg-gray-50 my-6" />

                        <div className="flex items-center justify-between">
                            <div className="flex gap-2">
                                {user.instagram_url && (
                                    <a href={user.instagram_url} target="_blank" className="p-2 bg-pink-50 text-pink-500 rounded-lg hover:bg-pink-500 hover:text-white transition-all">
                                        <Instagram className="w-4 h-4" />
                                    </a>
                                )}
                                <button className="p-2 bg-gray-50 text-gray-400 rounded-lg hover:bg-black hover:text-white transition-all">
                                    <ExternalLink className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-black text-gray-300 uppercase tracking-widest leading-none">
                                <Calendar className="w-3.5 h-3.5" />
                                {new Date(user.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredUsers.length === 0 && (
                <div className="py-32 text-center text-gray-300 font-medium">
                    등록된 작가가 없습니다.
                </div>
            )}
        </div>
    );
};

export default AdminArtistListView;
