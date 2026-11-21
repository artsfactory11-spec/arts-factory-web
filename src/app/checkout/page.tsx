'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createOrder } from '@/app/actions/order';
import { getArtworkById } from '@/app/actions/artwork';
import Image from 'next/image';
import Link from 'next/link';

interface BankInfo {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
}

interface ArtworkData {
    _id: string;
    title: string;
    firebase_image_url: string;
    artist_id?: {
        name: string;
    };
    size?: string;
    width?: number;
    height?: number;
    ho?: number;
    price: number;
    rental_price: number;
    rental_status?: string;
}

function CheckoutContent() {
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState<'form' | 'success'>('form');
    const [bankInfo, setBankInfo] = useState<BankInfo | null>(null);
    const [error, setError] = useState('');

    const artworkId = searchParams.get('artworkId');
    const type = searchParams.get('type') as 'purchase' | 'rental';
    const priceStr = searchParams.get('price');
    const title = searchParams.get('title');

    const [artwork, setArtwork] = useState<ArtworkData | null>(null);
    const [isArtworkLoading, setIsArtworkLoading] = useState(Boolean(artworkId));

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

    useEffect(() => {
        if (!artworkId) return;
        let isMounted = true;
        getArtworkById(artworkId)
            .then((res) => {
                if (isMounted && res.success && res.artwork) {
                    setArtwork(res.artwork as ArtworkData);
                }
            })
            .catch((err: unknown) => console.error("Failed to load artwork for checkout:", err))
            .finally(() => {
                if (isMounted) setIsArtworkLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [artworkId]);

    const effectiveTitle = artwork?.title || title || '작품 정보';
    const effectivePrice = priceStr
        ? parseInt(priceStr)
        : (type === 'rental' ? artwork?.rental_price : artwork?.price) || 0;
    const artistName = artwork?.artist_id?.name || '아티스트';

    const getDimensionText = () => {
        if (!artwork) return '';
        const parts = [];
        if (artwork.ho) parts.push(`${artwork.ho}호`);
        if (artwork.width && artwork.height) {
            parts.push(`(${artwork.width} × ${artwork.height}cm)`);
        } else if (artwork.size) {
            parts.push(artwork.size);
        }
        return parts.join(' ');
    };

    const dimensionText = getDimensionText();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (!artworkId || !type || !effectivePrice) {
            setError('주문 정보가 올바르지 않습니다.');
            setIsLoading(false);
            return;
        }

        const orderParams = {
            items: [{
                artwork_id: artworkId,
                price: effectivePrice,
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

        if (result.success && result.bankInfo) {
            setBankInfo(result.bankInfo);
            setStep('success');
        } else {
            setError(result.error || '주문 생성에 실패했습니다.');
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
                <h2 className="text-3xl font-serif mb-4">주문이 접수되었습니다!</h2>
                <p className="text-gray-700 mb-8">아래 계좌로 입금해 주시면 확인 후 배송 및 설치 일정을 안내해 드립니다.</p>

                <div className="bg-white p-8 rounded-2xl text-left space-y-4 mb-10 border border-gray-100 shadow-sm">
                    <div>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1">은행명</span>
                        <p className="font-serif text-xl">{bankInfo.bankName}</p>
                    </div>
                    <div>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1">계좌번호</span>
                        <p className="font-serif text-2xl font-bold text-accent">{bankInfo.accountNumber}</p>
                    </div>
                    <div>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1">예금주</span>
                        <p className="font-serif text-xl">{bankInfo.accountHolder}</p>
                    </div>
                    <div className="pt-4 border-t border-gray-100 mt-4">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1">총 입금 금액</span>
                        <p className="font-serif text-3xl font-bold text-charcoal">{effectivePrice.toLocaleString()} KRW</p>
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
        <div className="max-w-4xl mx-auto py-16 px-6">
            <h1 className="text-4xl font-serif mb-10">Checkout</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Order Summary */}
                <div className="order-2 md:order-1">
                    <h3 className="text-xs font-bold uppercase tracking-widest mb-6 border-b border-black/10 pb-2 text-charcoal">
                        주문 요약
                    </h3>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-5 items-start">
                        {isArtworkLoading ? (
                            <div className="w-24 h-24 bg-gray-200 rounded-xl animate-pulse shrink-0" />
                        ) : artwork?.firebase_image_url ? (
                            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden relative shrink-0 border border-gray-100 shadow-sm bg-gray-50">
                                <Image
                                    src={artwork.firebase_image_url}
                                    alt={effectiveTitle}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        ) : (
                            <div className="w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-xs shrink-0">
                                No Image
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 bg-accent/10 text-accent border border-accent/20">
                                {type === 'rental' ? '월 렌탈 서비스' : '원화 소장 구매'}
                            </span>
                            <h4 className="font-serif text-xl text-charcoal font-medium truncate mb-1">
                                {effectiveTitle}
                            </h4>
                            <p className="text-xs text-gray-600 mb-1">
                                작가: <span className="font-semibold text-charcoal">{artistName}</span>
                            </p>
                            {dimensionText && (
                                <p className="text-xs text-gray-500 mb-2 font-mono">
                                    규격: {dimensionText}
                                </p>
                            )}
                            <p className="text-lg font-bold text-charcoal mt-2">
                                {effectivePrice.toLocaleString()} KRW
                                {type === 'rental' && <span className="text-xs font-normal text-gray-500 ml-1">/월</span>}
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-3">
                        <div className="flex justify-between items-center text-sm text-gray-600">
                            <span>{type === 'rental' ? '월 렌탈료' : '작품 금액'}</span>
                            <span className="font-medium text-charcoal">{effectivePrice.toLocaleString()} KRW</span>
                        </div>
                        <div className="flex justify-between items-center text-sm text-gray-600">
                            <span>안전 배송 및 설치</span>
                            <span className="font-medium text-accent">무료 (전국 안전 배송)</span>
                        </div>
                        <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                            <span className="font-serif text-lg font-medium text-charcoal">최종 결제 예정 금액</span>
                            <span className="font-serif text-2xl font-bold text-accent">
                                {effectivePrice.toLocaleString()} KRW
                                {type === 'rental' && <span className="text-xs font-normal text-gray-500 ml-1 font-sans">/월</span>}
                            </span>
                        </div>
                    </div>

                    <div className="mt-6 bg-stone-50 p-5 rounded-2xl text-xs text-stone-700 leading-relaxed border border-stone-200/60">
                        <p className="font-bold text-stone-900 mb-1">ⓘ 안전 결제 및 배송 안내</p>
                        주문 접수 후 안내되는 공식 계좌로 입금해 주시면, 전문 아트 큐레이터가 확인 후 24시간 이내에 배송 및 설치 일정을 조율해 드립니다.
                    </div>
                    {error && (
                        <div className="mt-4 bg-red-50 p-4 rounded-xl text-sm text-red-600 border border-red-100">
                            {error}
                        </div>
                    )}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="order-1 md:order-2 space-y-6">
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-widest mb-6 border-b border-black/10 pb-2 text-charcoal">
                            배송 정보
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">받는 분</label>
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
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">연락처</label>
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
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">우편번호</label>
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
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">주소</label>
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
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">상세 주소</label>
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
                                <label htmlFor="saveAddress" className="text-sm text-gray-700">이 배송지를 기본 배송지로 저장</label>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8">
                        <h3 className="text-xs font-bold uppercase tracking-widest mb-6 border-b border-black/10 pb-2 text-charcoal">
                            입금 정보
                        </h3>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">입금자명</label>
                            <input
                                type="text"
                                required
                                className="w-full border-b border-gray-200 py-2 text-lg focus:border-black outline-none bg-transparent transition-colors"
                                value={formData.depositorName}
                                onChange={e => setFormData({ ...formData, depositorName: e.target.value })}
                                placeholder="실제 입금하실 분의 성함을 입력하세요"
                            />
                            <p className="text-xs text-gray-500 mt-2">입금 확인을 위해 정확한 성함을 입력해 주세요.</p>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-5 bg-black text-white text-sm font-bold uppercase tracking-widest rounded-full hover:bg-accent transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed mt-8 shadow-lg shadow-black/10"
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
