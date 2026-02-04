'use client';

import Link from 'next/link';
import { ArrowLeft, Search } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NotFound() {
    return (
        <main className="min-h-screen bg-white flex items-center justify-center px-6 overflow-hidden">
            <div className="max-w-4xl w-full text-center relative">
                {/* Background Large Text with Animation */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="absolute inset-0 flex items-center justify-center -z-10"
                >
                    <h1 className="text-[25vw] font-serif font-black leading-none text-gray-50 select-none">404</h1>
                </motion.div>

                <div className="space-y-12">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="space-y-6"
                    >
                        <div className="flex justify-center">
                            <div className="w-16 h-16 bg-black rounded-3xl flex items-center justify-center text-white rotate-12">
                                <Search className="w-8 h-8" />
                            </div>
                        </div>
                        <h2 className="text-4xl md:text-6xl font-serif font-bold tracking-tighter text-black">
                            캔버스가 비어있습니다.
                        </h2>
                        <p className="text-gray-400 font-serif italic text-lg max-w-lg mx-auto leading-relaxed">
                            요청하신 페이지는 전시되지 않았거나 <br className="hidden md:block" />
                            존재하지 않는 작품의 경로인 것 같네요.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="flex flex-col items-center gap-8 pt-8"
                    >
                        <Link
                            href="/"
                            className="inline-flex items-center gap-4 px-10 py-5 bg-black text-white rounded-full text-sm font-bold hover:bg-zinc-800 transition-all active:scale-95 shadow-2xl shadow-black/20 group"
                        >
                            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                            메인 갤러리로 돌아가기
                        </Link>

                        <div className="flex gap-10">
                            {['Works', 'Artists', 'Magazine'].map((item) => (
                                <Link
                                    key={item}
                                    href={`/${item.toLowerCase()}`}
                                    className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300 hover:text-black transition-colors"
                                >
                                    {item}
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="fixed bottom-12 left-0 right-0 text-center"
                >
                    <p className="text-[10px] font-black tracking-[0.5em] text-gray-200 uppercase">
                        Arts Factory Premium Experience
                    </p>
                </motion.div>
            </div>
        </main>
    );
}
