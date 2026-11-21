'use client';

import React, { useState, useMemo } from 'react';
import { 
    Plus, Trash2, Truck, Users, ShieldAlert, Check, HelpCircle, 
    Printer, Send, FileSpreadsheet, Sparkles, Building, ArrowRightLeft,
    CheckCircle2, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LogisticsQuoteModal from './LogisticsQuoteModal';

export interface ArtworkItem {
    id: string;
    title: string;
    type: 'painting' | 'glass_frame' | 'sculpture' | 'installation';
    sizeTier: '10' | '30' | '50' | '100' | '120';
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

const ART_TYPE_LABELS: Record<string, string> = {
    painting: '평면 회화 (캔버스/판넬)',
    glass_frame: '유리 / 아크릴 액자',
    sculpture: '도자 · 입체 조각',
    installation: '대형 / 설치 미술',
};

const SIZE_LABELS: Record<string, string> = {
    '10': '10호 이하 (~53cm)',
    '30': '30호 (~90cm)',
    '50': '50호 (~116cm)',
    '100': '100호 (~162cm)',
    '120': '120호 이상/초대형 (200cm+)',
};

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

    // 견적 계산 로직
    const quote = useMemo(() => {
        const totalPieces = artworks.reduce((acc, a) => acc + (Number(a.quantity) || 1), 0);
        const totalValueKRW = artworks.reduce((acc, a) => acc + ((Number(a.declaredValue) || 0) * 10000), 0);

        // 총 호수 점수 (차량 및 인력 산출 기준)
        const sizeWeights: Record<string, number> = { '10': 10, '30': 30, '50': 50, '100': 100, '120': 150 };
        const totalSizePoints = artworks.reduce((acc, a) => acc + (sizeWeights[a.sizeTier] * (Number(a.quantity) || 1)), 0);

        // 대형/특수 작품 개수
        const largePieceCount = artworks.reduce((acc, a) => {
            return (a.sizeTier === '100' || a.sizeTier === '120' || a.type === 'sculpture' || a.type === 'installation')
                ? acc + (Number(a.quantity) || 1)
                : acc;
        }, 0);

        // 1. 차량 추천: 1톤 vs 2.5톤
        const is2_5Ton = totalSizePoints > 280 || totalPieces > 12 || largePieceCount >= 4;
        const recommendedTruck = is2_5Ton ? '2.5톤 하이탑 무진동 특수탑차' : '1톤 하이탑 무진동 특수탑차';

        // 2. 인원 산출: 기본 2인, 100호 이상 다수거나 계단 작업 시 3~4인
        let handlersCount = 2;
        const hasStairs = originElevator === 'stairs' || destElevator === 'stairs';
        if (is2_5Ton || largePieceCount >= 3 || hasStairs) {
            handlersCount = 3;
        }
        if (is2_5Ton && hasStairs && largePieceCount >= 4) {
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
                        작품 규격과 이동 환경을 선택하시면 즉시 투입 차량, 전문 인력 및 항목별 공식 산출 견적을 확인할 수 있습니다.
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

                            <div className="space-y-4">
                                <AnimatePresence initial={false}>
                                    {artworks.map((art, index) => (
                                        <motion.div
                                            key={art.id}
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.25 }}
                                            className="p-5 rounded-2xl bg-[#F4F1EE]/50 border border-gray-200 space-y-4"
                                        >
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

                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                {/* 유형 */}
                                                <div>
                                                    <label className="text-xs font-bold text-gray-600 mb-1.5 block">작품 유형</label>
                                                    <select
                                                        value={art.type}
                                                        onChange={(e) => handleUpdateArtwork(art.id, 'type', e.target.value)}
                                                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium focus:ring-1 focus:ring-[#C5A059] focus:outline-none"
                                                    >
                                                        <option value="painting">평면 회화</option>
                                                        <option value="glass_frame">유리 액자</option>
                                                        <option value="sculpture">도자 · 조각</option>
                                                        <option value="installation">대형 / 설치</option>
                                                    </select>
                                                </div>

                                                {/* 규격/호수 */}
                                                <div>
                                                    <label className="text-xs font-bold text-gray-600 mb-1.5 block">규격(최장변)</label>
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

                                                {/* 수량 */}
                                                <div>
                                                    <label className="text-xs font-bold text-gray-600 mb-1.5 block">수량 (점)</label>
                                                    <input
                                                        type="number"
                                                        min={1}
                                                        max={100}
                                                        value={art.quantity}
                                                        onChange={(e) => handleUpdateArtwork(art.id, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
                                                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium focus:ring-1 focus:ring-[#C5A059] focus:outline-none"
                                                    />
                                                </div>

                                                {/* 평가액 */}
                                                <div>
                                                    <label className="text-xs font-bold text-gray-600 mb-1.5 block">평가액 (만원)</label>
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        step={50}
                                                        value={art.declaredValue}
                                                        onChange={(e) => handleUpdateArtwork(art.id, 'declaredValue', Math.max(0, parseInt(e.target.value) || 0))}
                                                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium focus:ring-1 focus:ring-[#C5A059] focus:outline-none"
                                                    />
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>

                            <div className="flex items-center justify-between text-xs text-gray-600 bg-gray-50 px-4 py-3 rounded-xl border border-gray-100">
                                <span>총 등록 수량: <strong className="text-black font-bold">{quote.totalPieces}점</strong></span>
                                <span>총 작품 평가액: <strong className="text-black font-bold">₩ {(quote.totalValueKRW / 10000).toLocaleString()}만 원</strong></span>
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
                        <div className="bg-[#121212] text-white rounded-3xl p-8 border border-white/10 shadow-2xl space-y-8">
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
                                </div>
                                <div>
                                    <span className="text-xs text-gray-400 block mb-1 flex items-center gap-1.5">
                                        <Users className="w-3.5 h-3.5 text-[#C5A059]" />
                                        투입 핸들러 인원
                                    </span>
                                    <p className="text-sm font-bold text-white">
                                        전문 핸들러 {quote.handlersCount}인 1조
                                    </p>
                                </div>
                            </div>

                            {/* Itemized Cost Breakdown */}
                            <div className="space-y-3.5 text-xs sm:text-sm">
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
                                    onClick={() => setIsQuoteModalOpen(true)}
                                    className="w-full py-4 bg-[#C5A059] hover:bg-[#b08e4c] text-[#121212] font-bold text-sm rounded-full transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#C5A059]/20"
                                >
                                    <FileSpreadsheet className="w-4 h-4" />
                                    공식 비교견적서 즉시 발급 / 상담 신청
                                </button>
                                <button
                                    type="button"
                                    onClick={() => window.print()}
                                    className="w-full py-3.5 bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm rounded-full transition-all flex items-center justify-center gap-2"
                                >
                                    <Printer className="w-4 h-4" />
                                    현재 견적 결과 인쇄 / PDF 저장
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
