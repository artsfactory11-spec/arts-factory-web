"use client";

import React from 'react';
import {
    Palette,
    Users,
    Clock,
    TrendingUp,
    ChevronRight,
    ArrowUpRight
} from 'lucide-react';
import AnalyticsChart from '../AnalyticsChart';

interface StatsViewProps {
    stats: {
        totalArtworks: number;
        pendingArtworks: number;
        totalArtists: number;
        monthlyRevenue: number;
    };
    setView: (view: any) => void;
}

const StatCard = ({ title, value, icon: Icon, unit = "", color, onClick }: any) => (
    <div
        onClick={onClick}
        className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
    >
        <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 bg-gradient-to-br ${color} opacity-[0.03] rounded-full group-hover:scale-110 transition-transform duration-500`} />

        <div className="flex items-start justify-between mb-6">
            <div className={`p-4 rounded-2xl bg-gray-50 group-hover:bg-black group-hover:text-white transition-colors`}>
                <Icon className="w-6 h-6" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        <div className="space-y-1">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{title}</p>
            <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black tracking-tighter text-black">{value.toLocaleString()}</span>
                <span className="text-sm font-bold text-gray-400">{unit}</span>
            </div>
        </div>
    </div>
);

const StatsView = ({ stats, setView }: StatsViewProps) => {
    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section: Welcome Message */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-gray-50/50 to-transparent -z-0" />
                <div className="relative z-10">
                    <span className="text-[10px] font-black tracking-[0.4em] text-accent uppercase mb-3 block">System Overview</span>
                    <h2 className="text-4xl font-black tracking-tighter leading-tight text-black">
                        안녕하세요, <br /> 관리자님.
                    </h2>
                    <p className="text-gray-400 mt-3 font-medium text-sm">현재 플랫폼은 안정적으로 운영되고 있습니다. <br className="hidden md:block" /> 오늘 처리해야 할 업무를 확인해 보세요.</p>
                </div>

                <div className="relative z-10 flex flex-col items-end gap-3">
                    <div className="flex gap-2">
                        <div className="px-4 py-2 bg-gray-50 rounded-full border border-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Server Status: Online</div>
                        <div className="px-4 py-2 bg-black text-white rounded-full text-[10px] font-bold uppercase tracking-widest">Update Required</div>
                    </div>
                    <button
                        onClick={() => setView('artworks')}
                        className="px-8 py-4 bg-black text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center gap-3 shadow-lg shadow-gray-200 group"
                    >
                        Pending Reviews <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-accent transition-colors"><ChevronRight className="w-3 h-3" /></div>
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Artworks"
                    value={stats.totalArtworks}
                    unit="pcs"
                    icon={Palette}
                    color="from-blue-500 to-cyan-500"
                    onClick={() => setView('artworks')}
                />
                <StatCard
                    title="Waiting Approval"
                    value={stats.pendingArtworks}
                    unit="cases"
                    icon={Clock}
                    color="from-orange-500 to-yellow-500"
                    onClick={() => setView('artworks')}
                />
                <StatCard
                    title="Active Artists"
                    value={stats.totalArtists}
                    unit="ppl"
                    icon={Users}
                    color="from-purple-500 to-indigo-500"
                    onClick={() => setView('artists')}
                />
                <StatCard
                    title="Monthly Revenue"
                    value={stats.monthlyRevenue}
                    unit="KRW"
                    icon={TrendingUp}
                    color="from-green-500 to-emerald-500"
                />
            </div>

            {/* Analytics Visualization (Phase 4-4) */}
            <AnalyticsChart />

            {/* Middle Section: Activities & Notice */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activities Placeholder */}
                <div className="lg:col-span-2 bg-white rounded-[40px] border border-gray-100 p-10 shadow-sm space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-black" />
                            <h3 className="text-sm font-black uppercase tracking-widest">Recent Activities</h3>
                        </div>
                        <button className="text-[10px] font-bold text-gray-400 hover:text-black transition-colors uppercase tracking-widest">View All</button>
                    </div>

                    <div className="space-y-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0 group cursor-pointer hover:bg-gray-50/50 px-4 -mx-4 rounded-2xl transition-all">
                                <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-black group-hover:text-white transition-all">
                                        {i === 1 ? <Palette className="w-5 h-5" /> : i === 2 ? <Users className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-black group-hover:translate-x-1 transition-transform">
                                            {i === 1 ? '새로운 작품이 승인 대기 중입니다.' : i === 2 ? '신규 작가 파트너십 문의가 도착했습니다.' : '매거진 에디토리얼이 업데이트되었습니다.'}
                                        </p>
                                        <p className="text-[11px] text-gray-400 mt-1 font-medium italic">Just {i * 10} minutes ago</p>
                                    </div>
                                </div>
                                <ArrowUpRight className="w-4 h-4 text-gray-200 group-hover:text-black transition-colors" />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-8">
                    <div className="bg-black rounded-[40px] p-8 text-white relative overflow-hidden group h-full">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-125 transition-transform duration-700" />
                        <h3 className="text-lg font-bold mb-3 z-10 relative">System Policy</h3>
                        <p className="text-gray-400 text-xs mb-6 z-10 relative leading-relaxed">
                            작품 승인 심사 기준이 강화되었습니다. 가이드를 반드시 확인해 주세요.
                        </p>
                        <button className="z-10 relative px-6 py-3 bg-white text-black rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-gray-100 transition-colors">
                            Policy Guide
                        </button>
                    </div>

                    <div className="bg-gray-50 rounded-[40px] p-8 border border-gray-100 flex flex-col justify-center text-center">
                        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-2">Growth Rate</p>
                        <h4 className="text-3xl font-black text-black mb-1">+24%</h4>
                        <div className="flex items-center justify-center gap-1">
                            <ArrowUpRight className="w-3 h-3 text-green-500" />
                            <p className="text-[10px] text-green-500 font-bold uppercase">Target Reached</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatsView;
