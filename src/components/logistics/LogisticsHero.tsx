'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calculator, ArrowRight, Shield, Award, CheckCircle2 } from 'lucide-react';

export default function LogisticsHero() {
    return (
        <section className="relative pt-36 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-[#F4F1EE]">
            {/* Background Aesthetic Elements */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-[#C5A059]/15 to-transparent rounded-full blur-3xl pointer-events-none -mr-40 -mt-20" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#121212]/5 rounded-full blur-3xl pointer-events-none -ml-40" />

            <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
                <div className="max-w-3xl">
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-[#121212]/10 shadow-sm mb-6"
                    >
                        <Shield className="w-4 h-4 text-[#C5A059]" />
                        <span className="text-xs font-bold text-[#121212] uppercase tracking-wider">
                            국공립 미술관 · 갤러리 · 아트페어 공식 협력 파트너
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.1 }}
                        className="text-4xl sm:text-6xl lg:text-7xl font-serif font-bold text-[#121212] tracking-tight leading-[1.08] mb-6"
                    >
                        Art Logistics <br />
                        <span className="italic font-normal text-[#C5A059]">&</span> Installation
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="text-lg sm:text-xl text-gray-700 leading-relaxed font-medium mb-10 max-w-2xl"
                    >
                        작품의 가치까지 온전히 이동합니다. <br className="hidden sm:inline" />
                        무진동 항온항습 특수탑차와 10년 이상 경력의 전문 아트 핸들러가 함께하는 원스톱 미술품 운송·설치 솔루션.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.3 }}
                        className="flex flex-wrap items-center gap-4 mb-16"
                    >
                        <a
                            href="#calculator"
                            className="px-8 py-4 bg-[#121212] text-white hover:bg-[#C5A059] hover:text-[#121212] rounded-full text-sm font-bold tracking-wider transition-all duration-300 shadow-xl shadow-black/10 flex items-center gap-3 group"
                        >
                            <Calculator className="w-4 h-4" />
                            실시간 자동 견적 계산하기
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </a>
                        <a
                            href="#quote-form"
                            className="px-8 py-4 bg-white text-[#121212] hover:bg-gray-100 rounded-full text-sm font-bold tracking-wider border border-[#121212]/15 transition-all duration-300 shadow-sm"
                        >
                            공식 비교견적서 신청
                        </a>
                    </motion.div>

                    {/* Trust Highlights Strip */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-10 border-t border-[#121212]/10"
                    >
                        <div>
                            <span className="text-2xl sm:text-3xl font-serif font-bold text-[#121212] block">
                                100%
                            </span>
                            <span className="text-xs text-gray-700 font-bold mt-1 block">
                                무진동 에어서스 탑차
                            </span>
                        </div>
                        <div>
                            <span className="text-2xl sm:text-3xl font-serif font-bold text-[#121212] block">
                                10억
                            </span>
                            <span className="text-xs text-gray-700 font-bold mt-1 block">
                                종합적하보험 담보
                            </span>
                        </div>
                        <div>
                            <span className="text-2xl sm:text-3xl font-serif font-bold text-[#121212] block">
                                2인 1조
                            </span>
                            <span className="text-xs text-gray-700 font-bold mt-1 block">
                                전문 아트핸들러 기본투입
                            </span>
                        </div>
                        <div>
                            <span className="text-2xl sm:text-3xl font-serif font-bold text-[#121212] block">
                                G2B
                            </span>
                            <span className="text-xs text-gray-700 font-bold mt-1 block">
                                관공서 비교견적 대응
                            </span>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
