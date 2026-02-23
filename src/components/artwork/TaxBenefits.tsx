"use client";

import React from 'react';
import { Building2, User, Scale } from 'lucide-react';

export default function TaxBenefits() {
    return (
        <div className="mt-24 pt-16 border-t border-black/[0.05]">
            {/* 제목 영역 */}
            <div className="text-center mb-12">
                <h3 className="text-2xl lg:text-3xl font-black text-black tracking-tight flex items-center justify-center gap-3">
                    비용처리로 똑똑하게 줄이는 세금: <span className="text-[#A36B5E]">법인</span> vs <span className="text-[#64997D]">개인</span> 사업자 절세 비교
                </h3>
            </div>

            {/* 인포그래픽 컨테이너 */}
            <div className="relative bg-gradient-to-br from-[#f8fafc] via-white to-[#f1f5f9] rounded-[40px] p-8 lg:p-16 border border-white shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)] overflow-hidden">
                {/* 배경 패턴 (지오메트릭 느낌) */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px]"></div>

                <div className="relative grid grid-cols-1 lg:grid-cols-11 items-center gap-8 lg:gap-4">

                    {/* 좌측: 법인사업자 구조 */}
                    <div className="lg:col-span-4 flex flex-col items-center">
                        <h4 className="text-lg lg:text-xl font-bold text-center mb-10 leading-snug">
                            <span className="text-[#1e3a8a] block">법인사업자의</span>
                            절세 및 지불 구조
                        </h4>

                        <div className="relative w-64 h-64 flex items-center justify-center">
                            {/* SVG Chart (Navy/Gold) */}
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                {/* 실제 지불 (66% - Navy) */}
                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#1e3a8a" strokeWidth="20" strokeDasharray="251.2" strokeDashoffset="0" />
                                {/* 절세 효과 (34% - Gold/Beige) */}
                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#C6A68F" strokeWidth="20" strokeDasharray="251.2" strokeDashoffset={`${251.2 * 0.66}`} />
                            </svg>

                            {/* 중앙 아이콘 (빌딩) */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-50 flex flex-col items-center">
                                    <Building2 className="w-10 h-10 text-[#1e3a8a] mb-1" />
                                    <span className="text-[10px] font-black bg-gray-100 px-2 py-0.5 rounded">TAX</span>
                                </div>
                            </div>

                            {/* 라벨 (절세 효과 34%) */}
                            <div className="absolute top-0 left-0 -translate-x-4 -translate-y-4">
                                <div className="bg-white/90 backdrop-blur-sm border border-[#C6A68F]/30 p-3 rounded-2xl shadow-lg ring-4 ring-[#C6A68F]/5">
                                    <span className="block text-[10px] font-black text-[#A36B5E] mb-1">절세 효과</span>
                                    <span className="text-2xl font-black text-[#A36B5E]">34%</span>
                                    <p className="text-[8px] text-gray-400 mt-1 leading-tight font-medium">최고 법인세율을<br />기준으로 산정된<br />절세 수치입니다.</p>
                                </div>
                            </div>

                            {/* 라벨 (실제 지불 66%) */}
                            <div className="absolute bottom-0 right-0 translate-x-4 translate-y-4">
                                <div className="bg-[#1e3a8a] p-3 rounded-2xl shadow-lg border border-white/10">
                                    <span className="block text-[10px] font-black text-white/50 mb-1">실제 지불 비중</span>
                                    <span className="text-2xl font-black text-white leading-none">66%</span>
                                    <p className="text-[8px] text-white/40 mt-1 leading-tight font-medium">지방세, 부가세, 법인세가<br />포함된 부담 영역입니다.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 중앙: 대조 테이블 & 저울 아이콘 */}
                    <div className="lg:col-span-3 flex flex-col items-center">
                        <div className="mb-8 p-4 bg-white rounded-full shadow-sm border border-gray-100 flex items-center justify-center">
                            <Scale className="w-10 h-10 text-gray-300" />
                        </div>

                        <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="bg-gray-100 py-3 px-1 text-center font-bold text-xs text-gray-700">
                                사업자 유형별 비중 대조
                            </div>
                            <table className="w-full text-[11px] border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-50 uppercase font-black text-[9px] text-gray-400 tracking-tighter">
                                        <th className="py-2 px-1 border-r border-gray-50">구분</th>
                                        <th className="py-2 px-1 border-r border-gray-50 bg-[#1e3a8a]/[0.02] text-[#1e3a8a]">법인사업자</th>
                                        <th className="py-2 px-1 bg-[#d97706]/[0.02] text-[#d97706]">개인사업자</th>
                                    </tr>
                                </thead>
                                <tbody className="font-bold">
                                    <tr className="border-b border-gray-50">
                                        <td className="py-2.5 px-2 text-center text-gray-500 font-medium">절세 효과</td>
                                        <td className="py-2.5 px-1 text-center text-[#1e3a8a]">
                                            <div className="flex items-center justify-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-[#1e3a8a]"></span>34%
                                            </div>
                                        </td>
                                        <td className="py-2.5 px-1 text-center text-[#d97706]">
                                            <div className="flex items-center justify-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-[#d97706]"></span>51%
                                            </div>
                                        </td>
                                    </tr>
                                    <tr className="border-b border-gray-50">
                                        <td className="py-2.5 px-2 text-center text-gray-500 font-medium">실제 지불</td>
                                        <td className="py-2.5 px-1 text-center">66%</td>
                                        <td className="py-2.5 px-1 text-center">49%</td>
                                    </tr>
                                    <tr>
                                        <td className="py-3 px-2 text-center text-gray-500 font-medium leading-tight">관련 세목</td>
                                        <td className="py-3 px-1 text-center text-[9px] leading-tight font-medium text-gray-400 border-r border-gray-50">
                                            지방세, 부가세,<br />법인세
                                        </td>
                                        <td className="py-3 px-1 text-center text-[9px] leading-tight font-medium text-gray-400">
                                            지방세, 부가세,<br />소득세
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* 우측: 개인사업자 구조 */}
                    <div className="lg:col-span-4 flex flex-col items-center">
                        <h4 className="text-lg lg:text-xl font-bold text-center mb-10 leading-snug">
                            <span className="text-[#d97706] block">개인사업자의</span>
                            절세 및 지불 구조
                        </h4>

                        <div className="relative w-64 h-64 flex items-center justify-center">
                            {/* SVG Chart (Orange/Brown) */}
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                {/* 실제 지불 (49% - Light Orange) */}
                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#fbbf24" strokeWidth="20" strokeDasharray="251.2" strokeDashoffset="0" />
                                {/* 절세 효과 (51% - Dark Brown/Orange) */}
                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#d97706" strokeWidth="20" strokeDasharray="251.2" strokeDashoffset={`${251.2 * 0.49}`} />
                            </svg>

                            {/* 중앙 아이콘 (사람) */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-50 flex flex-col items-center">
                                    <User className="w-10 h-10 text-[#d97706] mb-1" />
                                    <span className="text-[10px] font-black bg-gray-100 px-2 py-0.5 rounded">TAX</span>
                                </div>
                            </div>

                            {/* 라벨 (절세 효과 51%) */}
                            <div className="absolute top-0 right-0 translate-x-4 -translate-y-4">
                                <div className="bg-white/90 backdrop-blur-sm border border-[#d97706]/30 p-3 rounded-2xl shadow-lg ring-4 ring-[#d97706]/5">
                                    <span className="block text-[10px] font-black text-[#d97706] mb-1">최대 51%의<br />강력한 절세 효과</span>
                                    <span className="text-2xl font-black text-[#d97706]">51%</span>
                                    <p className="text-[8px] text-gray-400 mt-1 leading-tight font-medium">비용처리를 통한<br />강력한 절세효과를<br />누릴 수 있습니다.</p>
                                </div>
                            </div>

                            {/* 라벨 (실제 지불 49%) */}
                            <div className="absolute bottom-0 left-0 -translate-x-4 translate-y-4">
                                <div className="bg-[#d97706] p-3 rounded-2xl shadow-lg border border-white/10">
                                    <span className="block text-[10px] font-black text-white/50 mb-1">실제 지불 비중</span>
                                    <span className="text-2xl font-black text-white leading-none">49%</span>
                                    <p className="text-[8px] text-white/40 mt-1 leading-tight font-medium">지방세, 부가세, 소득세를<br />제외한 지불 비중입니다.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <div className="mt-8 text-center text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em]">
                * 렌탈 및 구매 시 비용 처리를 통해 위와 같은 절세 혜택을 누릴 수 있습니다. 세부 사항은 담당 세무사 혹은 고객센터로 문의 바랍니다.
            </div>
        </div>
    );
}
