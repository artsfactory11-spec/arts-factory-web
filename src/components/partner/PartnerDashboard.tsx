"use client";

import React, { useState } from 'react';
import PartnerSidebar, { ViewType } from './PartnerSidebar';
import UploadForm from '../upload/UploadForm';
import ArtworkListView from './views/ArtworkListView';
import ProfileView from './views/ProfileView';
import SalesStatusView from './views/SalesStatusView';
import {
    Home as HomeIcon,
    Palette,
    Settings,
    TrendingUp,
    Package,
    MessageSquare,
    ChevronRight,
    Bell,
    Clock,
    XCircle
} from 'lucide-react';


const ViewContainer = ({ children, title }: { children: React.ReactNode, title: string }) => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{title}</h2>
        </div>
        {children}
    </div>
);

interface PartnerDashboardProps {
    partnerName: string;
    partnerId: string;
    stats: {
        total: number;
        approved: number;
        pending: number;
        rejected: number;
    };
}

const PartnerDashboard = ({ partnerName, partnerId, stats }: PartnerDashboardProps) => {
    const [currentView, setCurrentView] = useState<ViewType>('home');

    const renderView = () => {
        switch (currentView) {
            case 'home':
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900 tracking-tight">안녕하세요, {partnerName} 작가님! 👋</h2>
                                <p className="text-gray-700 mt-1">오늘의 활동 현황을 확인해보세요.</p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    title="알림 확인"
                                    className="p-2.5 bg-white border border-gray-100 rounded-xl text-gray-600 hover:text-black transition-colors relative"
                                >
                                    <Bell className="w-5 h-5" />
                                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { label: '전체 작품', value: stats.total, icon: HomeIcon, color: 'text-gray-700', bg: 'bg-gray-50' },
                                { label: '승인된 작품', value: stats.approved, icon: Palette, color: 'text-blue-500', bg: 'bg-blue-50' },
                                { label: '심사 대기', value: stats.pending, icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50' },
                                { label: '반려된 작품', value: stats.rejected, icon: XCircle, color: 'text-red-500', bg: 'bg-red-50' },
                            ].map((stat, i) => (
                                <div key={i} className="bg-white p-6 rounded-2xl border border-gray-50 shadow-sm hover:shadow-md transition-shadow">
                                    <div className={`${stat.bg} ${stat.color} w-12 h-12 rounded-xl flex items-center justify-center mb-4`}>
                                        <stat.icon className="w-6 h-6" />
                                    </div>
                                    <p className="text-sm font-bold text-gray-700">{stat.label}</p>
                                    <h3 className="text-3xl font-black text-gray-900 mt-1">{stat.value}</h3>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-50 shadow-sm p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="font-bold text-xl">최근 등록 작품</h3>
                                    <button
                                        onClick={() => setCurrentView('artworks')}
                                        className="text-sm font-bold text-gray-600 hover:text-black flex items-center gap-1"
                                    >
                                        전체보기 <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                                    <Palette className="w-12 h-12 mb-4 opacity-20" />
                                    <p>최근 등록된 작품이 없습니다.</p>
                                </div>
                            </div>

                            <div className="bg-black text-white rounded-2xl p-8 flex flex-col justify-between shadow-xl shadow-gray-200">
                                <div>
                                    <h3 className="font-bold text-xl mb-4">작가 프로필 완성도</h3>
                                    <div className="w-full bg-white/20 h-2 rounded-full mb-2">
                                        <div className="w-[85%] bg-white h-full rounded-full"></div>
                                    </div>
                                    <p className="text-sm text-white/60">85% 완성됨</p>
                                </div>
                                <button
                                    onClick={() => setCurrentView('profile')}
                                    className="w-full py-4 bg-white text-black rounded-xl font-bold mt-8 hover:bg-gray-100 transition-colors active:scale-95 shadow-lg shadow-white/10"
                                >
                                    프로필 업데이트하기
                                </button>
                            </div>
                        </div>
                    </div>
                );
            case 'upload':
                return (
                    <ViewContainer title="새 작품 등록">
                        <UploadForm artistId={partnerId} />
                    </ViewContainer>
                );
            case 'artworks':
                return (
                    <ViewContainer title="작품 관리">
                        <ArtworkListView artistId={partnerId} onNewClick={() => setCurrentView('upload')} />
                    </ViewContainer>
                );
            case 'sales':
                return (
                    <ViewContainer title="판매/렌탈 현황">
                        <SalesStatusView />
                    </ViewContainer>
                );
            case 'profile':
                return (
                    <ViewContainer title="작가 프로필 관리">
                        <ProfileView artistId={partnerId} />
                    </ViewContainer>
                );
            default:
                return (
                    <ViewContainer title="준비 중">
                        <div className="bg-white rounded-2xl border border-gray-50 shadow-sm p-20 flex flex-col items-center text-gray-500">
                            <Settings className="w-16 h-16 mb-6 opacity-20" />
                            <p className="text-lg font-medium">준비 중인 기능입니다.</p>
                        </div>
                    </ViewContainer>
                );
        }
    };


    return (
        <div className="min-h-screen bg-[#fafafa]">
            <PartnerSidebar currentView={currentView} setView={setCurrentView} />

            <main className={`transition-all duration-300 min-h-screen p-8 lg:p-12 pl-24 lg:pl-72`}>
                <div className="max-w-6xl mx-auto">
                    {renderView()}
                </div>
            </main>
        </div>
    );
};

export default PartnerDashboard;
