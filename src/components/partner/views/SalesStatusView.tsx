"use client";

import React from 'react';
import {
    CreditCard,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    CheckCircle2,
    AlertCircle,
    Package,
    Calendar,
    Wallet
} from 'lucide-react';

const SalesStatusView = () => {
    // 샘플 데이터 (추후 관리자 API 연동)
    const transactions = [
        { id: 1, type: '판매', title: '고요한 숲의 아침', status: '완료', date: '2024.12.20', amount: 1200000, customer: '홍길동' },
        { id: 2, type: '렌탈', title: '푸른 파도의 기억', status: '진행중', date: '2024-12-15 ~ 2025-03-15', amount: 150000, customer: '(주)아트팩토리' },
        { id: 3, type: '판매', title: '붉은 노을의 속삭임', status: '정산대기', date: '2024.12.24', amount: 850000, customer: '이철수' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-50 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 bg-green-50 text-green-500 rounded-xl flex items-center justify-center">
                            <Wallet className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full uppercase">Earnings</span>
                    </div>
                    <p className="text-sm font-medium text-gray-400">이번 달 총 매출</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">2,200,000원</h3>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-50 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
                            <Package className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase">Rentals</span>
                    </div>
                    <p className="text-sm font-medium text-gray-400">진행 중인 렌탈</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">3건</h3>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-50 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center">
                            <Clock className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full uppercase">Settlement</span>
                    </div>
                    <p className="text-sm font-medium text-gray-400">정산 예정 금액</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">850,000원</h3>
                </div>
            </div>

            {/* Transaction List */}
            <div className="bg-white rounded-2xl border border-gray-50 shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
                    <h3 className="font-bold text-lg text-gray-900">최근 거래 내역</h3>
                    <button className="text-sm font-bold text-gray-400 hover:text-black transition-colors">전체 내역 보기</button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-50">
                                <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">구분</th>
                                <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">작품명 / 구매자</th>
                                <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">거래 금액</th>
                                <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">상태</th>
                                <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">거래 일시</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {transactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${tx.type === '판매' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'
                                            }`}>
                                            {tx.type === '판매' ? <CreditCard className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                            {tx.type}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div>
                                            <p className="font-bold text-gray-900">{tx.title}</p>
                                            <p className="text-xs text-gray-400 mt-1">{tx.customer}</p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="font-bold text-gray-900">{tx.amount.toLocaleString()}원</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            {tx.status === '완료' ? <CheckCircle2 className="w-4 h-4 text-green-500" /> :
                                                tx.status === '정산대기' ? <AlertCircle className="w-4 h-4 text-orange-500" /> :
                                                    <Clock className="w-4 h-4 text-blue-500" />}
                                            <span className={`text-sm font-medium ${tx.status === '완료' ? 'text-green-600' :
                                                    tx.status === '정산대기' ? 'text-orange-600' : 'text-blue-600'
                                                }`}>
                                                {tx.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2 text-xs text-gray-400">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {tx.date}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Info Box */}
            <div className="bg-[#fafafa] p-8 rounded-3xl border border-gray-100 flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-gray-400 mt-0.5" />
                <div>
                    <h4 className="font-bold text-gray-900 mb-2">정산 안내</h4>
                    <p className="text-sm text-gray-500 leading-relaxed">
                        모든 정산은 작품 판매/렌탈이 확정된 후 익월 10일에 일괄 처리됩니다. <br />
                        정산 내역에 대한 상세 문의는 파트너십 담당자에게 메일 부탁드립니다.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SalesStatusView;
