'use client';

import React from 'react';
import { Truck, ShieldCheck, FileCheck, Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';

const badges = [
    {
        icon: Truck,
        title: '무진동·항온항습 특수탑차',
        enTitle: 'Air-Ride & Climate Control',
        desc: '유럽 규격 에어서스펜션(무진동) 탑차와 20±2℃ / 습도 50±5%를 정밀 유지하는 항온항습 장치로 온도와 충격에 민감한 회화·조각을 안전하게 이송합니다.',
        highlight: '국내 최고 수준의 진동 흡수 시스템',
    },
    {
        icon: ShieldCheck,
        title: '미술품 특약 동산물류보험',
        enTitle: 'All-Risk Inland Transit Insurance',
        desc: '상차 시점부터 이동, 하차, 전시장 설치 완료 시까지 전 구간을 보장하는 미술품 종합 적하 특약 보험(최대 10억 원 한도)을 기본 가입 지원합니다.',
        highlight: '사고 제로 보증 & 전 구간 안심 담보',
    },
    {
        icon: FileCheck,
        title: '국공립·관공서 비교견적 대응',
        enTitle: 'Official Public Comparison Estimates',
        desc: 'G2B 나라장터 및 행정 전산 기준에 맞춘 공식 규격 비교견적서, 전자세금계산서, 사업자등록증 및 통장사본 일체를 원클릭으로 신속 발급해 드립니다.',
        highlight: '지자체·미술관·재단 행정 감사 완벽 대응',
    },
    {
        icon: Smartphone,
        title: '모바일 전자 컨디션 리포트',
        enTitle: 'Digital Condition Report',
        desc: '상차 전과 하차 후 전문 아트 핸들러가 작품의 크랙, 캔버스 텐션, 프레임 마모 상태를 고해상도 촬영하여 모바일 전자 서명 리포트로 즉시 전송합니다.',
        highlight: '투명하고 정밀한 인수인계 기록',
    },
];

export default function TrustBadges() {
    return (
        <section className="py-16 lg:py-24 bg-white/70 border-y border-[#121212]/5 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <span className="text-xs font-bold text-[#C5A059] uppercase tracking-[0.25em] block mb-3">
                        Art Logistics Standards
                    </span>
                    <h2 className="text-3xl lg:text-4xl font-serif font-bold text-[#121212] tracking-tight">
                        미술품 물류의 4대 핵심 신뢰 기준
                    </h2>
                    <p className="text-sm lg:text-base text-gray-700 mt-4 leading-relaxed font-medium">
                        단순 화물 운송과는 다른 차원의 보존 전문성과 공공기관 표준 규격을 엄격히 준수합니다.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {badges.map((b, idx) => {
                        const Icon = b.icon;
                        return (
                            <motion.div
                                key={b.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                className="bg-[#F4F1EE]/60 hover:bg-[#F4F1EE] p-8 rounded-3xl border border-[#121212]/5 transition-all duration-300 flex flex-col justify-between group hover:shadow-xl hover:shadow-[#121212]/5"
                            >
                                <div>
                                    <div className="w-14 h-14 rounded-2xl bg-white border border-[#121212]/10 flex items-center justify-center mb-6 text-[#C5A059] group-hover:bg-[#121212] group-hover:text-[#C5A059] transition-colors duration-300 shadow-sm">
                                        <Icon className="w-7 h-7" />
                                    </div>
                                    <span className="text-xs text-[#C5A059] font-bold uppercase tracking-wider block mb-1">
                                        {b.enTitle}
                                    </span>
                                    <h3 className="text-xl font-bold text-[#121212] tracking-tight mb-3">
                                        {b.title}
                                    </h3>
                                    <p className="text-sm text-gray-700 leading-relaxed font-medium">
                                        {b.desc}
                                    </p>
                                </div>
                                <div className="mt-6 pt-4 border-t border-[#121212]/5">
                                    <span className="inline-block text-xs font-bold text-[#121212] bg-white px-3 py-1 rounded-full border border-[#121212]/10">
                                        ✓ {b.highlight}
                                    </span>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
