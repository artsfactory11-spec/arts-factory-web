'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Eye, EyeOff, Calendar } from 'lucide-react';
import { getNotices, deleteNotice, toggleNoticeActive } from '@/app/actions/notice';
import Image from 'next/image';

interface AdminNoticeListViewProps {
    onEdit: (notice: any) => void;
    onCreate: () => void;
}

export default function AdminNoticeListView({ onEdit, onCreate }: AdminNoticeListViewProps) {
    const [notices, setNotices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const loadNotices = async () => {
        setLoading(true);
        const res = await getNotices();
        if (res.success) {
            setNotices(res.notices);
        }
        setLoading(false);
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            loadNotices();
        }, 0);
        return () => clearTimeout(timer);
    }, []);

    const handleDelete = async (id: string) => {
        if (confirm('정말 삭제하시겠습니까?')) {
            const res = await deleteNotice(id);
            if (res.success) {
                setNotices(prev => prev.filter(n => n._id !== id));
            }
        }
    };

    const handleToggleActive = async (id: string, currentStatus: boolean) => {
        const res = await toggleNoticeActive(id, !currentStatus);
        if (res.success) {
            setNotices(prev => prev.map(n => n._id === id ? { ...n, isActive: !currentStatus } : n));
        }
    };


    const filteredNotices = notices.filter(n =>
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Action Bar */}
            <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center bg-white p-6 rounded-[30px] border border-gray-100 shadow-sm">
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-black transition-colors" />
                    <input
                        type="text"
                        placeholder="Search notices..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-black/5 transition-all outline-none"
                    />
                </div>

                <button
                    onClick={onCreate}
                    className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-accent transition-all shadow-xl shadow-black/10 active:scale-95 shrink-0"
                >
                    <Plus className="w-4 h-4" />
                    Create Notice
                </button>
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Thumbnail</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Notice Info</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Period</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto" />
                                    </td>
                                </tr>
                            ) : filteredNotices.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center text-gray-400 font-serif italic">
                                        No notices found.
                                    </td>
                                </tr>
                            ) : (
                                filteredNotices.map((n: any) => {
                                    const now = new Date();
                                    const start = new Date(n.startDate);
                                    const end = new Date(n.endDate);
                                    let status = { label: '대기', color: 'bg-blue-50 text-blue-600' };

                                    if (!n.isActive) {
                                        status = { label: '비활성', color: 'bg-gray-100 text-gray-400' };
                                    } else if (now >= start && now <= end) {
                                        status = { label: '진행중', color: 'bg-green-50 text-green-600 animate-pulse' };
                                    } else if (now > end) {
                                        status = { label: '종료', color: 'bg-red-50 text-red-600' };
                                    }

                                    return (
                                        <tr key={n._id} className="hover:bg-gray-50/30 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden relative">
                                                    {n.images && n.images.length > 0 ? (
                                                        <Image src={n.images[0].url} alt="" fill className="object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400 font-bold uppercase p-1 text-center">No Img</div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-0.5">
                                                    <p className="font-bold text-gray-900 line-clamp-1">{n.title}</p>
                                                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tight">Priority: {n.priority}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500">
                                                        <Calendar className="w-3 h-3 text-gray-300" />
                                                        {new Date(n.startDate).toLocaleDateString()} ~ {new Date(n.endDate).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${status.color}`}>
                                                    {status.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleToggleActive(n._id, n.isActive)}
                                                        className={`p-2 rounded-lg transition-colors ${n.isActive ? 'text-green-500 hover:bg-green-50' : 'text-gray-300 hover:bg-gray-50'}`}
                                                        title={n.isActive ? '비활성화' : '활성화'}
                                                    >
                                                        {n.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                                    </button>
                                                    <button
                                                        onClick={() => onEdit(n)}
                                                        className="p-2 text-gray-400 hover:text-black hover:bg-gray-50 rounded-lg transition-colors"
                                                        title="수정"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(n._id)}
                                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="삭제"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
