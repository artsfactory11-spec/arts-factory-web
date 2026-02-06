'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { registerUser } from '@/app/actions/user';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, Lock, ArrowRight, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import RevealSection from '@/components/home/RevealSection';

export default function SignUpPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get('name') as string,
            email: formData.get('email') as string,
            password: formData.get('password') as string,
        };

        const res = await registerUser(data);
        if (res.success) {
            setSuccess(true);
            setTimeout(() => {
                router.push('/partner/login');
            }, 3000);
        } else {
            setError(res.error || '가입 중 오류가 발생했습니다.');
        }
        setLoading(false);
    };

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
                        웰컴 투 아트팩토리
                    </h1>
                    <p className="text-gray-500 font-serif italic text-lg leading-relaxed">
                        계정 생성이 완료되었습니다. <br />
                        잠시 후 로그인 페이지로 이동합니다.
                    </p>
                </motion.div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-surface grain flex items-center justify-center py-20 px-6">
            <div className="max-w-md w-full">
                <div className="text-center mb-16">
                    <span className="text-[11px] font-black tracking-[0.6em] text-accent uppercase mb-6 block">
                        Join Us
                    </span>
                    <h1 className="text-5xl font-serif font-light tracking-tighter text-charcoal italic">
                        계정 만들기
                    </h1>
                </div>

                <div className="bg-white rounded-[40px] p-10 lg:p-12 shadow-2xl shadow-charcoal/5">
                    <form onSubmit={handleSubmit} className="space-y-10">
                        {error && (
                            <div className="p-4 bg-red-50 text-red-500 text-xs font-medium rounded-2xl border border-red-100">
                                {error}
                            </div>
                        )}

                        <div className="space-y-8">
                            <div className="group relative">
                                <label className="text-[10px] font-black tracking-widest text-gray-400 uppercase mb-2 block ml-1 transition-colors group-focus-within:text-charcoal">
                                    성함
                                </label>
                                <div className="relative">
                                    <User className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-charcoal transition-colors" />
                                    <input
                                        required
                                        name="name"
                                        type="text"
                                        className="w-full bg-transparent border-b border-gray-100 py-3 pl-8 text-lg font-serif focus:outline-none focus:border-charcoal transition-all"
                                        placeholder="홍길동"
                                    />
                                </div>
                            </div>

                            <div className="group relative">
                                <label className="text-[10px] font-black tracking-widest text-gray-400 uppercase mb-2 block ml-1 transition-colors group-focus-within:text-charcoal">
                                    이메일 주소
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-charcoal transition-colors" />
                                    <input
                                        required
                                        name="email"
                                        type="email"
                                        className="w-full bg-transparent border-b border-gray-100 py-3 pl-8 text-lg font-serif focus:outline-none focus:border-charcoal transition-all"
                                        placeholder="email@example.com"
                                    />
                                </div>
                            </div>

                            <div className="group relative">
                                <label className="text-[10px] font-black tracking-widest text-gray-400 uppercase mb-2 block ml-1 transition-colors group-focus-within:text-charcoal">
                                    비밀번호
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-charcoal transition-colors" />
                                    <input
                                        required
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        className="w-full bg-transparent border-b border-gray-100 py-3 pl-8 pr-12 text-lg font-serif focus:outline-none focus:border-charcoal transition-all"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-gray-300 hover:text-charcoal transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full group relative flex items-center justify-center gap-4 py-6 bg-charcoal text-white rounded-full overflow-hidden shadow-xl shadow-charcoal/10 transition-transform hover:-translate-y-1 active:scale-95 disabled:bg-gray-200"
                            >
                                <span className="relative z-10 text-[10px] font-black tracking-[0.5em] uppercase flex items-center gap-2">
                                    {loading ? '생성 중...' : (
                                        <>계정 생성하기 <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                                    )}
                                </span>
                                <div className="absolute inset-0 bg-accent translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
                            </button>
                        </div>
                    </form>

                    <div className="mt-12 text-center text-[11px] text-gray-400 font-medium tracking-tight uppercase">
                        이미 계정이 있으신가요? <Link href="/partner/login" className="text-charcoal underline underline-offset-4 hover:text-accent transition-colors ml-2">로그인</Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
