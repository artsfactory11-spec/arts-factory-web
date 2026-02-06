'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createOrder } from '@/app/actions/order';
import Link from 'next/link';

// Mock Artwork Fetcher (Client-side for simplicity, or could be server component passing data)
// For this implementation effectively, we'll fetch artwork details in specific effect or assume data passed
// But since this is a page, we should probably verify the artwork ID.

function CheckoutContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState<'form' | 'success'>('form');
    const [bankInfo, setBankInfo] = useState<any>(null);
    const [error, setError] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        recipient: '',
        phone: '',
        zipCode: '',
        address: '',
        detailAddress: '',
        depositorName: '',
        saveAddress: false
    });

    const artworkId = searchParams.get('artworkId');
    const type = searchParams.get('type') as 'purchase' | 'rental';
    const priceStr = searchParams.get('price');
    const title = searchParams.get('title'); // Passing title/price for display convenience, strictly should fetch

    const price = priceStr ? parseInt(priceStr) : 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (!artworkId || !type || !price) {
            setError('Invalid order information.');
            setIsLoading(false);
            return;
        }

        const orderParams = {
            items: [{
                artwork_id: artworkId,
                price: price,
                type: type
            }],
            depositor_name: formData.depositorName,
            shipping_address: {
                recipient: formData.recipient,
                phone: formData.phone,
                address: formData.address,
                detailAddress: formData.detailAddress,
                zipCode: formData.zipCode
            },
            save_address: formData.saveAddress
        };

        const result = await createOrder(orderParams);

        if (result.success) {
            setBankInfo(result.bankInfo);
            setStep('success');
        } else {
            setError(result.error || 'Failed to create order.');
        }
        setIsLoading(false);
    };

    if (step === 'success' && bankInfo) {
        return (
            <div className="max-w-xl mx-auto py-20 px-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h2 className="text-3xl font-serif italic mb-4">주문이 접수되었습니다!</h2>
                <p className="text-gray-500 mb-8">아래 계좌로 입금해 주시면 확인 후 배송/서비스가 시작됩니다.</p>

                <div className="bg-gray-50 p-8 rounded-2xl text-left space-y-4 mb-10 border border-gray-100">
                    <div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">은행명</span>
                        <p className="font-serif text-xl">{bankInfo.bankName}</p>
                    </div>
                    <div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">계좌번호</span>
                        <p className="font-serif text-2xl font-bold text-accent">{bankInfo.accountNumber}</p>
                    </div>
                    <div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">예금주</span>
                        <p className="font-serif text-xl">{bankInfo.accountHolder}</p>
                    </div>
                    <div className="pt-4 border-t border-gray-200 mt-4">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">총 입금 금액</span>
                        <p className="font-serif text-3xl font-bold text-charcoal">{price.toLocaleString()} KRW</p>
                    </div>
                </div>

                <div className="flex gap-4 justify-center">
                    <Link href="/" className="px-8 py-3 bg-gray-100 rounded-full text-sm font-bold hover:bg-gray-200 transition-colors">
                        홈으로
                    </Link>
                    <Link href="/mypage" className="px-8 py-3 bg-black text-white rounded-full text-sm font-bold hover:bg-accent transition-colors">
                        주문 내역 확인
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-20 px-6">
            <h1 className="text-4xl font-serif italic mb-12">Checkout</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Order Summary */}
                <div className="order-2 md:order-1">
                    <h3 className="text-xs font-bold uppercase tracking-widest mb-6 border-b border-black pb-2">주문 상품</h3>
                    <div className="bg-gray-50 p-6 rounded-2xl flex gap-4 items-center">
                        <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                            {/* Optimally we should show image here if passed or fetched */}
                            <div className="w-full h-full bg-gray-300" />
                        </div>
                        <div>
                            <span className="text-[10px] font-bold text-accent uppercase tracking-widest block mb-1">
                                {type === 'rental' ? 'Rental Service' : 'Artwork Purchase'}
                            </span>
                            <h4 className="font-serif text-xl italic mb-1">{title || 'Unknown Artwork'}</h4>
                            <p className="font-bold">{price.toLocaleString()} KRW</p>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-between items-center py-4 border-t border-gray-100">
                        <span className="font-serif text-xl">Total</span>
                        <span className="font-serif text-3xl font-bold text-accent">{price.toLocaleString()} KRW</span>
                    </div>
                    <div className="mt-8 bg-blue-50 p-4 rounded-xl text-sm text-blue-800 leading-relaxed">
                        <p className="font-bold mb-1">ⓘ 무통장 입금 안내</p>
                        주문 완료 후 제공되는 계좌로 입금해 주시면, 관리자 확인 후 배송 또는 서비스가 시작됩니다.
                    </div>
                    {error && (
                        <div className="mt-4 bg-red-50 p-4 rounded-xl text-sm text-red-600">
                            {error}
                        </div>
                    )}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="order-1 md:order-2 space-y-6">
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-widest mb-6 border-b border-black pb-2">배송 정보</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">받는 분</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full border-b border-gray-200 py-2 text-lg focus:border-black outline-none bg-transparent transition-colors"
                                    value={formData.recipient}
                                    onChange={e => setFormData({ ...formData, recipient: e.target.value })}
                                    placeholder="이름"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">연락처</label>
                                <input
                                    type="tel"
                                    required
                                    className="w-full border-b border-gray-200 py-2 text-lg focus:border-black outline-none bg-transparent transition-colors"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="010-0000-0000"
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-1">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">우편번호</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full border-b border-gray-200 py-2 text-lg focus:border-black outline-none bg-transparent transition-colors"
                                        value={formData.zipCode}
                                        onChange={e => setFormData({ ...formData, zipCode: e.target.value })}
                                        placeholder="12345"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">주소</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full border-b border-gray-200 py-2 text-lg focus:border-black outline-none bg-transparent transition-colors"
                                        value={formData.address}
                                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                                        placeholder="기본 주소"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">상세 주소</label>
                                <input
                                    type="text"
                                    className="w-full border-b border-gray-200 py-2 text-lg focus:border-black outline-none bg-transparent transition-colors"
                                    value={formData.detailAddress}
                                    onChange={e => setFormData({ ...formData, detailAddress: e.target.value })}
                                    placeholder="아파트 동, 호수 등"
                                />
                            </div>
                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="saveAddress"
                                    className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                                    checked={formData.saveAddress}
                                    onChange={e => setFormData({ ...formData, saveAddress: e.target.checked })}
                                />
                                <label htmlFor="saveAddress" className="text-sm text-gray-500">이 배송지를 기본 배송지로 저장</label>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8">
                        <h3 className="text-xs font-bold uppercase tracking-widest mb-6 border-b border-black pb-2">입금 정보</h3>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">입금자명</label>
                            <input
                                type="text"
                                required
                                className="w-full border-b border-gray-200 py-2 text-lg focus:border-black outline-none bg-transparent transition-colors"
                                value={formData.depositorName}
                                onChange={e => setFormData({ ...formData, depositorName: e.target.value })}
                                placeholder="실제 입금하실 분의 성함을 입력하세요"
                            />
                            <p className="text-xs text-gray-400 mt-2">입금 확인을 위해 정확한 성함을 입력해 주세요.</p>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-5 bg-black text-white text-sm font-bold uppercase tracking-widest rounded-full hover:bg-accent transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed mt-8"
                    >
                        {isLoading ? '처리 중...' : '주문하기 (무통장 입금)'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <CheckoutContent />
        </Suspense>
    );
}
