'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle2, User, Phone, Mail, MessageSquare, ChevronDown } from 'lucide-react';
import { createInquiry } from '@/app/actions/inquiry';
import { RevealSection } from '@/components/home/AnimatedHome';

type InquiryType = 'purchase' | 'rental' | 'general';

interface IInquiryForm {
    name: string;
    email: string;
    phone: string;
    organization: string;
    type: InquiryType;
    message: string;
}

export default function InquiryPage() {
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [formData, setFormData] = useState<IInquiryForm>({
        name: '',
        email: '',
        phone: '',
        organization: '',
        type: 'general',
        message: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('submitting');

        const result = await createInquiry(formData);

        if (result.success) {
            setStatus('success');
            setTimeout(() => {
                setStatus('idle');
                setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    organization: '',
                    type: 'general',
                    message: ''
                });
            }, 3000);
        } else {
            setStatus('error');
            setTimeout(() => setStatus('idle'), 3000);
        }
    };

    if (status === 'success') {
        return (
            <main className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center grain">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full space-y-8"
                >
                    <div className="w-24 h-24 bg-charcoal text-accent rounded-full flex items-center justify-center mx-auto mb-10 shadow-2xl">
                        <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h1 className="text-4xl font-serif font-light tracking-tight text-charcoal italic">
                        문의가 무사히 접수되었습니다
                    </h1>
                    <p className="text-gray-500 font-serif italic text-lg leading-relaxed">
                        보내주신 소중한 메시지를 담당 큐레이터가 <br />
                        빠른 시일 내에 확인하여 연락드리겠습니다.
                    </p>
                    <button
                        onClick={() => setStatus('idle')}
                        className="inline-block pt-8 text-[11px] font-black tracking-[0.4em] uppercase underline underline-offset-8 text-charcoal"
                    >
                        Back to Inquiry
                    </button>
                </motion.div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-surface grain">
            {/* Header Section */}
            <header className="pt-60 pb-20 px-6 lg:px-12 relative overflow-hidden">
                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <RevealSection>
                        <span className="text-[11px] font-black tracking-[0.6em] text-accent uppercase mb-6 block">
                            Inquiry
                        </span>
                    </RevealSection>
                    <RevealSection delay={0.2}>
                        <h1 className="text-7xl lg:text-9xl font-serif font-light tracking-tighter text-charcoal mb-12 italic">
                            Contact Us
                        </h1>
                    </RevealSection>
                    <RevealSection delay={0.4}>
                        <p className="max-w-2xl mx-auto text-xl text-gray-400 font-serif italic leading-relaxed">
                            작품 소장부터 렌탈, 비즈니스 협업까지 <br />
                            예술공장이 제안하는 새로운 공간의 경험을 문의하세요.
                        </p>
                    </RevealSection>
                </div>

                {/* Background Large Text */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] select-none pointer-events-none whitespace-nowrap">
                    <span className="text-[30vw] font-serif font-black italic uppercase text-charcoal">Inquiry</span>
                </div>
            </header>

            {/* Form Section */}
            <section className="px-6 lg:px-12 py-32 bg-white">
                <div className="max-w-3xl mx-auto">
                    <form onSubmit={handleSubmit} className="space-y-16">
                        {status === 'error' && (
                            <div className="p-6 bg-red-50 text-red-500 text-sm font-medium rounded-2xl border border-red-100 animate-in fade-in slide-in-from-top-2">
                                신청 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
                            {/* Name Input */}
                            <div className="group relative">
                                <label htmlFor="name" className="text-[11px] font-black tracking-widest text-gray-400 uppercase mb-4 block transition-colors group-focus-within:text-accent">
                                    성함 <span className="text-accent">*</span>
                                </label>
                                <div className="relative">
                                    <User className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-charcoal transition-colors" />
                                    <input
                                        id="name"
                                        required
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-transparent border-b border-gray-100 py-4 pl-8 text-xl font-serif focus:outline-none focus:border-charcoal transition-all placeholder:text-gray-200"
                                        placeholder="Name / Organization"
                                    />
                                </div>
                            </div>

                            {/* Phone Input */}
                            <div className="group relative">
                                <label htmlFor="phone" className="text-[11px] font-black tracking-widest text-gray-400 uppercase mb-4 block transition-colors group-focus-within:text-accent">
                                    연락처 <span className="text-accent">*</span>
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-charcoal transition-colors" />
                                    <input
                                        id="phone"
                                        required
                                        type="tel"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full bg-transparent border-b border-gray-100 py-4 pl-8 text-xl font-serif focus:outline-none focus:border-charcoal transition-all placeholder:text-gray-200"
                                        placeholder="010-0000-0000"
                                    />
                                </div>
                            </div>

                            {/* Email Input */}
                            <div className="group relative">
                                <label htmlFor="email" className="text-[11px] font-black tracking-widest text-gray-400 uppercase mb-4 block transition-colors group-focus-within:text-accent">
                                    이메일 <span className="text-accent">*</span>
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-charcoal transition-colors" />
                                    <input
                                        id="email"
                                        required
                                        type="email"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full bg-transparent border-b border-gray-100 py-4 pl-8 text-xl font-serif focus:outline-none focus:border-charcoal transition-all placeholder:text-gray-200"
                                        placeholder="email@example.com"
                                    />
                                </div>
                            </div>

                            {/* Inquiry Type Select */}
                            <div className="group relative">
                                <label htmlFor="type" className="text-[11px] font-black tracking-widest text-gray-400 uppercase mb-4 block transition-colors group-focus-within:text-accent">
                                    문의 유형 <span className="text-accent">*</span>
                                </label>
                                <div className="relative">
                                    <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
                                    <select
                                        id="type"
                                        title="문의 유형 선택"
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value as InquiryType })}
                                        className="w-full bg-transparent border-b border-gray-100 py-4 pr-8 text-xl font-serif focus:outline-none focus:border-charcoal transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="general">일반 문의</option>
                                        <option value="purchase">작품 소장 문의</option>
                                        <option value="rental">작품 렌탈 문의</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Message Textarea */}
                        <div className="group relative">
                            <label htmlFor="message" className="text-[11px] font-black tracking-widest text-gray-400 uppercase mb-4 block transition-colors group-focus-within:text-accent">
                                상세 내용
                            </label>
                            <div className="relative">
                                <MessageSquare className="absolute left-0 top-6 w-4 h-4 text-gray-300 group-focus-within:text-charcoal transition-colors" />
                                <textarea
                                    id="message"
                                    rows={5}
                                    value={formData.message}
                                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                                    className="w-full bg-transparent border-b border-gray-100 py-4 pl-8 text-xl font-serif focus:outline-none focus:border-charcoal transition-all resize-none placeholder:text-gray-200"
                                    placeholder="상세 내용을 자유롭게 작성해 주세요"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-12 text-center">
                            <button
                                type="submit"
                                disabled={status === 'submitting'}
                                className="group relative inline-flex items-center gap-10 px-20 py-8 bg-charcoal text-white rounded-full text-[12px] font-black uppercase tracking-[0.4em] hover:bg-accent transition-all duration-700 shadow-2xl shadow-charcoal/20 overflow-hidden disabled:bg-gray-200"
                            >
                                <span className="relative z-10 flex items-center gap-4">
                                    {status === 'submitting' ? 'Sending...' : (
                                        <>
                                            전송하기 <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                        </>
                                    )}
                                </span>
                                <div className="absolute inset-0 bg-accent translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
                            </button>
                            <p className="mt-12 text-[10px] text-gray-300 font-black tracking-[0.2em] uppercase">
                                Typically responds within 24 hours
                            </p>
                        </div>
                    </form>
                </div>
            </section>
        </main>
    );
}
