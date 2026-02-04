'use client';

import { useEffect } from 'react';
import { RefreshCcw, Home, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <main className="min-h-screen bg-white flex items-center justify-center px-6 overflow-hidden">
            <div className="max-w-xl w-full text-center relative">
                {/* Background Large Text with Animation */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="absolute inset-0 flex items-center justify-center -z-10"
                >
                    <h1 className="text-[25vw] font-serif font-black leading-none text-red-50/50 select-none">ERR</h1>
                </motion.div>

                <div className="space-y-12">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="space-y-8"
                    >
                        <div className="flex justify-center">
                            <motion.div
                                animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
                                className="w-20 h-20 bg-red-500 rounded-[30px] flex items-center justify-center text-white shadow-2xl shadow-red-200"
                            >
                                <AlertTriangle className="w-10 h-10" />
                            </motion.div>
                        </div>
                        <div className="space-y-4">
                            <span className="text-[10px] font-black tracking-[0.6em] text-red-400 uppercase">Internal System Interruption</span>
                            <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tighter text-black leading-tight">
                                기술적인 오류가 <br /> 발생했습니다.
                            </h1>
                            <p className="text-gray-400 font-serif italic text-lg max-w-md mx-auto leading-relaxed">
                                잠시 후 다시 시도해 주세요. <br className="hidden md:block" />
                                문제가 지속되면 관리자에게 문의 바랍니다.
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center pt-8"
                    >
                        <button
                            onClick={() => reset()}
                            className="inline-flex items-center justify-center gap-4 px-10 py-5 bg-black text-white rounded-full text-sm font-bold hover:bg-zinc-800 transition-all active:scale-95 shadow-2xl shadow-black/20 group"
                        >
                            <RefreshCcw className="w-4 h-4 transition-transform group-hover:rotate-180 duration-500" />
                            다시 시도하기
                        </button>
                        <Link
                            href="/"
                            className="inline-flex items-center justify-center gap-4 px-10 py-5 bg-gray-50 text-black rounded-full text-sm font-bold hover:bg-gray-100 transition-all active:scale-95 group"
                        >
                            <Home className="w-4 h-4" />
                            메인으로 이동
                        </Link>
                    </motion.div>
                </div>

                <div className="pt-24 opacity-20 hover:opacity-100 transition-opacity">
                    <p className="text-[9px] font-mono text-gray-400 max-w-xs mx-auto break-all uppercase">
                        Digest: {error.digest || 'no-digest-id'}
                    </p>
                </div>
            </div>
        </main>
    );
}
