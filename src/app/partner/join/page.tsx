'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { registerPartner } from '@/app/actions/user';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PartnerJoinPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get('name') as string,
            email: formData.get('email') as string,
            password: formData.get('password') as string,
            artist_specialty: formData.get('specialty') as string,
            activity_region: formData.get('region') as string,
            artist_bio: formData.get('bio') as string,
        };

        const res = await registerPartner(data);
        if (res.success) {
            setSuccess(true);
            setTimeout(() => {
                router.push('/');
            }, 5000);
        } else {
            setError(res.error || '신청 중 오류가 발생했습니다.');
        }
        setLoading(false);
    };

    if (success) {
        return (
            <main className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full space-y-8"
                >
                    <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-8">
                        <span className="text-white text-4xl">✓</span>
                    </div>
                    <h1 className="text-4xl font-serif font-light tracking-tight text-black italic">
                        신청이 완료되었습니다
                    </h1>
                    <p className="text-gray-500 font-serif italic text-lg leading-relaxed">
                        관리자 승인 후 파트너 대시보드 이용이 가능합니다.<br />
                        결과는 입력하신 이메일로 안내해 드립니다.
                    </p>
                    <Link href="/" className="inline-block pt-8 text-xs font-black tracking-[0.3em] uppercase underline underline-offset-8">
                        Return to Home
                    </Link>
                </motion.div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-white">
            <header className="pt-40 pb-20 px-6 lg:px-12 bg-surface">
                <div className="max-w-7xl mx-auto text-center">
                    <span className="text-[10px] font-black tracking-[0.5em] text-accent uppercase mb-6 block animate-in fade-in slide-in-from-bottom-2 duration-700">
                        Join our community
                    </span>
                    <h1 className="text-7xl font-serif font-light tracking-tighter text-black mb-10 animate-in fade-in slide-in-from-bottom-3 duration-1000">
                        Become a Partner
                    </h1>
                    <p className="max-w-2xl mx-auto text-xl text-gray-400 font-serif italic leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
                        Arts Factory와 함께 성장할 역량 있는 작가님들을 모십니다.<br />
                        신청서를 작성해 주시면 검토 후 개별 연락드리겠습니다.
                    </p>
                </div>
            </header>

            <section className="px-6 lg:px-12 py-32">
                <div className="max-w-2xl mx-auto">
                    <form onSubmit={handleSubmit} className="space-y-12">
                        {error && (
                            <div className="p-4 bg-red-50 text-red-500 text-sm font-medium rounded-sm border border-red-100">
                                {error}
                            </div>
                        )}

                        <div className="space-y-8">
                            <div className="group relative">
                                <label className="text-[10px] font-black tracking-widest text-gray-400 uppercase mb-2 block transition-colors group-focus-within:text-black">
                                    Full Name <span className="text-accent">*</span>
                                </label>
                                <input
                                    required
                                    name="name"
                                    type="text"
                                    className="w-full bg-transparent border-b border-gray-200 py-3 text-lg font-serif focus:outline-none focus:border-black transition-all"
                                    placeholder="성함 혹은 활동명을 입력하세요"
                                />
                            </div>

                            <div className="group relative">
                                <label className="text-[10px] font-black tracking-widest text-gray-400 uppercase mb-2 block transition-colors group-focus-within:text-black">
                                    Email Address <span className="text-accent">*</span>
                                </label>
                                <input
                                    required
                                    name="email"
                                    type="email"
                                    className="w-full bg-transparent border-b border-gray-200 py-3 text-lg font-serif focus:outline-none focus:border-black transition-all"
                                    placeholder="artist@example.com"
                                />
                            </div>

                            <div className="group relative">
                                <label className="text-[10px] font-black tracking-widest text-gray-400 uppercase mb-2 block transition-colors group-focus-within:text-black">
                                    Password <span className="text-accent">*</span>
                                </label>
                                <input
                                    required
                                    name="password"
                                    type="password"
                                    className="w-full bg-transparent border-b border-gray-200 py-3 text-lg font-serif focus:outline-none focus:border-black transition-all"
                                    placeholder="6자 이상의 비밀번호"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="group relative">
                                    <label className="text-[10px] font-black tracking-widest text-gray-400 uppercase mb-2 block transition-colors group-focus-within:text-black">
                                        Specialty
                                    </label>
                                    <input
                                        name="specialty"
                                        type="text"
                                        className="w-full bg-transparent border-b border-gray-200 py-3 text-lg font-serif focus:outline-none focus:border-black transition-all"
                                        placeholder="예: 현대 미술, 서양화, 디지털 아트"
                                    />
                                </div>
                                <div className="group relative">
                                    <label className="text-[10px] font-black tracking-widest text-gray-400 uppercase mb-2 block transition-colors group-focus-within:text-black">
                                        Region
                                    </label>
                                    <input
                                        name="region"
                                        type="text"
                                        className="w-full bg-transparent border-b border-gray-200 py-3 text-lg font-serif focus:outline-none focus:border-black transition-all"
                                        placeholder="예: 서울, 경기, 해외 등"
                                    />
                                </div>
                            </div>

                            <div className="group relative">
                                <label className="text-[10px] font-black tracking-widest text-gray-400 uppercase mb-2 block transition-colors group-focus-within:text-black">
                                    Introduction
                                </label>
                                <textarea
                                    name="bio"
                                    rows={4}
                                    className="w-full bg-transparent border-b border-gray-200 py-3 text-lg font-serif focus:outline-none focus:border-black transition-all resize-none"
                                    placeholder="작가님의 활동과 철학에 대해 짧게 들려주세요"
                                />
                            </div>
                        </div>

                        <div className="pt-12">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full group relative flex items-center justify-center gap-4 py-8 bg-black text-white overflow-hidden shadow-2xl shadow-black/20"
                            >
                                <span className="relative z-10 text-[10px] font-black tracking-[0.5em] uppercase">
                                    {loading ? 'Submitting...' : 'Send Application'}
                                </span>
                                <div className="absolute inset-0 bg-accent translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
                            </button>
                            <p className="mt-8 text-center text-[10px] text-gray-400 font-medium tracking-tight uppercase">
                                By joining, you agree to our <Link href="/terms" className="underline underline-offset-4">Terms and Policy</Link>
                            </p>
                        </div>
                    </form>
                </div>
            </section>

        </main>
    );
}
