'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, CheckCircle2, Printer, FileText, Building2, User, Phone, Mail, Calendar, MessageSquare } from 'lucide-react';
import { createInquiry } from '@/app/actions/inquiry';
import { getSettings } from '@/app/actions/settings';

interface LogisticsQuoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialTab?: 'form' | 'print';
    quoteData: {
        tripType: string;
        originRegion: string;
        destRegion: string;
        originElevator: string;
        destElevator: string;
        totalPieces: number;
        totalValueKRW: number;
        recommendedTruck: string;
        handlersCount: number;
        baseVehicleCost: number;
        laborCost: number;
        packagingCost: number;
        installCost: number;
        ladderCost: number;
        insuranceCost: number;
        subtotal: number;
        vat: number;
        totalWithVat: number;
        artworks: any[];
        packaging: string;
        installation: string;
        insuranceEnabled: boolean;
    };
}

export default function LogisticsQuoteModal({ isOpen, onClose, initialTab = 'form', quoteData }: LogisticsQuoteModalProps) {
    const [activeTab, setActiveTab] = useState<'form' | 'print'>(initialTab);
    const [mounted, setMounted] = useState(false);
    const [formData, setFormData] = useState({
        organization: '',
        name: '',
        phone: '',
        email: '',
        scheduleDate: '',
        memo: '',
    });
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [settings, setSettings] = useState<any>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (initialTab) {
            setActiveTab(initialTab);
        }
    }, [initialTab, isOpen]);

    useEffect(() => {
        let isMounted = true;
        getSettings().then(res => {
            if (res?.success && res.settings && isMounted) {
                setSettings(res.settings);
            }
        }).catch(err => console.error("Error loading settings:", err));
        return () => { isMounted = false; };
    }, []);

    if (!isOpen || !mounted) return null;

    const todayStr = new Date().toISOString().split('T')[0];
    const quoteNo = `AF-LOG-${todayStr.replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('submitting');

        const artworkListText = quoteData.artworks
            .map((a, i) => {
                let sizeInfo = '';
                if (a.type === 'painting') {
                    const dim = (a.width && a.height) ? ` (실측: ${a.width}×${a.height}${a.depth ? `×${a.depth}` : ''}cm)` : '';
                    sizeInfo = `${a.sizeTier}호 규격${dim}`;
                } else if (a.type === 'glass_frame') {
                    sizeInfo = `액자외곽실측: ${a.width || '-'}×${a.height || '-'}${a.depth ? `×${a.depth}` : ''}cm`;
                } else if (a.type === 'sculpture') {
                    sizeInfo = `입체실측: ${a.width || '-'}×${a.height || '-'}×${a.depth || '-'}cm${a.weight ? ` (${a.weight}kg)` : ''}`;
                } else if (a.type === 'installation') {
                    sizeInfo = `대형/설치 미술 [현장실측 필요] ${a.details ? `(특이사항: ${a.details})` : ''}`;
                }
                return `  ${i + 1}. [${a.type}] ${a.title || '작품'} - ${sizeInfo} x ${a.quantity}점 / 평가액: ${(a.declaredValue || 0)}만원`;
            })
            .join('\n');

        const hasInstallation = quoteData.artworks.some((a: any) => a.type === 'installation');
        const installationNote = hasInstallation ? '\n※ [안내] 대형·설치 미술품이 포함되어 담당 테크니션 팀의 현장 실측 후 최종 확정 견적이 안내됩니다.' : '';

        const summaryMessage = `[아트물류 견적 요청]
