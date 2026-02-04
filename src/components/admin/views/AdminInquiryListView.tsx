"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Calendar, User, Phone, Mail, Building2, CheckCircle2, Clock, MoreVertical } from 'lucide-react';
import { getInquiries, updateInquiryStatus } from '@/app/actions/inquiry';

const AdminInquiryListView = () => {
    const [inquiries, setInquiries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchInquiries = async () => {
        const res = await getInquiries();
        if (res.success) {
            setInquiries(res.inquiries);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchInquiries();
    }, []);

    const handleStatusUpdate = async (id: string, status: any) => {
        const res = await updateInquiryStatus(id, status);
        if (res.success) {
            setInquiries(inquiries.map(inq => inq._id === id ? { ...inq, status } : inq));
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-50 text-green-600';
            case 'contacted': return 'bg-blue-50 text-blue-600';
            default: return 'bg-orange-50 text-orange-600';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'completed': return '완료';
            case 'contacted': return '연락완료';
            default: return '대기중';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold tracking-tighter">B2B 문의 내역</h2>
                    <p className="text-gray-500 mt-1">작품 구매 및 대여 신청 현황입니다.</p>
                </div>
                <div className="px-4 py-2 bg-black text-white text-[10px] font-black rounded-full uppercase tracking-widest">
                    Total {inquiries.length}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {inquiries.map((inquiry, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        key={inquiry._id}
                        className="bg-white border border-gray-100 rounded-3xl p-8 hover:shadow-xl hover:shadow-black/5 transition-all group"
                    >
                        <div className="flex flex-col lg:flex-row gap-8">
                            <div className="flex-1 space-y-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${getStatusColor(inquiry.status)}`}>
                                            {getStatusLabel(inquiry.status)}
                                        </span>
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${inquiry.type === 'purchase' ? 'bg-black text-white shadow-lg shadow-black/10' : 'bg-gray-100 text-gray-600'}`}>
                                            {inquiry.type === 'purchase' ? '구매 문의' : '대여 신청'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                                        <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {new Date(inquiry.createdAt).toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-2xl font-bold tracking-tight">
                                        {inquiry.organization && <span className="text-gray-400 font-medium mr-2">[{inquiry.organization}]</span>}
                                        {inquiry.name} <span className="text-gray-400 font-light text-xl">님</span>
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div className="flex items-center gap-3 text-sm text-gray-500 bg-gray-50/50 p-3 rounded-xl border border-gray-50">
                                            <Phone className="w-4 h-4 text-gray-300" /> {inquiry.phone}
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-gray-500 bg-gray-50/50 p-3 rounded-xl border border-gray-50">
                                            <Mail className="w-4 h-4 text-gray-300" /> {inquiry.email}
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-black font-medium bg-gray-50/50 p-3 rounded-xl border border-gray-50">
                                            <MessageSquare className="w-4 h-4 text-gray-300" /> {inquiry.artwork_id?.title || '삭제된 작품'}
                                        </div>
                                    </div>

                                    {inquiry.message && (
                                        <div className="bg-gray-50 p-6 rounded-2xl relative mt-4">
                                            <p className="text-sm text-gray-600 leading-relaxed italic">
                                                "{inquiry.message}"
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex lg:flex-col justify-end gap-2 border-t lg:border-t-0 lg:border-l border-gray-100 pt-6 lg:pt-0 lg:pl-8 min-w-[160px]">
                                <button
                                    onClick={() => handleStatusUpdate(inquiry._id, 'pending')}
                                    className={`flex-1 lg:flex-none py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${inquiry.status === 'pending' ? 'bg-orange-50 text-orange-600' : 'hover:bg-gray-100 text-gray-400'}`}
                                >
                                    대기중
                                </button>
                                <button
                                    onClick={() => handleStatusUpdate(inquiry._id, 'contacted')}
                                    className={`flex-1 lg:flex-none py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${inquiry.status === 'contacted' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100 text-gray-400'}`}
                                >
                                    연락완료
                                </button>
                                <button
                                    onClick={() => handleStatusUpdate(inquiry._id, 'completed')}
                                    className={`flex-1 lg:flex-none py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${inquiry.status === 'completed' ? 'bg-green-50 text-green-600 border border-green-100' : 'hover:bg-gray-100 text-gray-400'}`}
                                >
                                    진행완료
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}

                {inquiries.length === 0 && (
                    <div className="bg-white border border-gray-50 rounded-[40px] p-24 text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-200">
                            <MessageSquare className="w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">접수된 문의가 없습니다</h3>
                        <p className="text-gray-400 font-light">고객님의 새로운 문의가 이곳에 표시됩니다.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminInquiryListView;
