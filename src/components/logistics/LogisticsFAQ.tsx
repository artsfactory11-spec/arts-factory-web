'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle, PhoneCall, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
    {
        q: '국공립 미술관이나 지자체 관공서 제출용 비교견적서(2~3개사) 발급이 가능한가요?',
        a: '네, 가능합니다. 나라장터(G2B) 및 공공기관 회계 규정에 준하는 정식 비교견적서, 사업자등록증, 통장사본, 전자세금계산서 청구/영수 발행을 원스톱으로 지원합니다. 계산기에서 견적서 발급 신청 시 "관공서 비교견적 필요"를 체크해 주시면 담당자가 즉시 맞춤 편철본을 송부해 드립니다.',
    },
    {
        q: '미술품 특약 동산물류보험의 보상 범위와 보증 한도는 어떻게 되나요?',
        a: '국내 1군 손해보험사와의 미술품 전용 포괄 적하보험 협약으로, 상차 개시부터 운송, 하차, 전시장 벽면 설치 완료 시점까지 발생할 수 있는 충격, 파손, 훼손, 화재 등을 전액 실손 보상합니다. 기본 최대 10억 원까지 즉시 담보되며, 초고가 작품의 경우 별도 사전 특약 확장이 가능합니다.',
    },
    {
        q: '전시장 오픈 전날 야간 반입이나 주말 새벽 작업도 가능한가요?',
        a: '아트페어(KIAF, 아트부산 등)나 백화점, 쇼핑몰, 대형 미술관의 정규 개관 시간 외 야간·새벽 반입 및 철수를 정규 지원합니다. 사전 협의 시 전담 아트 핸들러 팀이 지정된 시간에 정시 대기하여 차질 없는 셋업을 완료합니다.',
    },
    {
        q: '작품 규격이 150호 이상 초대형이거나 엘리베이터에 들어가지 않을 때는 어떻게 하나요?',
        a: '사전 실사 단계에서 건물 외벽, 창문 치수, 계단 난간 폭을 정밀 검측합니다. 엘리베이터 진입이 불가한 경우 전문 스카이 크레인 및 사다리차 장비 팀을 배정하여 외벽 창문을 통한 안전 인입 작업을 수행합니다.',
    },
    {
        q: '왕복 운송을 신청했을 때, 전시 연장이나 철수 일정 변경은 가능한가요?',
        a: '전시 일정 연장 또는 조기 종료 시, 철수 희망일 최소 5일 전 고객센터로 연락 주시면 15% 왕복 할인 혜택을 그대로 유지하면서 배차 일정을 무료 조정해 드립니다.',
    },
];

export default function LogisticsFAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section className="py-20 lg:py-32 bg-[#F4F1EE] border-t border-[#121212]/10">
            <div className="max-w-4xl mx-auto px-6 lg:px-12">
                <div className="text-center mb-16">
                    <span className="text-xs font-bold text-[#C5A059] uppercase tracking-[0.25em] block mb-3">
                        Frequently Asked Questions
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#121212] tracking-tight">
                        자주 묻는 질문
                    </h2>
                    <p className="text-sm sm:text-base text-gray-700 mt-4 leading-relaxed font-medium">
                        미술품 물류, 행정 서류, 전시장 설치와 관련하여 큐레이터분들께서 가장 자주 문의하시는 내용입니다.
                    </p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, idx) => {
                        const isOpen = openIndex === idx;
                        return (
                            <div
                                key={faq.q}
                                className="bg-white rounded-2xl border border-[#121212]/10 overflow-hidden shadow-sm transition-all"
                            >
                                <button
                                    type="button"
                                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                                    className="w-full p-6 text-left flex items-center justify-between gap-4"
                                >
                                    <span className="text-base font-bold text-[#121212] tracking-tight flex items-center gap-3">
                                        <span className="w-6 h-6 rounded-full bg-[#121212]/5 text-[#C5A059] text-xs font-bold flex items-center justify-center shrink-0">
                                            Q
                                        </span>
                                        {faq.q}
                                    </span>
                                    <ChevronDown
                                        className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-300 ${
                                            isOpen ? 'rotate-180 text-[#C5A059]' : ''
                                        }`}
                                    />
                                </button>

                                <AnimatePresence initial={false}>
                                    {isOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.25 }}
                                        >
                                            <div className="px-6 pb-6 pt-2 text-sm text-gray-700 leading-relaxed font-medium border-t border-gray-100">
                                                {faq.a}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>

                {/* Direct Contact Banner */}
                <div className="mt-16 p-8 rounded-3xl bg-white border border-[#121212]/10 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div>
                        <h4 className="text-lg font-bold text-[#121212]">
                            추가적인 특수 전시 및 장기 프로젝트 문의
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1">
                            전국 순회전, 국제 비엔날레, 대규모 소장품 수장고 이전 상담을 전문 큐레이터가 직접 응대합니다.
                        </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                        <a
                            href="tel:02-000-0000"
                            className="px-5 py-3 rounded-full bg-[#121212] hover:bg-[#C5A059] hover:text-[#121212] text-white text-xs font-bold transition-colors flex items-center gap-2"
                        >
                            <PhoneCall className="w-3.5 h-3.5" />
                            전담 센터 연결
                        </a>
                        <a
                            href="#calculator"
                            className="px-5 py-3 rounded-full bg-[#F4F1EE] hover:bg-[#eae5df] text-[#121212] text-xs font-bold transition-colors flex items-center gap-2"
                        >
                            <Mail className="w-3.5 h-3.5" />
                            견적 계산하기
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
