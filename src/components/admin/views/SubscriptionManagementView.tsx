'use client';

import React, { useState, useEffect } from 'react';
// We need getAdminSubscriptions action
import { getAdminSubscriptions } from '@/app/actions/subscription';

export default function SubscriptionManagementView() {
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchSubscriptions = async () => {
        setIsLoading(true);
        const res = await getAdminSubscriptions();
        if (res.success) {
            setSubscriptions(res.subscriptions);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-serif font-bold">구독(렌탈) 관리</h2>
                <button onClick={fetchSubscriptions} className="text-sm underline">새로고침</button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-400 font-bold">
                        <tr>
                            <th className="px-6 py-4">구독 정보</th>
                            <th className="px-6 py-4">사용자</th>
                            <th className="px-6 py-4">기간</th>
                            <th className="px-6 py-4">월 요금</th>
                            <th className="px-6 py-4">상태</th>
                            <th className="px-6 py-4">다음 결제일</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {isLoading ? (
                            <tr><td colSpan={6} className="px-6 py-8 text-center">Loading...</td></tr>
                        ) : subscriptions.length === 0 ? (
                            <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">구독 내역이 없습니다.</td></tr>
                        ) : (
                            subscriptions.map((sub) => (
                                <tr key={sub._id} className="hover:bg-gray-50/50">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-sm">{sub.artwork_id?.title || 'Unknown Artwork'}</div>
                                        <div className="text-xs text-gray-400 capitalize">{sub.billing_cycle}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm">{sub.user_id?.name}</div>
                                        <div className="text-xs text-gray-400">{sub.user_id?.email}</div>
                                    </td>
                                    <td className="px-6 py-4 text-xs">
                                        <div>{new Date(sub.start_date).toLocaleDateString()} ~</div>
                                        <div>{new Date(sub.end_date).toLocaleDateString()}</div>
                                    </td>
                                    <td className="px-6 py-4 font-bold">
                                        {sub.monthly_fee.toLocaleString()}원
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${sub.status === 'active' ? 'bg-green-100 text-green-700' :
                                                sub.status === 'overdue' ? 'bg-red-100 text-red-700' :
                                                    'bg-gray-100 text-gray-500'
                                            }`}>
                                            {sub.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-mono">
                                        {new Date(sub.next_payment_due).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