- 기관/갤러리명: ${formData.organization || '미기재'}
- 담당자: ${formData.name} (연락처: ${formData.phone}, 이메일: ${formData.email})
- 희망 운송일: ${formData.scheduleDate || '협의 필요'}
- 운송 구간: ${quoteData.originRegion} (${quoteData.originElevator}) ➔ ${quoteData.destRegion} (${quoteData.destElevator})
- 운송 유형: ${quoteData.tripType === 'round_trip' ? '왕복(반입+철수)' : quoteData.tripType === 'consolidation' ? '지방 정기 혼적' : '편도'}
- 배정 차량: ${quoteData.recommendedTruck} (핸들러 ${quoteData.handlersCount}인 1조)
- 작품 내역 (총 ${quoteData.totalPieces}점 / 평가액 ${(quoteData.totalValueKRW / 10000).toLocaleString()}만원):
${artworkListText}
- 부가옵션: 포장(${quoteData.packaging}), 설치(${quoteData.installation}), 보험가입(${quoteData.insuranceEnabled ? 'Y' : 'N'})
- 산출 견적금액:
  * 공급가액: ₩ ${quoteData.subtotal.toLocaleString()}
  * 부가세(10%): ₩ ${quoteData.vat.toLocaleString()}
  * 총 합계(VAT포함): ₩ ${quoteData.totalWithVat.toLocaleString()}
