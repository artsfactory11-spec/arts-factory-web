"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, CheckCircle2, Building2, User, Phone, Mail, MessageSquare } from 'lucide-react';
import { createInquiry } from '@/app/actions/inquiry';

interface ArtistInquiryModalProps {
    isOpen: boolean;
    onClose: () => void;
    artistName: string;
}

const ArtistInquiryModal = ({ isOpen, onClose, artistName }: ArtistInquiryModalProps) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        organization: '',
        message: '',
        type: 'general'
    });
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('submitting');

        // 메시지에 작가 관련 문의임을 명시
        const finalMessage = `[작가 문의: ${artistName}] ${formData.message}`;

        const result = await createInquiry({
            ...formData,
            message: finalMessage,
            type: 'general'
        });

        if (result.success) {
            setStatus('success');
            setTimeout(() => {
                onClose();
                setStatus('idle');
                setFormData({ name: '', email: '', phone: '', organization: '', message: '', type: 'general' });
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
                                        title="닫기"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                    <span className="text-[10px] font-black tracking-[0.3em] text-gray-400 uppercase mb-4 block">
                                        ARTIST INQUIRY
                                    </span>
                                    <h2 className="text-4xl font-black tracking-tighter text-black mb-2">
                                        작가 협업/섭외 문의
                                    </h2>
                                    <p className="text-gray-400 font-light text-sm">
                                        Artist: <span className="text-black font-medium">{artistName}</span>
                                    </p>
                                </div>

                                {/* Form */}
                                <form onSubmit={handleSubmit} className="p-10 space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label htmlFor="name" className="text-[10px] font-black tracking-widest text-gray-400 uppercase ml-2">성함</label>
                                            <div className="relative">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                                <input
                                                    id="name"
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
                                            <label htmlFor="phone" className="text-[10px] font-black tracking-widest text-gray-400 uppercase ml-2">연락처</label>
                                            <div className="relative">
                                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                                <input
                                                    id="phone"
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
                                        <label htmlFor="email" className="text-[10px] font-black tracking-widest text-gray-400 uppercase ml-2">이메일</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                            <input
                                                id="email"
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
                                        <label htmlFor="organization" className="text-[10px] font-black tracking-widest text-gray-400 uppercase ml-2">기업/단체명 (선택)</label>
                                        <div className="relative">
                                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                            <input
                                                id="organization"
                                                type="text"
                                                value={formData.organization}
                                                onChange={e => setFormData({ ...formData, organization: e.target.value })}
                                                placeholder="그림아트 주식회사"
                                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-black transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="message" className="text-[10px] font-black tracking-widest text-gray-400 uppercase ml-2">문의 메시지</label>
                                        <div className="relative">
                                            <MessageSquare className="absolute left-4 top-5 w-4 h-4 text-gray-300" />
                                            <textarea
                                                id="message"
                                                required
                                                rows={3}
                                                value={formData.message}
                                                onChange={e => setFormData({ ...formData, message: e.target.value })}
                                                placeholder="전시 제안, 협업 요청 등 구체적인 내용을 적어주세요."
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

export default ArtistInquiryModal;
