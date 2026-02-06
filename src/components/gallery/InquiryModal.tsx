"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, CheckCircle2, Building2, User, Phone, Mail, MessageSquare } from 'lucide-react';
import { createInquiry } from '@/app/actions/inquiry';

interface InquiryModalProps {
    isOpen: boolean;
    onClose: () => void;
    artwork: {
        id: string;
        title: string;
        artist: string;
    };
    defaultType: 'purchase' | 'rental';
}

const InquiryModal = ({ isOpen, onClose, artwork, defaultType }: InquiryModalProps) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        organization: '',
        message: '',
        type: defaultType
    });
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('submitting');

        const result = await createInquiry({
            ...formData,
            artwork_id: artwork.id,
            type: formData.type as 'purchase' | 'rental'
        });

        if (result.success) {
            setStatus('success');
            setTimeout(() => {
                onClose();
                setStatus('idle');
                setFormData({ name: '', email: '', phone: '', organization: '', message: '', type: defaultType });
            }, 2500);
        } else {
            setStatus('error');
            setTimeout(() => setStatus('idle'), 3000);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl bg-white rounded-[40px] shadow-2xl z-[9999] overflow-hidden"
                    >
                        {status === 'success' ? (
                            <div className="p-12 text-center flex flex-col items-center space-y-6">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', damping: 12 }}
                                    className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center"
                                >
                                    <CheckCircle2 className="w-12 h-12" />
                                </motion.div>
                                <h3 className="text-3xl font-bold tracking-tighter">문의가 완료되었습니다</h3>
                                <p className="text-gray-500 font-light">
                                    담당 큐레이터가 확인 후 <br />
                                    빠른 시일 내에 연락드리겠습니다. 감사합니다.
                                </p>
                            </div>
                        ) : (
                            <div className="relative">
                                {/* Header */}
                                <div className="bg-[#fafafa] px-10 py-12 border-b border-gray-100">
                                    <button
                                        onClick={onClose}
                                        className="absolute top-8 right-8 text-gray-400 hover:text-black transition-colors"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                    <span className="text-[10px] font-black tracking-[0.3em] text-gray-400 uppercase mb-4 block">
                                        비즈니스 문의
                                    </span>
                                    <h2 className="text-4xl font-black tracking-tighter text-black mb-2">
                                        {formData.type === 'purchase' ? '작품 구매 문의' : '작품 대여 신청'}
                                    </h2>
                                    <p className="text-gray-400 font-light text-sm">
                                        {artwork.artist} - <span className="text-black font-medium">{artwork.title}</span>
                                    </p>
                                </div>

                                {/* Form */}
                                <form onSubmit={handleSubmit} className="p-10 space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black tracking-widest text-gray-400 uppercase ml-2">성함</label>
                                            <div className="relative">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                                <input
                                                    required
                                                    type="text"
                                                    value={formData.name}
                                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                    placeholder="홍길동"
                                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-black transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black tracking-widest text-gray-400 uppercase ml-2">연락처</label>
                                            <div className="relative">
                                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                                <input
                                                    required
                                                    type="tel"
                                                    value={formData.phone}
                                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                                    placeholder="010-0000-0000"
                                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-black transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black tracking-widest text-gray-400 uppercase ml-2">이메일</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                            <input
                                                required
                                                type="email"
                                                value={formData.email}
                                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                placeholder="example@company.com"
                                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-black transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black tracking-widest text-gray-400 uppercase ml-2">기업/단체명 (선택)</label>
                                        <div className="relative">
                                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                            <input
                                                type="text"
                                                value={formData.organization}
                                                onChange={e => setFormData({ ...formData, organization: e.target.value })}
                                                placeholder="그림아트 주식회사"
                                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-black transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black tracking-widest text-gray-400 uppercase ml-2">문의 메시지 (선택)</label>
                                        <div className="relative">
                                            <MessageSquare className="absolute left-4 top-5 w-4 h-4 text-gray-300" />
                                            <textarea
                                                rows={3}
                                                value={formData.message}
                                                onChange={e => setFormData({ ...formData, message: e.target.value })}
                                                placeholder="상세 문의사항이 있으시면 적어주세요."
                                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-black transition-all resize-none"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        disabled={status === 'submitting'}
                                        type="submit"
                                        className="w-full py-5 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-gray-800 disabled:bg-gray-200 transition-all flex items-center justify-center gap-2"
                                    >
                                        {status === 'submitting' ? (
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <Send className="w-4 h-4" /> 문의 보내기
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default InquiryModal;
