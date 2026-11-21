'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Search, Camera, Package, Truck, Compass, CheckCircle2 } from 'lucide-react';

const steps = [
    {
        num: '01',
        title: '사전 실사 및 반입 동선 검측',
        enTitle: 'Site Survey & Route Inspection',
        desc: '출발지 및 전시장 반입 경로(화물 E/V 하중·내경, 출입문 유효폭, 회전각)와 설치 벽면의 하중을 사전 실측하여 현장 돌발 변수를 100% 차단합니다.',
        icon: Search,
        tags: ['E/V 치수 검측', '반입 동선 도면화', '특수장비 사전계획'],
    },
    {
        num: '02',
        title: '모바일 전자 컨디션 리포트',
        enTitle: 'Digital Condition Check',
        desc: '상차 전 작가 및 큐레이터 입회 하에 고해상도 매크로 촬영을 진행하여 캔버스 텐션, 미세 크랙, 프레임 마모 상태를 디지털 서명 리포트로 기록합니다.',
        icon: Camera,
        tags: ['초고해상도 상태 촬영', '캔버스·프레임 정밀 점검', '모바일 전자 서명'],
    },
    {
        num: '03',
        title: '박물관급 맞춤 특수 포장',
        enTitle: 'Museum-Grade Packing',
        desc: '작품 표면에 잔여물이 남지 않는 중성 타이벡(Tyvek)과 대전방지 완충재, 맞춤 코너가드로 3중 밀봉하며, 해외 운송 및 취약 작품은 목재 크레이트를 수제작합니다.',
        icon: Package,
        tags: ['Tyvek 중성지 포장', '대전방지 에어캡', '주문형 목재 크레이트'],
    },
    {
        num: '04',
        title: '무진동 항온항습 특수 운송',
        enTitle: 'Air-Ride & Climate Transit',
        desc: '노면 충격을 95% 이상 상쇄하는 에어서스펜션(무진동) 탑차와 사계절 20±2℃, 습도 50±5%를 유지하는 정밀 공조 시스템을 가동하여 이동합니다.',
        icon: Truck,
        tags: ['에어서스펜션 무진동', '20℃/50% 항온항습', '실시간 온도·충격 로깅'],
    },
    {
        num: '05',
        title: '기후 순화 및 레이저 레벨 설치 (DP)',
        enTitle: 'Acclimatization & Laser DP',
        desc: '급격한 온도차로 인한 결로를 방지하기 위해 현장 순화 시간을 준수한 뒤, 전문 아트 핸들러가 레이저 레벨기를 사용하여 오차 없는 수평 큐레이션 시공을 완료합니다.',
        icon: Compass,
        tags: ['전시장 온·습도 순화', '레이저 레벨 수평 시공', '고강도 와이어 체결'],
    },
];

export default function LogisticsSOP() {
    return (
        <section className="py-20 lg:py-32 bg-white border-t border-[#121212]/10">
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <span className="text-xs font-bold text-[#C5A059] uppercase tracking-[0.25em] block mb-3">
                        Standard Operating Procedure
                    </span>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#121212] tracking-tight">
                        미술품 운송 표준 프로세스 (SOP)
                    </h2>
                    <p className="text-sm sm:text-base text-gray-700 mt-4 leading-relaxed font-medium">
                        단 한 점의 훼손도 허용하지 않는 엄격한 5단계 프로토콜에 따라 국공립 박물관 및 국제 비엔날레 기준 그대로 수행합니다.
                    </p>
                </div>

                {/* 5-Step Editorial Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {steps.map((step, idx) => {
                        const Icon = step.icon;
                        return (
                            <motion.div
                                key={step.num}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                className="bg-[#F4F1EE]/60 hover:bg-[#F4F1EE] p-6 sm:p-8 rounded-3xl border border-[#121212]/5 flex flex-col justify-between transition-all duration-300 group hover:shadow-xl hover:shadow-[#121212]/5"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-8">
                                        <span className="text-3xl font-serif font-bold text-[#C5A059]">
                                            {step.num}
                                        </span>
                                        <div className="w-10 h-10 rounded-xl bg-white border border-[#121212]/10 flex items-center justify-center text-[#121212] group-hover:bg-[#121212] group-hover:text-[#C5A059] transition-colors">
                                            <Icon className="w-5 h-5" />
                                        </div>
                                    </div>

                                    <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block mb-1">
                                        {step.enTitle}
                                    </span>
                                    <h3 className="text-lg font-bold text-[#121212] tracking-tight mb-3">
                                        {step.title}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-medium mb-6">
                                        {step.desc}
                                    </p>
                                </div>

                                <div className="pt-4 border-t border-[#121212]/5 space-y-1.5">
                                    {step.tags.map((tag) => (
                                        <div key={tag} className="text-xs text-gray-600 font-medium flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
                                            {tag}
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
