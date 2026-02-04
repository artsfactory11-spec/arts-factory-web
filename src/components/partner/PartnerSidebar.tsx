"use client";

import React from 'react';
import {
    LayoutDashboard,
    Palette,
    PlusCircle,
    CreditCard,
    User,
    BarChart3,
    LogOut,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

export type ViewType = 'home' | 'artworks' | 'upload' | 'sales' | 'profile' | 'analytics';

interface SidebarItemProps {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    active: boolean;
    onClick: () => void;
    collapsed?: boolean;
}

const SidebarItem = ({ icon: Icon, label, active, onClick, collapsed }: SidebarItemProps) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${active
            ? 'bg-black text-white shadow-lg shadow-gray-200'
            : 'text-gray-500 hover:bg-gray-100 hover:text-black'
            }`}
    >
        <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-white' : 'group-hover:scale-110 transition-transform'}`} />
        {!collapsed && <span className="font-medium text-sm whitespace-nowrap">{label}</span>}
    </button>
);

interface PartnerSidebarProps {
    currentView: ViewType;
    setView: (view: ViewType) => void;
}

const PartnerSidebar = ({ currentView, setView }: PartnerSidebarProps) => {
    const [isCollapsed, setIsCollapsed] = React.useState(false);

    const menuItems = [
        { id: 'home', label: '홈', icon: LayoutDashboard },
        { id: 'artworks', label: '작품 관리', icon: Palette },
        { id: 'upload', label: '새 작품 등록', icon: PlusCircle },
        { id: 'sales', label: '판매/렌탈 현황', icon: CreditCard },
        { id: 'profile', label: '작가 프로필', icon: User },
        { id: 'analytics', label: '활동 통계', icon: BarChart3 },
    ];

    return (
        <aside
            className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-100 transition-all duration-300 z-50 flex flex-col ${isCollapsed ? 'w-20' : 'w-64'
                }`}
        >
            {/* Logo Section */}
            <div className="p-6 flex items-center justify-between">
                {!isCollapsed && (
                    <div className="flex flex-col">
                        <span className="text-xl font-black tracking-tighter text-black">ARTS FACTORY</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mt-1">Partner Admin</span>
                    </div>
                )}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors"
                >
                    {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                </button>
            </div>

            {/* Navigation section */}
            <nav className="flex-1 px-4 py-4 space-y-2">
                {menuItems.map((item) => (
                    <SidebarItem
                        key={item.id}
                        icon={item.icon}
                        label={item.label}
                        active={currentView === item.id}
                        onClick={() => setView(item.id as ViewType)}
                        collapsed={isCollapsed}
                    />
                ))}
            </nav>

            {/* Footer Section (Logout etc) */}
            <div className="p-4 border-t border-gray-50">
                <button
                    className={`w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 group`}
                >
                    <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    {!isCollapsed && <span className="font-medium text-sm">로그아웃</span>}
                </button>
            </div>
        </aside>
    );
};

export default PartnerSidebar;
