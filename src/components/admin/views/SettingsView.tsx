"use client";

import React, { useState, useEffect } from 'react';
import {
    Settings as SettingsIcon,
    Building2,
    Headphones,
    Share2,
    Save,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Globe,
    FileText,
    MapPin,
    Phone,
    Mail,
    Instagram,
    Youtube,
    Chrome,
    Video,
    Landmark,
    CreditCard
} from 'lucide-react';
import { getSettings, updateSettings } from '@/app/actions/settings';

const SettingsView = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'company' | 'cs' | 'sns' | 'finance'>('company');

    const [settings, setSettings] = useState({
        siteName: '',
        siteDescription: '',
        companyName: '',
        representative: '',
        businessNumber: '',
        mailOrderNumber: '',
        address: '',
        phone: '',
        fax: '',
        email: '',
        bankName: '',
        accountNumber: '',
        accountHolder: '',
        operationHours: '',
        snsLinks: {
            instagram: '',
            blog: '',
            youtube: '',
            kakaotalk: '',
        }
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const res = await getSettings();
            if (res.success && res.settings) {
                setSettings(prev => ({ ...prev, ...res.settings }));
            } else {
                setError(res.error || "설정을 불러오지 못했습니다.");
            }
        } catch {
            setError("데이터 로딩 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name.startsWith('sns.')) {
            const snsKey = name.split('.')[1];
            setSettings(prev => ({
                ...prev,
                snsLinks: { ...prev.snsLinks, [snsKey]: value }
            }));
        } else {
            setSettings(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        try {
            const res = await updateSettings(settings);
            if (res.success) {
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
            } else {
                setError(res.error || "저장에 실패했습니다.");
            }
        } catch {
            setError("서버 통신 중 오류가 발생했습니다.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <Loader2 className="w-10 h-10 animate-spin text-gray-200" />
                <p className="text-gray-400 font-medium animate-pulse">플랫폼 설정을 불러오는 중...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between border-b border-gray-100 pb-8">
                <div>
                    <h2 className="text-3xl font-black text-black tracking-tighter uppercase flex items-center gap-3">
                        <SettingsIcon className="w-8 h-8" /> 플랫폼 설정
                    </h2>
                    <p className="text-gray-400 mt-2 font-medium">서비스 운영에 필요한 기본 정보와 푸터 데이터를 관리합니다.</p>
                </div>
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="relative z-[100] flex items-center gap-2 px-8 py-4 bg-black text-white rounded-[20px] text-sm font-black hover:bg-gray-800 transition-all shadow-xl shadow-black/10 disabled:bg-gray-200"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> :
                        success ? <CheckCircle2 className="w-4 h-4 text-green-400" /> :
                            <Save className="w-4 h-4" />}
                    {success ? '저장 완료' : saving ? '저장 중...' : '설정 저장하기'}
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-medium">
                    <AlertCircle className="w-5 h-5" /> {error}
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 p-1 bg-gray-50 rounded-[24px] w-fit">
                <button
                    onClick={() => setActiveTab('company')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-[18px] text-xs font-black transition-all ${activeTab === 'company' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-gray-600'
                        }`}
                >
                    <Building2 className="w-3.5 h-3.5" /> 사업자 정보
                </button>
                <button
                    onClick={() => setActiveTab('cs')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-[18px] text-xs font-black transition-all ${activeTab === 'cs' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-gray-600'
                        }`}
                >
                    <Headphones className="w-3.5 h-3.5" /> 고객센터 설정
                </button>
                <button
                    onClick={() => setActiveTab('sns')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-[18px] text-xs font-black transition-all ${activeTab === 'sns' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-gray-600'
                        }`}
                >
                    <Share2 className="w-3.5 h-3.5" /> SNS 링크 관리
                </button>
                <button
                    onClick={() => setActiveTab('finance')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-[18px] text-xs font-black transition-all ${activeTab === 'finance' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-gray-600'
                        }`}
                >
                    <Landmark className="w-3.5 h-3.5" /> 금융 정보
                </button>
            </div>

            <div className="bg-white p-10 rounded-[40px] border border-gray-50 shadow-sm min-h-[400px]">
                {/* 탭 1: 회사 및 사업자 정보 */}
                {activeTab === 'company' && (
                    <div className="space-y-10 animate-in fade-in duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label htmlFor="siteName" className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">사이트명</label>
                                <div className="relative group">
                                    <Globe className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-black transition-colors" />
                                    <input
                                        id="siteName"
                                        type="text" name="siteName" value={settings.siteName} onChange={handleInputChange}
                                        className="w-full pl-12 pr-6 py-5 bg-gray-50 border-2 border-transparent rounded-[24px] focus:bg-white focus:border-black text-sm font-bold outline-none transition-all shadow-sm"
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label htmlFor="siteDescription" className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">사이트 한줄 설명</label>
                                <input
                                    id="siteDescription"
                                    type="text" name="siteDescription" value={settings.siteDescription} onChange={handleInputChange}
                                    className="w-full px-6 py-5 bg-gray-50 border-2 border-transparent rounded-[24px] focus:bg-white focus:border-black text-sm font-bold outline-none transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="h-px bg-gray-50" />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label htmlFor="companyName" className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">상호명 (법인명)</label>
                                <input
                                    id="companyName"
                                    type="text" name="companyName" value={settings.companyName} onChange={handleInputChange}
                                    className="w-full px-6 py-5 bg-gray-50 border-2 border-transparent rounded-[24px] focus:bg-white focus:border-black text-sm font-bold outline-none transition-all shadow-sm"
                                />
                            </div>
                            <div className="space-y-3">
                                <label htmlFor="representative" className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">대표자 성명</label>
                                <input
                                    id="representative"
                                    type="text" name="representative" value={settings.representative} onChange={handleInputChange}
                                    className="w-full px-6 py-5 bg-gray-50 border-2 border-transparent rounded-[24px] focus:bg-white focus:border-black text-sm font-bold outline-none transition-all shadow-sm"
                                />
                            </div>
                            <div className="space-y-3">
                                <label htmlFor="businessNumber" className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">사업자 등록번호</label>
                                <div className="relative group">
                                    <FileText className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-black transition-colors" />
                                    <input
                                        id="businessNumber"
                                        type="text" name="businessNumber" value={settings.businessNumber} onChange={handleInputChange}
                                        className="w-full pl-12 pr-6 py-5 bg-gray-50 border-2 border-transparent rounded-[24px] focus:bg-white focus:border-black text-sm font-bold outline-none transition-all shadow-sm"
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label htmlFor="mailOrderNumber" className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">통신판매업 신고번호</label>
                                <input
                                    id="mailOrderNumber"
                                    type="text" name="mailOrderNumber" value={settings.mailOrderNumber} onChange={handleInputChange}
                                    className="w-full px-6 py-5 bg-gray-50 border-2 border-transparent rounded-[24px] focus:bg-white focus:border-black text-sm font-bold outline-none transition-all shadow-sm"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* 탭 2: 고객 서비스 및 주소 */}
                {activeTab === 'cs' && (
                    <div className="space-y-10 animate-in fade-in duration-500">
                        <div className="space-y-3">
                            <label htmlFor="address" className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">사업장 주소</label>
                            <div className="relative group">
                                <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-black transition-colors" />
                                <input
                                    id="address"
                                    type="text" name="address" value={settings.address} onChange={handleInputChange}
                                    className="w-full pl-12 pr-6 py-5 bg-gray-50 border-2 border-transparent rounded-[24px] focus:bg-white focus:border-black text-sm font-bold outline-none transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label htmlFor="phone" className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">고객센터 전화번호</label>
                                <div className="relative group">
                                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-black transition-colors" />
                                    <input
                                        id="phone"
                                        type="text" name="phone" value={settings.phone} onChange={handleInputChange}
                                        className="w-full pl-12 pr-6 py-5 bg-gray-50 border-2 border-transparent rounded-[24px] focus:bg-white focus:border-black text-sm font-bold outline-none transition-all shadow-sm"
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label htmlFor="fax" className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">팩스 번호 (선택)</label>
                                <input
                                    id="fax"
                                    type="text" name="fax" value={settings.fax} onChange={handleInputChange}
                                    className="w-full px-6 py-5 bg-gray-50 border-2 border-transparent rounded-[24px] focus:bg-white focus:border-black text-sm font-bold outline-none transition-all shadow-sm"
                                />
                            </div>
                            <div className="md:col-span-2 space-y-3">
                                <label htmlFor="email" className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">대표 이메일 주소</label>
                                <div className="relative group">
                                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-black transition-colors" />
                                    <input
                                        id="email"
                                        type="email" name="email" value={settings.email} onChange={handleInputChange}
                                        className="w-full pl-12 pr-6 py-5 bg-gray-50 border-2 border-transparent rounded-[24px] focus:bg-white focus:border-black text-sm font-bold outline-none transition-all shadow-sm"
                                    />
                                </div>
                            </div>
                            <div className="md:col-span-2 space-y-3">
                                <label htmlFor="operationHours" className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">운영 시간 (푸터 표시용)</label>
                                <textarea
                                    id="operationHours"
                                    name="operationHours" value={settings.operationHours} onChange={handleInputChange}
                                    rows={3}
                                    className="w-full px-6 py-5 bg-gray-50 border-2 border-transparent rounded-[24px] focus:bg-white focus:border-black text-sm font-bold outline-none transition-all shadow-sm resize-none"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* 탭 4: 금융 및 계좌 정보 */}
                {activeTab === 'finance' && (
                    <div className="space-y-10 animate-in fade-in duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label htmlFor="bankName" className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">은행명</label>
                                <div className="relative group">
                                    <Landmark className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-black transition-colors" />
                                    <input
                                        id="bankName"
                                        type="text" name="bankName" value={settings.bankName} onChange={handleInputChange}
                                        className="w-full pl-12 pr-6 py-5 bg-gray-50 border-2 border-transparent rounded-[24px] focus:bg-white focus:border-black text-sm font-bold outline-none transition-all shadow-sm"
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label htmlFor="accountHolder" className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">예금주</label>
                                <input
                                    id="accountHolder"
                                    type="text" name="accountHolder" value={settings.accountHolder} onChange={handleInputChange}
                                    className="w-full px-6 py-5 bg-gray-50 border-2 border-transparent rounded-[24px] focus:bg-white focus:border-black text-sm font-bold outline-none transition-all shadow-sm"
                                />
                            </div>
                            <div className="md:col-span-2 space-y-3">
                                <label htmlFor="accountNumber" className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">계좌번호</label>
                                <div className="relative group">
                                    <CreditCard className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-black transition-colors" />
                                    <input
                                        id="accountNumber"
                                        type="text" name="accountNumber" value={settings.accountNumber} onChange={handleInputChange}
                                        className="w-full pl-12 pr-6 py-5 bg-gray-50 border-2 border-transparent rounded-[24px] focus:bg-white focus:border-black text-sm font-bold outline-none transition-all shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 탭 3: SNS 링크 */}
                {activeTab === 'sns' && (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-center gap-4 group bg-gray-50 p-6 rounded-[32px] hover:bg-white hover:shadow-xl hover:shadow-pink-500/5 transition-all border border-transparent hover:border-pink-100">
                                <div className="w-14 h-14 bg-pink-100 rounded-[20px] flex items-center justify-center text-pink-500 transition-all">
                                    <Instagram className="w-7 h-7" />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <label htmlFor="sns_instagram" className="text-[9px] font-black text-pink-400 uppercase tracking-widest ml-1">인스타그램 URL</label>
                                    <input
                                        id="sns_instagram"
                                        type="text" name="sns.instagram" value={settings.snsLinks.instagram} onChange={handleInputChange}
                                        placeholder="https://instagram.com/계정"
                                        className="w-full bg-transparent border-none p-0 text-sm font-bold text-black outline-none placeholder:text-gray-300"
                                        title="인스타그램 URL"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-4 group bg-gray-50 p-6 rounded-[32px] hover:bg-white hover:shadow-xl hover:shadow-red-500/5 transition-all border border-transparent hover:border-red-100">
                                <div className="w-14 h-14 bg-red-100 rounded-[20px] flex items-center justify-center text-red-500 transition-all">
                                    <Youtube className="w-7 h-7" />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <label htmlFor="sns_youtube" className="text-[9px] font-black text-red-400 uppercase tracking-widest ml-1">유튜브 채널 URL</label>
                                    <input
                                        id="sns_youtube"
                                        type="text" name="sns.youtube" value={settings.snsLinks.youtube} onChange={handleInputChange}
                                        placeholder="https://youtube.com/@채널"
                                        className="w-full bg-transparent border-none p-0 text-sm font-bold text-black outline-none placeholder:text-gray-300"
                                        title="유튜브 채널 URL"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-4 group bg-gray-50 p-6 rounded-[32px] hover:bg-white hover:shadow-xl hover:shadow-green-500/5 transition-all border border-transparent hover:border-green-100">
                                <div className="w-14 h-14 bg-green-100 rounded-[20px] flex items-center justify-center text-green-500 transition-all">
                                    <Chrome className="w-7 h-7" />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <label htmlFor="sns_blog" className="text-[9px] font-black text-green-400 uppercase tracking-widest ml-1">네이버 블로그 / 웹사이트</label>
                                    <input
                                        id="sns_blog"
                                        type="text" name="sns.blog" value={settings.snsLinks.blog} onChange={handleInputChange}
                                        placeholder="https://blog.naver.com/..."
                                        className="w-full bg-transparent border-none p-0 text-sm font-bold text-black outline-none placeholder:text-gray-300"
                                        title="네이버 블로그 / 웹사이트 URL"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-4 group bg-gray-50 p-6 rounded-[32px] hover:bg-white hover:shadow-xl hover:shadow-yellow-500/5 transition-all border border-transparent hover:border-yellow-100">
                                <div className="w-14 h-14 bg-yellow-100 rounded-[20px] flex items-center justify-center text-yellow-600 transition-all">
                                    <Video className="w-7 h-7" />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <label htmlFor="sns_kakaotalk" className="text-[9px] font-black text-yellow-500 uppercase tracking-widest ml-1">카카오톡 채널 링크</label>
                                    <input
                                        id="sns_kakaotalk"
                                        type="text" name="sns.kakaotalk" value={settings.snsLinks.kakaotalk} onChange={handleInputChange}
                                        placeholder="카카오채널 주소"
                                        className="w-full bg-transparent border-none p-0 text-sm font-bold text-black outline-none placeholder:text-gray-300"
                                        title="카카오톡 채널 링크"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SettingsView;
