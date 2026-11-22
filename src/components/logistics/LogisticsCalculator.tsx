'use client';

import React, { useState, useMemo } from 'react';
import { 
    Plus, Trash2, Truck, Users, ShieldAlert, Check, HelpCircle, 
    Printer, Send, FileSpreadsheet, Sparkles, Building, ArrowRightLeft,
    CheckCircle2, AlertCircle, RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LogisticsQuoteModal from './LogisticsQuoteModal';

export interface ArtworkItem {
    id: string;
    title: string;
    type: 'painting' | 'glass_frame' | 'sculpture' | 'installation';
    sizeTier: '10' | '30' | '50' | '100' | '120';
    width?: number; // 가로 or 지름 cm
    height?: number; // 세로 or 높이 cm
    depth?: number; // 두께 or 폭 cm
    weight?: number; // 무게 kg
    details?: string; // 대형/설치 특이사항
    quantity: number;
    declaredValue: number; // in 만원 (10,000 KRW)
}

export type TripType = 'one_way' | 'round_trip' | 'consolidation';
export type Region = 'capital' | 'chungcheong' | 'jeolla' | 'gyeongsang' | 'gangwon_jeju';
export type ElevatorType = 'cargo' | 'passenger' | 'stairs';
export type PackagingOption = 'standard' | 'museum' | 'crate';
export type InstallationOption = 'none' | 'basic' | 'laser';

const REGION_LABELS: Record<Region, string> = {
    capital: '수도권 (서울/경기/인천)',
    chungcheong: '충청 · 대전 / 세종',
    jeolla: '전라 · 광주',
    gyeongsang: '경상 · 대구 / 부산',
    gangwon_jeju: '강원 · 도서산간',
};

export const ART_TYPE_LABELS: Record<string, string> = {
    painting: '평면 회화 (캔버스/판넬)',
    glass_frame: '유리 / 아크릴 액자',
    sculpture: '도자 · 입체 조각',
    installation: '대형 / 설치 미술',
};

export const SIZE_LABELS: Record<string, string> = {
    '10': '10호 이하 (~53cm)',
    '30': '30호 (~90cm)',
    '50': '50호 (~116cm)',
    '100': '100호 (~162cm)',
    '120': '120호 이상/초대형 (200cm+)',
};

/**
 * 만 원 단위 숫자를 친숙한 한글 금액 표기로 변환
 * 예: 1400 -> "1,400만 원", 15000 -> "1억 5,000만 원", 250000 -> "25억 원"
 */
export function formatKoreanCurrency(manwon: number): string {
    if (!manwon || isNaN(manwon) || manwon <= 0) return '0원';
    const eok = Math.floor(manwon / 10000);
    const restMan = manwon % 10000;
    if (eok > 0) {
        if (restMan > 0) {
            return `${eok.toLocaleString()}억 ${restMan.toLocaleString()}만 원`;
        }
        return `${eok.toLocaleString()}억 원`;
    }
    return `${manwon.toLocaleString()}만 원`;
}

export default function LogisticsCalculator() {
    // 1. 운송 유형
    const [tripType, setTripType] = useState<TripType>('round_trip');

    // 2. 작품 목록
    const [artworks, setArtworks] = useState<ArtworkItem[]>([
        {
            id: 'art-1',
            title: '작품 1 (예: 유채 캔버스)',
            type: 'painting',
            sizeTier: '50',
            width: 116,
            height: 91,
            depth: 3,
            quantity: 2,
            declaredValue: 2000, // 2,000만원
        },
    ]);

    // 3. 반출입 환경
    const [originRegion, setOriginRegion] = useState<Region>('capital');
    const [destRegion, setDestRegion] = useState<Region>('capital');
    const [originElevator, setOriginElevator] = useState<ElevatorType>('cargo');
    const [destElevator, setDestElevator] = useState<ElevatorType>('passenger');
    const [ladderTruck, setLadderTruck] = useState<boolean>(false);

    // 4. 부가 옵션
    const [packaging, setPackaging] = useState<PackagingOption>('museum');
    const [installation, setInstallation] = useState<InstallationOption>('laser');
    const [insuranceEnabled, setInsuranceEnabled] = useState<boolean>(true);

    // 모달 상태
    const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
    const [quoteModalInitialTab, setQuoteModalInitialTab] = useState<'form' | 'print'>('form');

    // 작품 추가
    const handleAddArtwork = () => {
        const nextId = `art-${Date.now()}`;
        setArtworks(prev => [
            ...prev,
            {
                id: nextId,
                title: `작품 ${prev.length + 1}`,
                type: 'painting',
                sizeTier: '30',
                width: 90,
                height: 72,
                depth: 3,
                quantity: 1,
                declaredValue: 1000,
            },
        ]);
    };

    // 작품 삭제
    const handleRemoveArtwork = (id: string) => {
        if (artworks.length <= 1) return;
        setArtworks(prev => prev.filter(a => a.id !== id));
    };

    // 작품 항목 업데이트
    const handleUpdateArtwork = (id: string, field: keyof ArtworkItem, value: any) => {
        setArtworks(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a));
    };

    // 평가액 빠른 증감 헬퍼
    const handleAddDeclaredValue = (id: string, deltaManwon: number) => {
        setArtworks(prev => prev.map(a => {
            if (a.id !== id) return a;
            const current = Number(a.declaredValue) || 0;
            const next = deltaManwon === 0 ? 0 : Math.max(0, current + deltaManwon);
            return { ...a, declaredValue: next };
        }));
    };

    // 견적 계산 로직
    const quote = useMemo(() => {
        const totalPieces = artworks.reduce((acc, a) => acc + (Number(a.quantity) || 1), 0);
        const totalValueKRW = artworks.reduce((acc, a) => acc + ((Number(a.declaredValue) || 0) * 10000), 0);

        // 대형/설치 미술품 포함 여부 확인
        const hasInstallation = artworks.some(a => a.type === 'installation');

        // 실측 치수 및 호수 가중치 분석
        const sizeWeights: Record<string, number> = { '10': 10, '30': 30, '50': 50, '100': 100, '120': 150 };
        let maxCustomDimension = 0;
        let largePieceCount = 0;
        let totalSizePoints = 0;

        artworks.forEach(a => {
            const qty = Number(a.quantity) || 1;
            const maxDim = Math.max(Number(a.width) || 0, Number(a.height) || 0, Number(a.depth) || 0);
            if (maxDim > maxCustomDimension) {
                maxCustomDimension = maxDim;
            }

            // 대형 조건: 실측 최장변 160cm 이상 or 100호/120호 이상 or 조각/설치
            const isLarge = maxDim >= 160 || a.sizeTier === '100' || a.sizeTier === '120' || a.type === 'sculpture' || a.type === 'installation';
            if (isLarge) {
                largePieceCount += qty;
            }

            if (a.type === 'painting') {
                totalSizePoints += (sizeWeights[a.sizeTier] || 50) * qty;
            } else if (a.type === 'glass_frame') {
                const approx = maxDim >= 160 ? 150 : maxDim >= 120 ? 100 : maxDim >= 90 ? 50 : 30;
                totalSizePoints += approx * qty;
            } else if (a.type === 'sculpture') {
                totalSizePoints += (maxDim >= 120 ? 150 : 80) * qty;
            } else if (a.type === 'installation') {
                totalSizePoints += 150 * qty;
            }
        });

        // 1. 차량 추천: 1톤 vs 2.5톤
        // 최장변 160cm 이상, 호수 점수 > 280, 총 수량 > 12점, 대형 작품 >= 3점, 설치 미술 포함 시 2.5톤 추천
        const is2_5Ton = maxCustomDimension >= 160 || totalSizePoints > 280 || totalPieces > 12 || largePieceCount >= 3 || hasInstallation;
        const recommendedTruck = is2_5Ton ? '2.5톤 하이탑 무진동 특수탑차' : '1톤 하이탑 무진동 특수탑차';

        // 2. 인원 산출: 기본 2인, 2.5톤이거나 대형 2점 이상, 계단, 설치미술 포함 시 3~4인
        let handlersCount = 2;
        const hasStairs = originElevator === 'stairs' || destElevator === 'stairs';
        if (is2_5Ton || largePieceCount >= 2 || hasStairs || hasInstallation) {
            handlersCount = 3;
        }
        if (is2_5Ton && hasStairs && (largePieceCount >= 3 || hasInstallation)) {
            handlersCount = 4;
        }

        // 3. 거리 기반 기본 운임 (수도권 ↔ 지방)
        const isInterRegion = originRegion !== destRegion;
        let baseVehicleCost = is2_5Ton ? 420000 : 280000;
        if (isInterRegion) {
            if (originRegion === 'gangwon_jeju' || destRegion === 'gangwon_jeju') {
                baseVehicleCost = is2_5Ton ? 750000 : 550000;
            } else if (originRegion === 'gyeongsang' || destRegion === 'gyeongsang' || originRegion === 'jeolla' || destRegion === 'jeolla') {
                baseVehicleCost = is2_5Ton ? 680000 : 490000;
            } else {
                baseVehicleCost = is2_5Ton ? 550000 : 380000;
            }
        }

        // 운송 유형 반영
        if (tripType === 'round_trip') {
            baseVehicleCost = Math.round(baseVehicleCost * 2 * 0.85); // 왕복 15% 할인
        } else if (tripType === 'consolidation') {
            baseVehicleCost = Math.round(baseVehicleCost * 0.65); // 정기 혼적 35% 절감
        }

        // 4. 인건비
        const baseLaborPerPerson = (tripType === 'round_trip') ? 350000 : 200000;
        let laborCost = handlersCount * baseLaborPerPerson;
        if (hasStairs) {
            laborCost += (handlersCount * 50000); // 계단 운반 양중 할증
        }

        // 5. 포장비
        let packagingCost = 0;
        if (packaging === 'museum') {
            packagingCost = totalPieces * 35000;
        } else if (packaging === 'crate') {
            packagingCost = totalPieces * 180000;
        }

        // 6. 설치비
        let installCost = 0;
        if (installation === 'basic') {
            installCost = totalPieces * 25000;
        } else if (installation === 'laser') {
            installCost = totalPieces * 45000;
        }

        // 7. 특수장비비
        const ladderCost = ladderTruck ? 150000 : 0;

        // 8. 보험료 (평가액의 0.3%)
        let insuranceCost = 0;
        if (insuranceEnabled && totalValueKRW > 0) {
            insuranceCost = Math.round(totalValueKRW * 0.003);
            if (insuranceCost < 30000) insuranceCost = 30000; // 최저 기본 보험료
        }

        // 소계 및 VAT
        const subtotal = baseVehicleCost + laborCost + packagingCost + installCost + ladderCost + insuranceCost;
        const vat = Math.round(subtotal * 0.1);
        const totalWithVat = subtotal + vat;

        return {
            totalPieces,
            totalValueKRW,
            recommendedTruck,
            handlersCount,
            baseVehicleCost,
            laborCost,
            packagingCost,
            installCost,
            ladderCost,
            insuranceCost,
            subtotal,
            vat,
            totalWithVat,
            is2_5Ton,
            hasStairs,
            hasInstallation,
            maxCustomDimension,
        };
    }, [
        tripType, artworks, originRegion, destRegion,
        originElevator, destElevator, ladderTruck,
        packaging, installation, insuranceEnabled
    ]);

    return (
        <section id="calculator" className="py-20 lg:py-32 bg-[#F4F1EE] border-t border-[#121212]/10">
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="text-xs font-bold text-[#C5A059] uppercase tracking-[0.25em] block mb-3">
                        Real-time Estimation
                    </span>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#121212] tracking-tight">
                        실시간 아트 물류 자동 견적 계산기
                    </h2>
                    <p className="text-sm sm:text-base text-gray-700 mt-4 leading-relaxed font-medium">
                        작품 유형별 세부 실측 치수와 이동 환경을 선택하시면 즉시 투입 차량, 전문 인력 및 항목별 공식 산출 견적을 확인할 수 있습니다.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    {/* Left: Input Form (7 cols) */}
                    <div className="lg:col-span-7 space-y-12">
                        {/* 1. 운송 유형 선택 */}
                        <div className="bg-white p-8 rounded-3xl border border-[#121212]/10 shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-[#121212] flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-[#121212] text-white text-xs font-bold flex items-center justify-center">1</span>
                                    운송 유형 선택
                                </h3>
                                <span className="text-xs text-gray-500 font-medium">단독 배차 및 정기 혼적 지원</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setTripType('one_way')}
                                    className={`p-4 rounded-2xl border text-left transition-all ${
                                        tripType === 'one_way'
                                            ? 'border-[#121212] bg-[#121212] text-white shadow-md'
                                            : 'border-gray-200 bg-white text-gray-800 hover:border-gray-300'
                                    }`}
                                >
                                    <span className="text-xs font-bold uppercase tracking-wider block opacity-70">One-way</span>
                                    <p className="text-base font-bold mt-1">편도 (반입)</p>
                                    <p className={`text-xs mt-1 ${tripType === 'one_way' ? 'text-gray-300' : 'text-gray-500'}`}>전시장 또는 보관소 입고</p>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setTripType('round_trip')}
                                    className={`p-4 rounded-2xl border text-left transition-all relative ${
                                        tripType === 'round_trip'
                                            ? 'border-[#C5A059] bg-[#121212] text-white shadow-md ring-2 ring-[#C5A059]/30'
                                            : 'border-gray-200 bg-white text-gray-800 hover:border-gray-300'
                                    }`}
                                >
                                    <span className="absolute top-2 right-2 px-2 py-0.5 bg-[#C5A059] text-[#121212] text-xs font-bold rounded-full">
                                        15% 할인
                                    </span>
                                    <span className="text-xs font-bold uppercase tracking-wider block opacity-70">Round-trip</span>
                                    <p className="text-base font-bold mt-1">왕복 (반입 + 철수)</p>
                                    <p className={`text-xs mt-1 ${tripType === 'round_trip' ? 'text-[#C5A059]' : 'text-gray-500'}`}>전시 종료 후 원상복구 일괄</p>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setTripType('consolidation')}
                                    className={`p-4 rounded-2xl border text-left transition-all relative ${
                                        tripType === 'consolidation'
                                            ? 'border-[#121212] bg-[#121212] text-white shadow-md'
                                            : 'border-gray-200 bg-white text-gray-800 hover:border-gray-300'
                                    }`}
                                >
                                    <span className="absolute top-2 right-2 px-2 py-0.5 bg-gray-200 text-gray-700 text-xs font-bold rounded-full">
                                        경제적
                                    </span>
                                    <span className="text-xs font-bold uppercase tracking-wider block opacity-70">Consolidation</span>
                                    <p className="text-base font-bold mt-1">지방 정기 혼적</p>
                                    <p className={`text-xs mt-1 ${tripType === 'consolidation' ? 'text-gray-300' : 'text-gray-500'}`}>월 2회 주요 지방 정기 운행</p>
                                </button>
                            </div>
                        </div>

                        {/* 2. 작품 규격 및 수량 입력 (동적 행 추가) */}
                        <div className="bg-white p-8 rounded-3xl border border-[#121212]/10 shadow-sm space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-[#121212] flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-[#121212] text-white text-xs font-bold flex items-center justify-center">2</span>
                                    작품 규격 및 수량 입력
                                </h3>
                                <button
                                    type="button"
                                    onClick={handleAddArtwork}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#F4F1EE] hover:bg-[#eae5df] text-[#121212] text-xs font-bold rounded-full transition-colors"
                                >
                                    <Plus className="w-3.5 h-3.5 text-[#C5A059]" />
                                    작품 추가하기
                                </button>
                            </div>

                            <div className="space-y-6">
                                <AnimatePresence initial={false}>
                                    {artworks.map((art, index) => {
                                        const isHighValue = (Number(art.declaredValue) || 0) >= 100000; // 10억 이상 입력 시 오입력 의심

                                        return (
                                            <motion.div
                                                key={art.id}
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.25 }}
                                                className="p-6 rounded-2xl bg-[#F4F1EE]/50 border border-gray-200 space-y-5"
                                            >
                                                {/* Card Header: Index & Title */}
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2 flex-grow max-w-sm">
                                                        <span className="text-xs font-bold text-gray-500">#{index + 1}</span>
                                                        <input
                                                            type="text"
                                                            value={art.title}
                                                            onChange={(e) => handleUpdateArtwork(art.id, 'title', e.target.value)}
                                                            placeholder="작품명 (선택 입력)"
                                                            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-sm font-medium focus:ring-1 focus:ring-[#C5A059] focus:outline-none"
                                                        />
                                                    </div>
                                                    {artworks.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveArtwork(art.id)}
                                                            className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg transition-colors"
                                                            title="작품 삭제"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Primary Parameters: Type, Qty, Declared Value */}
                                                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                                                    {/* 유형 선택 */}
                                                    <div className="sm:col-span-4">
                                                        <label className="text-xs font-bold text-gray-700 mb-1.5 block">작품 유형</label>
                                                        <select
                                                            value={art.type}
                                                            onChange={(e) => handleUpdateArtwork(art.id, 'type', e.target.value)}
                                                            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium focus:ring-1 focus:ring-[#C5A059] focus:outline-none"
                                                        >
                                                            <option value="painting">평면 회화 (캔버스/판넬)</option>
                                                            <option value="glass_frame">유리 / 아크릴 액자</option>
                                                            <option value="sculpture">도자 · 입체 조각</option>
                                                            <option value="installation">대형 / 설치 미술</option>
                                                        </select>
                                                    </div>

                                                    {/* 수량 */}
                                                    <div className="sm:col-span-2">
                                                        <label className="text-xs font-bold text-gray-700 mb-1.5 block">수량 (점)</label>
                                                        <input
                                                            type="number"
                                                            min={1}
                                                            max={100}
                                                            value={art.quantity}
                                                            onChange={(e) => handleUpdateArtwork(art.id, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
                                                            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium focus:ring-1 focus:ring-[#C5A059] focus:outline-none"
                                                        />
                                                    </div>

                                                    {/* 평가액 입력 & 실시간 한글 금액 변환 */}
                                                    <div className="sm:col-span-6">
                                                        <div className="flex items-center justify-between mb-1.5">
                                                            <label className="text-xs font-bold text-gray-700">작품 평가액 (단위: 만 원)</label>
                                                            <span className="text-xs font-bold text-[#C5A059]">
                                                                = {formatKoreanCurrency(Number(art.declaredValue) || 0)}
                                                            </span>
                                                        </div>
                                                        <div className="relative">
                                                            <input
                                                                type="number"
                                                                min={0}
                                                                step={50}
                                                                value={art.declaredValue}
                                                                onChange={(e) => handleUpdateArtwork(art.id, 'declaredValue', Math.max(0, parseInt(e.target.value) || 0))}
                                                                placeholder="예: 1400 (1,400만 원)"
                                                                className={`w-full bg-white border rounded-xl px-3 py-2 text-xs sm:text-sm font-medium focus:outline-none ${
                                                                    isHighValue 
                                                                        ? 'border-amber-500 focus:ring-1 focus:ring-amber-500 text-amber-900 bg-amber-50/30' 
                                                                        : 'border-gray-200 focus:ring-1 focus:ring-[#C5A059]'
                                                                }`}
                                                            />
                                                        </div>

                                                        {/* 빠른 금액 추가 버튼 */}
                                                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleAddDeclaredValue(art.id, 100)}
                                                                className="px-2 py-0.5 bg-white hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-md border border-gray-200 transition-colors"
                                                            >
                                                                +100만
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleAddDeclaredValue(art.id, 500)}
                                                                className="px-2 py-0.5 bg-white hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-md border border-gray-200 transition-colors"
                                                            >
                                                                +500만
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleAddDeclaredValue(art.id, 1000)}
                                                                className="px-2 py-0.5 bg-white hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-md border border-gray-200 transition-colors"
                                                            >
                                                                +1,000만
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleAddDeclaredValue(art.id, 0)}
                                                                className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 text-gray-500 text-xs font-bold rounded-md transition-colors flex items-center gap-1"
                                                                title="금액 초기화"
                                                            >
                                                                <RotateCcw className="w-3 h-3" />
                                                                초기화
                                                            </button>
                                                        </div>

                                                        {/* 오입력 방지 경고 문구 */}
                                                        {isHighValue && (
                                                            <p className="text-xs text-amber-700 font-bold mt-1.5 flex items-center gap-1 bg-amber-50 p-1.5 rounded-lg border border-amber-200">
                                                                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                                                                ※ 입력 단위는 &apos;만원&apos;입니다. 1,400만 원의 경우 1400을 입력해 주세요. (현재: {formatKoreanCurrency(Number(art.declaredValue))})
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Type-Specific Dimensions UI */}
                                                <div className="pt-2 border-t border-gray-200/80">
                                                    {/* 1. 평면 회화: 호수 드롭다운 + 세부 실측 치수(가로/세로/두께) */}
                                                    {art.type === 'painting' && (
                                                        <div className="space-y-3">
                                                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                                                                <div>
                                                                    <label className="text-xs font-bold text-gray-700 mb-1.5 block">표준 호수</label>
                                                                    <select
                                                                        value={art.sizeTier}
                                                                        onChange={(e) => handleUpdateArtwork(art.id, 'sizeTier', e.target.value)}
                                                                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium focus:ring-1 focus:ring-[#C5A059] focus:outline-none"
                                                                    >
                                                                        <option value="10">10호 이하 (~53cm)</option>
                                                                        <option value="30">30호 (~90cm)</option>
                                                                        <option value="50">50호 (~116cm)</option>
                                                                        <option value="100">100호 (~162cm)</option>
                                                                        <option value="120">120호+ (200cm+)</option>
                                                                    </select>
                                                                </div>

                                                                <div>
                                                                    <label className="text-xs font-bold text-gray-700 mb-1.5 block">실측 가로 (cm)</label>
                                                                    <input
                                                                        type="number"
                                                                        placeholder="예: 116"
                                                                        value={art.width || ''}
                                                                        onChange={(e) => handleUpdateArtwork(art.id, 'width', parseFloat(e.target.value) || undefined)}
                                                                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium focus:ring-1 focus:ring-[#C5A059] focus:outline-none"
                                                                    />
                                                                </div>

                                                                <div>
                                                                    <label className="text-xs font-bold text-gray-700 mb-1.5 block">실측 세로 (cm)</label>
                                                                    <input
                                                                        type="number"
                                                                        placeholder="예: 91"
                                                                        value={art.height || ''}
                                                                        onChange={(e) => handleUpdateArtwork(art.id, 'height', parseFloat(e.target.value) || undefined)}
                                                                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium focus:ring-1 focus:ring-[#C5A059] focus:outline-none"
                                                                    />
                                                                </div>

                                                                <div>
                                                                    <label className="text-xs font-bold text-gray-700 mb-1.5 block">캔버스 두께 (cm)</label>
                                                                    <input
                                                                        type="number"
                                                                        placeholder="예: 3"
                                                                        value={art.depth || ''}
                                                                        onChange={(e) => handleUpdateArtwork(art.id, 'depth', parseFloat(e.target.value) || undefined)}
                                                                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium focus:ring-1 focus:ring-[#C5A059] focus:outline-none"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <p className="text-xs text-gray-500">
                                                                ※ 캔버스 실측 치수를 기입하시면 특수 차량 적재 공간과 맞춤 완충 포장재가 정밀하게 배정됩니다.
                                                            </p>
                                                        </div>
                                                    )}

                                                    {/* 2. 유리/아크릴 액자: 액자 외곽 실측 기준 (가로 × 세로 × 두께) */}
                                                    {art.type === 'glass_frame' && (
                                                        <div className="space-y-2">
                                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                                <div>
                                                                    <label className="text-xs font-bold text-gray-700 mb-1.5 block">외곽 가로 (cm)</label>
                                                                    <input
                                                                        type="number"
                                                                        placeholder="예: 130"
                                                                        value={art.width || ''}
                                                                        onChange={(e) => handleUpdateArtwork(art.id, 'width', parseFloat(e.target.value) || undefined)}
                                                                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium focus:ring-1 focus:ring-[#C5A059] focus:outline-none"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="text-xs font-bold text-gray-700 mb-1.5 block">외곽 세로 (cm)</label>
                                                                    <input
                                                                        type="number"
                                                                        placeholder="예: 100"
                                                                        value={art.height || ''}
                                                                        onChange={(e) => handleUpdateArtwork(art.id, 'height', parseFloat(e.target.value) || undefined)}
                                                                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium focus:ring-1 focus:ring-[#C5A059] focus:outline-none"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="text-xs font-bold text-gray-700 mb-1.5 block">프레임 두께/깊이 (cm)</label>
                                                                    <input
                                                                        type="number"
                                                                        placeholder="예: 6"
                                                                        value={art.depth || ''}
                                                                        onChange={(e) => handleUpdateArtwork(art.id, 'depth', parseFloat(e.target.value) || undefined)}
                                                                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium focus:ring-1 focus:ring-[#C5A059] focus:outline-none"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <p className="text-xs text-gray-500">
                                                                ※ 프레임 외곽 돌출부와 유리 파손 방지를 위해 글라스 전용 코너캡 및 대전방지 완충재가 자동 적용됩니다.
                                                            </p>
                                                        </div>
                                                    )}

                                                    {/* 3. 도자 · 입체 조각: 지름/가로 × 폭/세로 × 높이 + 무게 */}
                                                    {art.type === 'sculpture' && (
                                                        <div className="space-y-2">
                                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                                <div>
                                                                    <label className="text-xs font-bold text-gray-700 mb-1.5 block">지름/가로 (cm)</label>
                                                                    <input
                                                                        type="number"
                                                                        placeholder="예: 50"
                                                                        value={art.width || ''}
                                                                        onChange={(e) => handleUpdateArtwork(art.id, 'width', parseFloat(e.target.value) || undefined)}
                                                                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium focus:ring-1 focus:ring-[#C5A059] focus:outline-none"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="text-xs font-bold text-gray-700 mb-1.5 block">폭/세로 (cm)</label>
                                                                    <input
                                                                        type="number"
                                                                        placeholder="예: 50"
                                                                        value={art.height || ''}
                                                                        onChange={(e) => handleUpdateArtwork(art.id, 'height', parseFloat(e.target.value) || undefined)}
                                                                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium focus:ring-1 focus:ring-[#C5A059] focus:outline-none"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="text-xs font-bold text-gray-700 mb-1.5 block">높이 (cm)</label>
                                                                    <input
                                                                        type="number"
                                                                        placeholder="예: 80"
                                                                        value={art.depth || ''}
                                                                        onChange={(e) => handleUpdateArtwork(art.id, 'depth', parseFloat(e.target.value) || undefined)}
                                                                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium focus:ring-1 focus:ring-[#C5A059] focus:outline-none"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="text-xs font-bold text-gray-700 mb-1.5 block">무게 (kg, 선택)</label>
                                                                    <input
                                                                        type="number"
                                                                        placeholder="예: 25"
                                                                        value={art.weight || ''}
                                                                        onChange={(e) => handleUpdateArtwork(art.id, 'weight', parseFloat(e.target.value) || undefined)}
                                                                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium focus:ring-1 focus:ring-[#C5A059] focus:outline-none"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <p className="text-xs text-gray-500">
                                                                ※ 조각 좌대 및 파손 취약 부위(손가락, 돌출 오브제)를 고려하여 고정 하네스 및 맞춤 폼이 적용됩니다.
                                                            </p>
                                                        </div>
                                                    )}

                                                    {/* 4. 대형 / 설치 미술: 안내 박스 + 상세 상담 입력란 */}
                                                    {art.type === 'installation' && (
                                                        <div className="space-y-3 p-4 rounded-xl bg-amber-50/70 border border-amber-200/80">
                                                            <div className="flex items-start gap-2.5">
                                                                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                                                <div>
                                                                    <p className="text-xs font-bold text-amber-900">
                                                                        대형·설치 작품은 현장 실측 후 정확한 견적 산출이 가능합니다.
                                                                    </p>
                                                                    <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                                                                        공간 구조, 천장 하중, 전원 연결, 분해/조립 구조에 따라 전문 테크니션 팀이 사전 실사를 진행합니다. 아래 특이사항을 적어주시면 수석 핸들러가 기술 검토 후 연락드립니다.
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <textarea
                                                                    rows={2}
                                                                    value={art.details || ''}
                                                                    onChange={(e) => handleUpdateArtwork(art.id, 'details', e.target.value)}
                                                                    placeholder="작품 구성, 설치 현장 특이사항 (예: 3단 분해형 철재 조형물, 천장 와이어 인입, 전시장 출입문 높이 2.4m 확인 필요 등)"
                                                                    className="w-full bg-white border border-amber-200 rounded-xl p-2.5 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:ring-1 focus:ring-[#C5A059] focus:outline-none"
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>

                            {/* 하단 작품 추가 버튼 */}
                            <button
                                type="button"
                                onClick={handleAddArtwork}
                                className="w-full py-4 border-2 border-dashed border-[#C5A059]/40 hover:border-[#C5A059] bg-[#F4F1EE]/50 hover:bg-[#F4F1EE] text-[#121212] font-bold text-sm rounded-2xl transition-all duration-300 flex items-center justify-center gap-2.5 group shadow-sm hover:shadow-md"
                            >
                                <div className="w-6 h-6 rounded-full bg-[#121212] text-white flex items-center justify-center group-hover:bg-[#C5A059] group-hover:text-[#121212] transition-colors">
                                    <Plus className="w-4 h-4" />
                                </div>
                                <span>새 작품 추가하기</span>
                            </button>

                            <div className="flex items-center justify-between text-xs text-gray-600 bg-gray-50 px-4 py-3 rounded-xl border border-gray-100">
                                <span>총 등록 수량: <strong className="text-black font-bold">{quote.totalPieces}점</strong></span>
                                <span>총 작품 평가액: <strong className="text-black font-bold">₩ {(quote.totalValueKRW / 10000).toLocaleString()}만 원 ({formatKoreanCurrency(quote.totalValueKRW / 10000)})</strong></span>
                            </div>
                        </div>

                        {/* 3. 반출입 환경 선택 */}
                        <div className="bg-white p-8 rounded-3xl border border-[#121212]/10 shadow-sm space-y-6">
                            <h3 className="text-lg font-bold text-[#121212] flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-[#121212] text-white text-xs font-bold flex items-center justify-center">3</span>
                                반출입 환경 (출발지 / 도착지)
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {/* 출발지 */}
                                <div className="space-y-3 p-5 rounded-2xl bg-[#F4F1EE]/40 border border-gray-200">
                                    <h4 className="text-sm font-bold text-[#121212] flex items-center gap-2">
                                        <Building className="w-4 h-4 text-[#C5A059]" />
                                        출발지 (작품 보관/출고처)
                                    </h4>
                                    <div>
                                        <label className="text-xs text-gray-600 font-bold block mb-1">권역</label>
                                        <select
                                            value={originRegion}
                                            onChange={(e) => setOriginRegion(e.target.value as Region)}
                                            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium focus:ring-1 focus:ring-[#C5A059] focus:outline-none"
                                        >
                                            {Object.entries(REGION_LABELS).map(([key, label]) => (
                                                <option key={key} value={key}>{label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-600 font-bold block mb-1">엘리베이터 상태</label>
                                        <select
                                            value={originElevator}
                                            onChange={(e) => setOriginElevator(e.target.value as ElevatorType)}
                                            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium focus:ring-1 focus:ring-[#C5A059] focus:outline-none"
                                        >
                                            <option value="cargo">화물 전용 EV (1층 지상 포함)</option>
                                            <option value="passenger">승객용 EV (작품 반입 가능)</option>
                                            <option value="stairs">계단 이동 (2층 이상 손운반)</option>
                                        </select>
                                    </div>
                                </div>

                                {/* 도착지 */}
                                <div className="space-y-3 p-5 rounded-2xl bg-[#F4F1EE]/40 border border-gray-200">
                                    <h4 className="text-sm font-bold text-[#121212] flex items-center gap-2">
                                        <Building className="w-4 h-4 text-[#C5A059]" />
                                        도착지 (전시장/반입처)
                                    </h4>
                                    <div>
                                        <label className="text-xs text-gray-600 font-bold block mb-1">권역</label>
                                        <select
                                            value={destRegion}
                                            onChange={(e) => setDestRegion(e.target.value as Region)}
                                            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium focus:ring-1 focus:ring-[#C5A059] focus:outline-none"
                                        >
                                            {Object.entries(REGION_LABELS).map(([key, label]) => (
                                                <option key={key} value={key}>{label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-600 font-bold block mb-1">엘리베이터 상태</label>
                                        <select
                                            value={destElevator}
                                            onChange={(e) => setDestElevator(e.target.value as ElevatorType)}
                                            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium focus:ring-1 focus:ring-[#C5A059] focus:outline-none"
                                        >
                                            <option value="cargo">화물 전용 EV (1층 지상 포함)</option>
                                            <option value="passenger">승객용 EV (작품 반입 가능)</option>
                                            <option value="stairs">계단 이동 (2층 이상 손운반)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* 특수 장비 옵션 */}
                            <label className="flex items-center gap-3 p-4 rounded-2xl border border-gray-200 bg-gray-50/70 hover:bg-gray-100/70 cursor-pointer transition-colors">
                                <input
                                    type="checkbox"
                                    checked={ladderTruck}
                                    onChange={(e) => setLadderTruck(e.target.checked)}
                                    className="w-4 h-4 text-[#C5A059] rounded border-gray-300 focus:ring-[#C5A059]"
                                />
                                <div className="text-xs sm:text-sm">
                                    <span className="font-bold text-[#121212]">사다리차/스카이 장비 지원 필요 (+150,000원)</span>
                                    <p className="text-xs text-gray-500">엘리베이터가 협소하여 3층 이상 창문 반입이 필요한 경우 선택해 주세요.</p>
                                </div>
                            </label>
                        </div>

                        {/* 4. 부가 옵션 선택 (특수 포장, 벽면 설치, 적하보험) */}
                        <div className="bg-white p-8 rounded-3xl border border-[#121212]/10 shadow-sm space-y-6">
                            <h3 className="text-lg font-bold text-[#121212] flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-[#121212] text-white text-xs font-bold flex items-center justify-center">4</span>
                                전문 보존 및 설치 부가 옵션
                            </h3>

                            {/* 포장 옵션 */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-700 block">박물관급 특수 포장</label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setPackaging('standard')}
                                        className={`p-3.5 rounded-2xl border text-left text-xs sm:text-sm transition-all ${
                                            packaging === 'standard' ? 'border-[#121212] bg-[#121212] text-white' : 'border-gray-200 bg-white text-gray-800'
                                        }`}
                                    >
                                        <p className="font-bold">기본 완충 포장</p>
                                        <p className={`text-xs mt-1 ${packaging === 'standard' ? 'text-gray-300' : 'text-gray-500'}`}>에어캡 및 코너보호 (기본 제공)</p>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPackaging('museum')}
                                        className={`p-3.5 rounded-2xl border text-left text-xs sm:text-sm transition-all ${
                                            packaging === 'museum' ? 'border-[#C5A059] bg-[#121212] text-white ring-1 ring-[#C5A059]' : 'border-gray-200 bg-white text-gray-800'
                                        }`}
                                    >
                                        <p className="font-bold">중성지 3중 특수 포장</p>
                                        <p className={`text-xs mt-1 ${packaging === 'museum' ? 'text-[#C5A059]' : 'text-gray-500'}`}>타이벡 중성지 + 대전방지 (점당 +3.5만)</p>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPackaging('crate')}
                                        className={`p-3.5 rounded-2xl border text-left text-xs sm:text-sm transition-all ${
                                            packaging === 'crate' ? 'border-[#121212] bg-[#121212] text-white' : 'border-gray-200 bg-white text-gray-800'
                                        }`}
                                    >
                                        <p className="font-bold">맞춤 목재 크레이트</p>
                                        <p className={`text-xs mt-1 ${packaging === 'crate' ? 'text-gray-300' : 'text-gray-500'}`}>목재 Crate 수제작 (점당 +18만)</p>
                                    </button>
                                </div>
                            </div>

                            {/* 설치 옵션 */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-700 block">전시장 벽면 설치 (DP)</label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setInstallation('none')}
                                        className={`p-3.5 rounded-2xl border text-left text-xs sm:text-sm transition-all ${
                                            installation === 'none' ? 'border-[#121212] bg-[#121212] text-white' : 'border-gray-200 bg-white text-gray-800'
                                        }`}
                                    >
                                        <p className="font-bold">단순 하차 및 인계</p>
                                        <p className={`text-xs mt-1 ${installation === 'none' ? 'text-gray-300' : 'text-gray-500'}`}>전시장 내부 안전 안착</p>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setInstallation('basic')}
                                        className={`p-3.5 rounded-2xl border text-left text-xs sm:text-sm transition-all ${
                                            installation === 'basic' ? 'border-[#121212] bg-[#121212] text-white' : 'border-gray-200 bg-white text-gray-800'
                                        }`}
                                    >
                                        <p className="font-bold">기본 와이어 시공</p>
                                        <p className={`text-xs mt-1 ${installation === 'basic' ? 'text-gray-300' : 'text-gray-500'}`}>레일/와이어 수평 설치 (점당 +2.5만)</p>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setInstallation('laser')}
                                        className={`p-3.5 rounded-2xl border text-left text-xs sm:text-sm transition-all ${
                                            installation === 'laser' ? 'border-[#C5A059] bg-[#121212] text-white ring-1 ring-[#C5A059]' : 'border-gray-200 bg-white text-gray-800'
                                        }`}
                                    >
                                        <p className="font-bold">레이저 정밀 시공</p>
                                        <p className={`text-xs mt-1 ${installation === 'laser' ? 'text-[#C5A059]' : 'text-gray-500'}`}>레이저 레벨 큐레이션 (점당 +4.5만)</p>
                                    </button>
                                </div>
                            </div>

                            {/* 적하보험 */}
                            <label className="flex items-center justify-between p-4 rounded-2xl border border-gray-200 bg-gray-50/70 hover:bg-gray-100/70 cursor-pointer transition-colors">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={insuranceEnabled}
                                        onChange={(e) => setInsuranceEnabled(e.target.checked)}
                                        className="w-4 h-4 text-[#C5A059] rounded border-gray-300 focus:ring-[#C5A059]"
                                    />
                                    <div className="text-xs sm:text-sm">
                                        <span className="font-bold text-[#121212]">미술품 특약 동산물류 종합보험 가입 (평가액의 0.3%)</span>
                                        <p className="text-xs text-gray-500">상차부터 전시장 설치 완료 시까지 전 구간 최대 10억 보장 특약</p>
                                    </div>
                                </div>
                                <span className="text-xs font-bold text-[#C5A059] whitespace-nowrap pl-2">
                                    +₩ {quote.insuranceCost.toLocaleString()}
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Right: Sticky Summary Quote Card (5 cols) */}
                    <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-6">
                        <div className="bg-[#121212] text-white rounded-3xl p-8 border border-white/10 shadow-2xl space-y-6">
                            <div className="flex items-center justify-between border-b border-white/10 pb-6">
                                <div>
                                    <span className="text-xs font-bold text-[#C5A059] uppercase tracking-[0.2em] block mb-1">
                                        Estimated Quotation
                                    </span>
                                    <h3 className="text-2xl font-serif font-bold text-white">
                                        예상 공식 견적서
                                    </h3>
                                </div>
                                <div className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-gray-300">
                                    실시간 산출
                                </div>
                            </div>

                            {/* 대형/설치 미술 포함 안내 배지 */}
                            {quote.hasInstallation && (
                                <div className="flex items-start gap-2.5 p-3.5 bg-amber-500/15 border border-amber-500/30 rounded-2xl text-amber-300 text-xs font-bold">
                                    <AlertCircle className="w-4 h-4 shrink-0 text-[#C5A059] mt-0.5" />
                                    <div>
                                        <span className="text-white font-bold block">현장 실측 상담 필요 품목 포함</span>
                                        <p className="text-xs text-gray-300 font-normal mt-0.5">
                                            대형·설치 작품이 포함되어 전문 테크니션 팀의 공간 실측 후 최종 확정 견적이 안내됩니다.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Recommended Fleet & Staffing */}
                            <div className="grid grid-cols-2 gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                                <div>
                                    <span className="text-xs text-gray-400 block mb-1 flex items-center gap-1.5">
                                        <Truck className="w-3.5 h-3.5 text-[#C5A059]" />
                                        배정 권장 차량
                                    </span>
                                    <p className="text-sm font-bold text-white">
                                        {quote.recommendedTruck}
                                    </p>
                                    {quote.maxCustomDimension >= 160 && (
                                        <span className="text-[11px] text-[#C5A059] font-medium block mt-0.5">
                                            (최장변 {quote.maxCustomDimension}cm 감안 배정)
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <span className="text-xs text-gray-400 block mb-1 flex items-center gap-1.5">
                                        <Users className="w-3.5 h-3.5 text-[#C5A059]" />
                                        투입 핸들러 인원
                                    </span>
                                    <p className="text-sm font-bold text-white">
                                        전문 핸들러 {quote.handlersCount}인 1조
                                    </p>
                                    <span className="text-[11px] text-gray-400 font-medium block mt-0.5">
                                        {quote.handlersCount >= 3 ? '(안전 양중 집중팀)' : '(표준 투입)'}
                                    </span>
                                </div>
                            </div>

                            {/* Itemized Cost Breakdown */}
                            <div className="space-y-3 text-xs sm:text-sm">
                                <div className="flex justify-between items-center text-gray-300">
                                    <span>무진동 특수탑차 운임 ({tripType === 'round_trip' ? '왕복 15% DC' : tripType === 'consolidation' ? '혼적 운임' : '편도'})</span>
                                    <span className="font-bold text-white">₩ {quote.baseVehicleCost.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-gray-300">
                                    <span>전문 아트 핸들러 인건비 ({quote.handlersCount}인{quote.hasStairs ? ' / 계단할증 포함' : ''})</span>
                                    <span className="font-bold text-white">₩ {quote.laborCost.toLocaleString()}</span>
                                </div>
                                {quote.packagingCost > 0 && (
                                    <div className="flex justify-between items-center text-gray-300">
                                        <span>특수 포장비 ({packaging === 'museum' ? '중성지 3중' : '목재 크레이트'})</span>
                                        <span className="font-bold text-white">₩ {quote.packagingCost.toLocaleString()}</span>
                                    </div>
                                )}
                                {quote.installCost > 0 && (
                                    <div className="flex justify-between items-center text-gray-300">
                                        <span>벽면 설치비 ({installation === 'laser' ? '레이저 수평' : '기본 와이어'})</span>
                                        <span className="font-bold text-white">₩ {quote.installCost.toLocaleString()}</span>
                                    </div>
                                )}
                                {quote.ladderCost > 0 && (
                                    <div className="flex justify-between items-center text-gray-300">
                                        <span>특수 장비비 (사다리차)</span>
                                        <span className="font-bold text-white">₩ {quote.ladderCost.toLocaleString()}</span>
                                    </div>
                                )}
                                {quote.insuranceCost > 0 && (
                                    <div className="flex justify-between items-center text-gray-300">
                                        <span>미술품 적하보험료 (평가액 대비 0.3%)</span>
                                        <span className="font-bold text-white">₩ {quote.insuranceCost.toLocaleString()}</span>
                                    </div>
                                )}

                                <div className="pt-4 border-t border-white/10 space-y-2">
                                    <div className="flex justify-between items-center text-xs text-gray-400">
                                        <span>공급가액 (VAT 별도)</span>
                                        <span className="font-mono">₩ {quote.subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs text-gray-400">
                                        <span>부가가치세 (10%)</span>
                                        <span className="font-mono">₩ {quote.vat.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-end pt-2">
                                        <div>
                                            <span className="text-xs font-bold text-[#C5A059] uppercase tracking-wider block">총 예상 견적 금액</span>
                                            <span className="text-xs text-gray-400 font-medium">VAT 포함</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-2xl sm:text-3xl font-black text-[#C5A059] font-mono tracking-tight">
                                                ₩ {quote.totalWithVat.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setQuoteModalInitialTab('form');
                                        setIsQuoteModalOpen(true);
                                    }}
                                    className="w-full py-4 bg-[#C5A059] hover:bg-[#b08e4c] text-[#121212] font-bold text-sm rounded-full transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#C5A059]/20"
                                >
                                    <FileSpreadsheet className="w-4 h-4" />
                                    공식 비교견적서 즉시 발급 / 상담 신청
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setQuoteModalInitialTab('print');
                                        setIsQuoteModalOpen(true);
                                    }}
                                    className="w-full py-3.5 bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm rounded-full transition-all flex items-center justify-center gap-2"
                                >
                                    <Printer className="w-4 h-4" />
                                    공식 견적서 서식 인쇄 / PDF 저장
                                </button>
                            </div>

                            <p className="text-xs text-gray-400 leading-relaxed text-center">
                                * 국공립 미술관, 지자체, 갤러리 감사용 비교견적서 및 전자세금계산서 일괄 지원됩니다. 현장 사정에 따라 미세 변동될 수 있습니다.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 견적서 발급 및 상담 신청 모달 */}
            <LogisticsQuoteModal
                isOpen={isQuoteModalOpen}
                initialTab={quoteModalInitialTab}
                onClose={() => setIsQuoteModalOpen(false)}
                quoteData={{
                    tripType,
                    originRegion: REGION_LABELS[originRegion],
                    destRegion: REGION_LABELS[destRegion],
                    originElevator,
                    destElevator,
                    artworks,
                    packaging,
                    installation,
                    insuranceEnabled,
                    ...quote,
                }}
            />
        </section>
    );
}
