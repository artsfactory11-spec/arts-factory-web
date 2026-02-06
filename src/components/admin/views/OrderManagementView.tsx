'use client';

import React, { useState, useEffect } from 'react';
import { getAdminOrders, confirmDeposit as confirmDepositAction } from '@/app/actions/order';

export default function OrderManagementView() {
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchOrders = async () => {
        setIsLoading(true);
        // We need to implement this action
        const res = await getAdminOrders();
        if (res.success) {
            setOrders(res.orders);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleConfirmDeposit = async (orderId: string) => {
        if (!confirm('입금을 확인하시겠습니까? (상태가 결제 완료로 변경됩니다)')) return;

        const res = await confirmDepositAction(orderId);
        if (res.success) {
            alert('입금 확인 처리되었습니다.');
            fetchOrders();
        } else {
            alert('처리 실패: ' + res.error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-serif font-bold">주문 관리 (입금 확인)</h2>
                <button onClick={fetchOrders} className="text-sm underline">새로고침</button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-400 font-bold">
                        <tr>
                            <th className="px-6 py-4">주문번호/일시</th>
                            <th className="px-6 py-4">주문자/입금자</th>
                            <th className="px-6 py-4">상품</th>
                            <th className="px-6 py-4">금액</th>
                            <th className="px-6 py-4">상태</th>
                            <th className="px-6 py-4">관리</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {isLoading ? (
                            <tr><td colSpan={6} className="px-6 py-8 text-center">Loading...</td></tr>
                        ) : orders.length === 0 ? (
                            <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">주문 내역이 없습니다.</td></tr>
                        ) : (
                            orders.map((order) => (
                                <tr key={order._id} className="hover:bg-gray-50/50">
                                    <td className="px-6 py-4">
                                        <div className="font-mono text-xs text-gray-400">#{order._id.substring(0, 8)}</div>
                                        <div className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-sm">{order.user_id?.name || 'Unknown'}</div>
                                        <div className="text-xs text-blue-600">입금자: {order.depositor_name}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm">
                                            {order.items[0]?.artwork_id?.title}
                                            {order.items.length > 1 && ` 외 ${order.items.length - 1}건`}
                                        </div>
                                        <div className="text-xs text-gray-400 capitalize">{order.items[0]?.type}</div>
                                    </td>
                                    <td className="px-6 py-4 font-bold">
                                        {order.total_amount.toLocaleString()}원
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${order.status === 'pending_deposit' ? 'bg-yellow-100 text-yellow-700' :
                                            order.status === 'paid' ? 'bg-green-100 text-green-700' :
                                                'bg-gray-100 text-gray-500'
                                            }`}>
                                            {order.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {order.status === 'pending_deposit' && (
                                            <button
                                                onClick={() => handleConfirmDeposit(order._id)}
                                                className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700 transition-colors"
                                            >
                                                입금 확인
                                            </button>
                                        )}
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
