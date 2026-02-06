'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { seedAdmin } from '@/app/actions/auth-setup';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [seedMessage, setSeedMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (res?.error) {
                setError(res.error);
            } else {
                // 로그인 성공 시 홈으로 이동 (필요시 역할별 분기 가능)
                router.push('/');
                router.refresh();
            }
        } catch (err) {
            setError('로그인 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleSeed = async () => {
        setLoading(true);
        const res = await seedAdmin();
        if (res.success) {
            setSeedMessage('Admin account ready (artrental)');
            setEmail('artrental');
        } else {
            setError('System init failed: ' + res.error);
        }
        setLoading(false);
    };

    return (
        <main className="min-h-screen bg-white flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-md w-full bg-white border border-gray-100 p-12 shadow-2xl"
            >
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-serif font-light italic text-black mb-4">Partner Login</h1>
                    <p className="text-gray-400 text-xs font-black tracking-widest uppercase">
                        Arts Factory Management
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {error && (
                        <div className="p-4 bg-red-50 text-red-500 text-xs font-semibold rounded-sm border border-red-100">
                            {error}
                        </div>
                    )}

                    <div className="space-y-6">
                        <div className="group relative">
                            <label className="text-[10px] font-black tracking-widest text-gray-400 uppercase mb-2 block group-focus-within:text-black">
                                ID or Email
                            </label>
                            <input
                                required
                                type="text"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-transparent border-b border-gray-200 py-3 text-lg font-serif focus:outline-none focus:border-black transition-all"
                                placeholder="artrental or email"
                            />
                        </div>

                        <div className="group relative">
                            <label className="text-[10px] font-black tracking-widest text-gray-400 uppercase mb-2 block group-focus-within:text-black">
                                Password
                            </label>
                            <input
                                required
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-transparent border-b border-gray-200 py-3 text-lg font-serif focus:outline-none focus:border-black transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div className="pt-6">
                        <button
                            disabled={loading}
                            type="submit"
                            className="w-full py-6 bg-black text-white text-[10px] font-black tracking-[0.4em] uppercase hover:bg-zinc-800 transition-colors shadow-xl"
                        >
                            {loading ? 'Authenticating...' : 'Sign In'}
                        </button>

                        {/* Hidden/Temporary Seed Trigger */}
                        <button
                            type="button"
                            onClick={handleSeed}
                            className="w-full mt-4 py-2 border border-dashed border-gray-200 text-[8px] font-black tracking-widest text-gray-300 uppercase hover:text-gray-500 hover:border-gray-400 transition-all"
                        >
                            {seedMessage || "Initialize Management Account"}
                        </button>
                    </div>

                    <div className="text-center space-y-4 pt-6">
                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tight">
                            아직 계정이 없으신가요?
                        </p>
                        <div className="flex flex-col gap-4">
                            <Link
                                href="/signup"
                                className="inline-block text-[10px] font-black tracking-[0.2em] text-charcoal uppercase border-b border-charcoal/20 hover:border-charcoal transition-all"
                            >
                                일반 회원가입
                            </Link>
                            <Link
                                href="/partner/join"
                                className="inline-block text-[10px] font-black tracking-[0.2em] text-accent uppercase border-b border-accent/20 hover:border-accent transition-all"
                            >
                                작가(파트너) 신청하기
                            </Link>
                        </div>
                    </div>
                </form>
            </motion.div>
        </main>
    );
}
