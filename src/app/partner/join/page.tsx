'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { applyForPartner } from '@/app/actions/user';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export default function PartnerJoinPage() {
    const router = useRouter();
    const { data: session, status: authStatus } = useSession();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (authStatus === 'unauthenticated') {
            router.push('/partner/login?callbackUrl=/partner/join');
        }
    }, [authStatus, router]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!session?.user) return;

        setLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        const data = {
            artist_specialty: formData.get('specialty') as string,
            activity_region: formData.get('region') as string,
            artist_bio: formData.get('bio') as string,
        };

        const res = await applyForPartner((session.user as any).id, data);
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

    if (authStatus === 'loading') return null;

    if (success) {
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
                        신청이 완료되었습니다
                    </h1>
                    <p className="text-gray-700 font-serif italic text-lg leading-relaxed">
                        관리자 승인 후 파트너 대시보드 이용이 가능합니다.<br />
                        결과는 입력하신 이메일로 안내해 드립니다.
                    </p>
                    <Link href="/" className="inline-block pt-8 text-[11px] font-black tracking-[0.4em] uppercase underline underline-offset-8 text-charcoal hover:text-accent transition-colors">
                        홈으로 돌아가기
                    </Link>
                </motion.div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-surface grain">
            <header className="pt-60 pb-20 px-6 lg:px-12">
                <div className="max-w-7xl mx-auto text-center">
                    <span className="text-[11px] font-black tracking-[0.6em] text-accent uppercase mb-6 block animate-in fade-in slide-in-from-bottom-2 duration-700">
                        Join our community
                    </span>
                    <h1 className="text-7xl font-serif font-light tracking-tighter text-charcoal mb-12 italic animate-in fade-in slide-in-from-bottom-3 duration-1000">
                        Become a Partner
                    </h1>
                    <p className="max-w-2xl mx-auto text-xl text-charcoal/60 font-serif italic leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
                        {session?.user?.name}님, 아트팩토리와 함께 성장할 <br />
                        작가님의 특별한 스토리를 들려주세요.
                    </p>
                </div>
            </header>

            <section className="px-6 lg:px-12 py-32 bg-white rounded-t-[80px]">
                <div className="max-w-2xl mx-auto">
                    <form onSubmit={handleSubmit} className="space-y-16">
                        {error && (
                            <div className="p-6 bg-red-50 text-red-500 text-sm font-medium rounded-2xl border border-red-100">
                                {error}
                            </div>
                        )}

                        <div className="space-y-12">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="group relative">
                                    <label className="text-[11px] font-black tracking-widest text-charcoal/70 uppercase mb-4 block transition-colors group-focus-within:text-accent">
                                        Specialty <span className="text-accent">*</span>
                                    </label>
                                    <input
                                        required
                                        name="specialty"
                                        type="text"
                                        className="w-full bg-transparent border-b border-charcoal/20 py-3 text-lg font-serif focus:outline-none focus:border-charcoal transition-all placeholder:text-gray-400"
                                        placeholder="예: 현대 미술, 서양화, 디지털 아트"
                                    />
                                </div>
                                <div className="group relative">
                                    <label className="text-[11px] font-black tracking-widest text-charcoal/70 uppercase mb-4 block transition-colors group-focus-within:text-accent">
                                        Region <span className="text-accent">*</span>
                                    </label>
                                    <input
                                        required
                                        name="region"
                                        type="text"
                                        className="w-full bg-transparent border-b border-charcoal/20 py-3 text-lg font-serif focus:outline-none focus:border-charcoal transition-all placeholder:text-gray-400"
                                        placeholder="예: 서울, 경기, 해외 등"
                                    />
                                </div>
                            </div>

                            <div className="group relative">
                                <label className="text-[11px] font-black tracking-widest text-charcoal/70 uppercase mb-4 block transition-colors group-focus-within:text-accent">
                                    Introduction <span className="text-accent">*</span>
                                </label>
                                <textarea
                                    required
                                    name="bio"
                                    rows={5}
                                    className="w-full bg-transparent border-b border-charcoal/20 py-3 text-lg font-serif focus:outline-none focus:border-charcoal transition-all resize-none placeholder:text-gray-400"
                                    placeholder="작가님의 활동과 철학에 대해 정성스럽게 들려주세요."
                                />
                            </div>
                        </div>

                        <div className="pt-12">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full group relative flex items-center justify-center gap-4 py-8 bg-charcoal text-white rounded-full overflow-hidden shadow-2xl shadow-charcoal/20 transition-all hover:-translate-y-1 active:scale-95 disabled:bg-gray-200"
                            >
                                <span className="relative z-10 text-[11px] font-black tracking-[0.5em] uppercase flex items-center gap-3">
                                    {loading ? 'Submitting...' : (
                                        <>Send Application <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                                    )}
                                </span>
                                <div className="absolute inset-0 bg-accent translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        </main>
    );
}