- 추가 요청사항: ${formData.memo || '없음'}${installationNote}`;

        try {
            const res = await createInquiry({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                organization: formData.organization,
                type: 'general',
                message: summaryMessage,
            });

            if (res.success) {
                setStatus('success');
            } else {
                setStatus('error');
            }
        } catch (err) {
            console.error(err);
            setStatus('error');
        }
    };

    return createPortal(
        <AnimatePresence>
            <div id="quote-modal-root" className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm print:hidden"
                />

                {/* Modal Container */}
                <motion.div
                    id="quote-modal-box"
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden my-8 z-10 border border-gray-100 flex flex-col max-h-[90vh]"
                >
                    {/* Header */}
                    <div className="bg-[#121212] text-white p-6 sm:p-8 flex items-center justify-between border-b border-white/10 shrink-0 print:hidden">
                        <div>
                            <span className="text-xs font-bold text-[#C5A059] uppercase tracking-[0.2em] block mb-1">
                                Official Quotation Service
                            </span>
                            <h3 className="text-xl sm:text-2xl font-serif font-bold">
                                미술품 전문 물류 견적서 및 상담 접수
                            </h3>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Tab Selection */}
                    <div className="flex border-b border-gray-200 bg-gray-50 shrink-0 print:hidden">
                        <button
                            type="button"
                            onClick={() => setActiveTab('form')}
                            className={`flex-1 py-3.5 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
                                activeTab === 'form'
                                    ? 'bg-white text-[#121212] border-b-2 border-[#C5A059]'
                                    : 'text-gray-500 hover:text-gray-800'
                            }`}
                        >
                            <Send className="w-4 h-4 text-[#C5A059]" />
                            정식 견적서 이메일·알림톡 요청
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('print')}
                            className={`flex-1 py-3.5 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
                                activeTab === 'print'
                                    ? 'bg-white text-[#121212] border-b-2 border-[#C5A059]'
                                    : 'text-gray-500 hover:text-gray-800'
                            }`}
                        >
                            <Printer className="w-4 h-4 text-[#C5A059]" />
                            공식 비교견적서 서식 인쇄 / PDF 저장
                        </button>
                    </div>

                    {/* Body Content (Scrollable) */}
                    <div className="p-6 sm:p-8 overflow-y-auto flex-grow print:p-0 print:overflow-visible">
                        {activeTab === 'form' ? (
                            status === 'success' ? (
                                <div className="py-12 text-center space-y-4">
                                    <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto">
                                        <CheckCircle2 className="w-8 h-8" />
                                    </div>
                                    <h4 className="text-2xl font-bold text-[#121212]">
                                        견적서 발송 및 상담 신청이 완료되었습니다
                                    </h4>
                                    <p className="text-sm text-gray-700 max-w-md mx-auto leading-relaxed">
                                        기재해주신 이메일과 연락처로 <strong>공식 규격 비교견적서(PDF)</strong>와 안내 알림톡을 발송해 드리며, 물류 전담 수석 핸들러가 일정 조율을 위해 신속히 연락드리겠습니다.
                                    </p>
                                    <div className="pt-6">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="px-8 py-3 bg-[#121212] text-white rounded-full text-xs sm:text-sm font-bold hover:bg-[#C5A059] hover:text-[#121212] transition-colors"
                                        >
                                            확인 완료
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between">
                                        <div>
                                            <span className="text-xs text-gray-500 font-medium">산출 예상 금액 (VAT 포함)</span>
                                            <p className="text-lg font-bold text-[#121212]">₩ {quoteData.totalWithVat.toLocaleString()} 원</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs text-gray-500 font-medium">배정 차량 / 인원</span>
                                            <p className="text-xs sm:text-sm font-bold text-gray-800">{quoteData.recommendedTruck} · {quoteData.handlersCount}인 1조</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-gray-700 mb-1.5 block">기관 / 갤러리 / 기업명</label>
                                            <div className="relative">
                                                <Building2 className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.organization}
                                                    onChange={e => setFormData({ ...formData, organization: e.target.value })}
                                                    placeholder="예: 서울시립미술관 / 갤러리"
                                                    className="w-full pl-10 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm focus:ring-1 focus:ring-[#C5A059] focus:outline-none"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-xs font-bold text-gray-700 mb-1.5 block">담당자 성함</label>
                                            <div className="relative">
                                                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.name}
                                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                    placeholder="홍길동 큐레이터"
                                                    className="w-full pl-10 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm focus:ring-1 focus:ring-[#C5A059] focus:outline-none"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-xs font-bold text-gray-700 mb-1.5 block">연락처</label>
                                            <div className="relative">
                                                <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                                <input
                                                    type="tel"
                                                    required
                                                    value={formData.phone}
                                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                                    placeholder="010-0000-0000"
                                                    className="w-full pl-10 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm focus:ring-1 focus:ring-[#C5A059] focus:outline-none"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-xs font-bold text-gray-700 mb-1.5 block">견적서 수신 이메일</label>
                                            <div className="relative">
                                                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                                <input
                                                    type="email"
                                                    required
                                                    value={formData.email}
                                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                    placeholder="curator@gallery.com"
                                                    className="w-full pl-10 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm focus:ring-1 focus:ring-[#C5A059] focus:outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-gray-700 mb-1.5 block">희망 운송/반입 일정</label>
                                        <div className="relative">
                                            <Calendar className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                            <input
                                                type="date"
                                                value={formData.scheduleDate}
                                                onChange={e => setFormData({ ...formData, scheduleDate: e.target.value })}
                                                className="w-full pl-10 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm focus:ring-1 focus:ring-[#C5A059] focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-gray-700 mb-1.5 block">추가 요청사항 및 전시장 특이사항 (선택)</label>
                                        <textarea
                                            rows={3}
                                            value={formData.memo}
                                            onChange={e => setFormData({ ...formData, memo: e.target.value })}
                                            placeholder="엘리베이터 치수, 야간/주말 작업 희망, 국공립 비교견적 양식 필요 여부 등"
                                            className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm focus:ring-1 focus:ring-[#C5A059] focus:outline-none"
                                        />
                                    </div>

                                    {status === 'error' && (
                                        <p className="text-xs text-red-500 font-bold text-center">
                                            접수 중 일시적인 오류가 발생했습니다. 다시 시도해 주시거나 유선으로 문의해 주세요.
                                        </p>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={status === 'submitting'}
                                        className="w-full py-4 bg-[#121212] hover:bg-[#C5A059] hover:text-[#121212] text-white font-bold text-sm rounded-full transition-all duration-300 flex items-center justify-center gap-2 shadow-lg"
                                    >
                                        {status === 'submitting' ? (
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <Send className="w-4 h-4" />
                                                정식 비교견적서 이메일 발송 및 상담 신청
                                            </>
                                        )}
                                    </button>
                                </form>
                            )
                        ) : (
                            /* Print View */
                            <div className="space-y-6">
                                <div id="printable-quote" className="p-8 border border-gray-300 rounded-2xl bg-white text-black space-y-6 font-sans">
                                    <div className="flex justify-between items-start border-b-2 border-black pb-4">
                                        <div>
                                            <h2 className="text-2xl font-serif font-black tracking-tight">미 술 품  물 류  견 적 서</h2>
                                            <p className="text-xs text-gray-600 mt-1">Official Fine Art Logistics & Installation Quotation</p>
                                        </div>
                                        <div className="text-right text-xs space-y-0.5">
                                            <p><strong>견적번호:</strong> {quoteNo}</p>
                                            <p><strong>견적일자:</strong> {todayStr}</p>
                                            <p><strong>유효기간:</strong> 발행일로부터 30일간</p>
                                        </div>
                                    </div>

                                    {/* Supplier & Client Info */}
                                    <div className="grid grid-cols-2 gap-4 text-xs border border-gray-200 p-4 rounded-xl bg-gray-50/50">
                                        <div className="space-y-1">
                                            <p className="font-bold text-gray-500 uppercase tracking-wider mb-1">공급자 (운송·설치사)</p>
                                            <p><strong>상호:</strong> {settings?.companyName || '(주)아츠팩토리'}</p>
                                            <p><strong>사업자등록번호:</strong> {settings?.businessNumber || '227-13-96095'}</p>
                                            <p><strong>대표자:</strong> {settings?.representative || '이효주'}</p>
                                            <p><strong>소재지:</strong> {settings?.address || '광주광역시 동구 문화전당로23번길 7, 2층 202호(남동)'}</p>
                                            <p><strong>대표연락처:</strong> {settings?.phone || '062.224.0801'}{settings?.email ? ` (${settings.email})` : ''}</p>
                                        </div>
                                        <div className="space-y-1 border-l border-gray-200 pl-4">
                                            <p className="font-bold text-gray-500 uppercase tracking-wider mb-1">공급받는 자 (신청 기관)</p>
                                            <p><strong>기관/기업명:</strong> {formData.organization || '귀하 / 미술관 / 갤러리'}</p>
                                            <p><strong>담당자:</strong> {formData.name || '담당 큐레이터'}</p>
                                            <p><strong>운송 구간:</strong> {quoteData.originRegion} ➔ {quoteData.destRegion}</p>
                                            <p><strong>차량/인력:</strong> {quoteData.recommendedTruck} ({quoteData.handlersCount}인)</p>
                                        </div>
                                    </div>

                                    {/* 1. Artwork Manifest Table */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-xs">
                                            <h3 className="font-bold text-gray-800 text-sm">1. 운송 대상 작품 명세</h3>
                                            <span className="text-gray-600">
                                                총 <strong>{quoteData.totalPieces}점</strong> &nbsp;|&nbsp; 평가액 합계: <strong>₩ {quoteData.totalValueKRW.toLocaleString()}</strong> ({(quoteData.totalValueKRW / 10000).toLocaleString()}만 원)
                                            </span>
                                        </div>
                                        <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                            <table className="w-full text-xs border-collapse">
                                                <thead>
                                                    <tr className="bg-gray-100 text-gray-700 font-semibold border-b border-gray-200">
                                                        <th className="border-r border-gray-200 p-2 text-center w-10">No.</th>
                                                        <th className="border-r border-gray-200 p-2 text-left">작품명</th>
                                                        <th className="border-r border-gray-200 p-2 text-center w-28">작품 구분</th>
                                                        <th className="border-r border-gray-200 p-2 text-left">규격 및 실측 치수</th>
                                                        <th className="border-r border-gray-200 p-2 text-center w-14">수량</th>
                                                        <th className="border-r border-gray-200 p-2 text-right w-28">작품 평가액</th>
                                                        <th className="p-2 text-center w-28">비고</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200">
                                                    {quoteData.artworks.map((a: any, idx: number) => {
                                                        let typeLabel = '평면 회화';
                                                        let dimensionText = '';
                                                        let notes = '-';

                                                        if (a.type === 'painting') {
                                                            typeLabel = '평면 회화';
                                                            const dimParts = [];
                                                            if (a.width && a.height) dimParts.push(`${a.width}×${a.height}`);
                                                            if (a.depth) dimParts.push(`${a.depth}`);
                                                            const dimStr = dimParts.length > 0 ? ` (${dimParts.join('×')}cm)` : '';
                                                            dimensionText = `${a.sizeTier}호${dimStr}`;
                                                        } else if (a.type === 'glass_frame') {
                                                            typeLabel = '유리/액자';
                                                            if (a.width && a.height) {
                                                                dimensionText = `외곽 ${a.width}×${a.height}${a.depth ? `×${a.depth}` : ''}cm`;
                                                            } else {
                                                                dimensionText = '외곽 실측 규격';
                                                            }
                                                            notes = '파손주의 완충';
                                                        } else if (a.type === 'sculpture') {
                                                            typeLabel = '도자/조각';
                                                            if (a.width && a.height) {
                                                                dimensionText = `입체 ${a.width}×${a.height}${a.depth ? `×${a.depth}` : ''}cm`;
                                                            } else {
                                                                dimensionText = '입체 실측 규격';
                                                            }
                                                            if (a.weight) {
                                                                notes = `중량 ${a.weight}kg`;
                                                            }
                                                        } else {
                                                            typeLabel = '대형/설치';
                                                            dimensionText = '현장 실측 요망';
                                                            notes = a.details || '설치 환경 협의';
                                                        }

                                                        const itemTotalValue = (a.declaredValue || 0) * 10000;

                                                        return (
                                                            <tr key={idx} className="hover:bg-gray-50/50">
                                                                <td className="border-r border-gray-200 p-2 text-center text-gray-500">{idx + 1}</td>
                                                                <td className="border-r border-gray-200 p-2 font-medium text-gray-900">{a.title || `작품 ${idx + 1}`}</td>
                                                                <td className="border-r border-gray-200 p-2 text-center text-gray-700">{typeLabel}</td>
                                                                <td className="border-r border-gray-200 p-2 text-gray-700 font-mono text-[11px]">{dimensionText}</td>
                                                                <td className="border-r border-gray-200 p-2 text-center font-semibold text-gray-800">{a.quantity}점</td>
                                                                <td className="border-r border-gray-200 p-2 text-right font-mono text-gray-800">
                                                                    ₩ {itemTotalValue.toLocaleString()}
                                                                </td>
                                                                <td className="p-2 text-center text-gray-600 text-[11px] truncate max-w-[120px]">{notes}</td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                                <tfoot className="bg-gray-50 font-bold border-t border-gray-200 text-gray-800">
                                                    <tr>
                                                        <td colSpan={4} className="border-r border-gray-200 p-2 text-center">
                                                            작품 내역 소계 (총 {quoteData.artworks.length}개 품목)
                                                        </td>
                                                        <td className="border-r border-gray-200 p-2 text-center text-black">
                                                            {quoteData.totalPieces}점
                                                        </td>
                                                        <td className="border-r border-gray-200 p-2 text-right font-mono text-black">
                                                            ₩ {quoteData.totalValueKRW.toLocaleString()}
                                                        </td>
                                                        <td className="p-2 text-center text-gray-400 text-[11px]">-</td>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>
                                    </div>

                                    {/* 2. Service & Cost Breakdown Table */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-xs">
                                            <h3 className="font-bold text-gray-800 text-sm">2. 운송 및 작업 견적 내역</h3>
                                            <span className="text-gray-500">특수차량, 인건비, 포장·설치 및 보험료</span>
                                        </div>
                                        <table className="w-full text-xs border-collapse border border-gray-200">
                                        <thead>
                                            <tr className="bg-gray-100 text-gray-700">
                                                <th className="border border-gray-200 p-2 text-center">항목</th>
                                                <th className="border border-gray-200 p-2 text-left">세부 내역</th>
                                                <th className="border border-gray-200 p-2 text-center">수량/규격</th>
                                                <th className="border border-gray-200 p-2 text-right">금액(원)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="border border-gray-200 p-2 text-center font-bold">특수차량 운임</td>
                                                <td className="border border-gray-200 p-2">{quoteData.recommendedTruck} 무진동 항온항습 운송</td>
                                                <td className="border border-gray-200 p-2 text-center">1식</td>
                                                <td className="border border-gray-200 p-2 text-right">{quoteData.baseVehicleCost.toLocaleString()}</td>
                                            </tr>
                                            <tr>
                                                <td className="border border-gray-200 p-2 text-center font-bold">전문 인건비</td>
                                                <td className="border border-gray-200 p-2">전문 아트 핸들러 상·하차 및 반입</td>
                                                <td className="border border-gray-200 p-2 text-center">{quoteData.handlersCount}인</td>
                                                <td className="border border-gray-200 p-2 text-right">{quoteData.laborCost.toLocaleString()}</td>
                                            </tr>
                                            {quoteData.packagingCost > 0 && (
                                                <tr>
                                                    <td className="border border-gray-200 p-2 text-center font-bold">특수 포장비</td>
                                                    <td className="border border-gray-200 p-2">중성지/완충재 및 보호패킹</td>
                                                    <td className="border border-gray-200 p-2 text-center">{quoteData.totalPieces}점</td>
                                                    <td className="border border-gray-200 p-2 text-right">{quoteData.packagingCost.toLocaleString()}</td>
                                                </tr>
                                            )}
                                            {quoteData.installCost > 0 && (
                                                <tr>
                                                    <td className="border border-gray-200 p-2 text-center font-bold">전시장 설치비</td>
                                                    <td className="border border-gray-200 p-2">레이저 레벨 수평 시공 및 와이어 결착</td>
                                                    <td className="border border-gray-200 p-2 text-center">{quoteData.totalPieces}점</td>
                                                    <td className="border border-gray-200 p-2 text-right">{quoteData.installCost.toLocaleString()}</td>
                                                </tr>
                                            )}
                                            {quoteData.insuranceCost > 0 && (
                                                <tr>
                                                    <td className="border border-gray-200 p-2 text-center font-bold">동산물류보험</td>
                                                    <td className="border border-gray-200 p-2">미술품 적하 특약 보험 (10억 한도 담보)</td>
                                                    <td className="border border-gray-200 p-2 text-center">1식</td>
                                                    <td className="border border-gray-200 p-2 text-right">{quoteData.insuranceCost.toLocaleString()}</td>
                                                </tr>
                                            )}
                                        </tbody>
                                        <tfoot>
                                            <tr className="bg-gray-50 font-bold">
                                                <td colSpan={3} className="border border-gray-200 p-2.5 text-right">공급가액</td>
                                                <td className="border border-gray-200 p-2.5 text-right font-mono">₩ {quoteData.subtotal.toLocaleString()}</td>
                                            </tr>
                                            <tr className="bg-gray-50 font-bold">
                                                <td colSpan={3} className="border border-gray-200 p-2.5 text-right">부가가치세 (10%)</td>
                                                <td className="border border-gray-200 p-2.5 text-right font-mono">₩ {quoteData.vat.toLocaleString()}</td>
                                            </tr>
                                            <tr className="bg-black text-white font-bold text-sm">
                                                <td colSpan={3} className="border border-black p-3 text-right">총 견적 금액 (VAT 포함)</td>
                                                <td className="border border-black p-3 text-right font-mono">₩ {quoteData.totalWithVat.toLocaleString()}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>

                                    <div className="text-center pt-4 border-t border-gray-200 text-xs text-gray-500">
                                        위와 같이 정히 견적합니다. &nbsp;&nbsp; <strong>{settings?.companyName || '(주)아츠팩토리'} (직인생략)</strong>
                                    </div>
                                </div>

                                <div className="flex gap-4 print:hidden">
                                    <button
                                        type="button"
                                        onClick={() => window.print()}
                                        className="flex-1 py-4 bg-[#121212] hover:bg-[#C5A059] hover:text-[#121212] text-white font-bold text-sm rounded-full transition-all flex items-center justify-center gap-2"
                                    >
                                        <Printer className="w-4 h-4" />
                                        지금 인쇄 / PDF 다운로드
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>,
        document.body
    );
}
