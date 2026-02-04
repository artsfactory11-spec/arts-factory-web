"use client";

import React from 'react';
import {
    LayoutDashboard,
    Palette,
    Users,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Home,
    PlusCircle,
    Layers,
    UserPlus,
    Newspaper,
    MessageSquare
} from 'lucide-react';
import Link from 'next/link';

export type AdminViewType = 'home' | 'artworks' | 'artwork-edit' | 'upload' | 'bulk-upload' | 'artists' | 'artist-register' | 'settings' | 'magazine' | 'magazine-edit' | 'inquiries';

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

interface AdminSidebarProps {
    currentView: AdminViewType;
    setView: (view: AdminViewType) => void;
    isCollapsed: boolean;
    setIsCollapsed: (collapsed: boolean) => void;
}

const AdminSidebar = ({ currentView, setView, isCollapsed, setIsCollapsed }: AdminSidebarProps) => {

    const menuItems = [
        { id: 'home', label: '관리자 홈', icon: LayoutDashboard },
        { id: 'inquiries', label: 'B2B 문의 내역', icon: MessageSquare },
        { id: 'artworks', label: '작품 승인 관리', icon: Palette },
        { id: 'upload', label: '작품 대리 등록', icon: PlusCircle },
        { id: 'bulk-upload', label: '작품 대량 업로드', icon: Layers },
        { id: 'magazine', label: '매거진 관리', icon: Newspaper },
        { id: 'artists', label: '작가(파트너) 관리', icon: Users },
        { id: 'artist-register', label: '작가 신규 등록', icon: UserPlus },
        { id: 'settings', label: '플랫폼 설정', icon: Settings },
    ];

    return (
        <aside
            className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-100 transition-all duration-300 z-50 flex flex-col ${isCollapsed ? 'w-20' : 'w-64'
                }`}
        >
            {/* Logo Section */}
            <div className="p-8 pb-10 flex items-center justify-between">
                {!isCollapsed && (
                    <div className="flex flex-col">
                        <span className="text-2xl font-serif font-light tracking-tighter text-black italic leading-none">Arts Factory</span>
                        <div className="flex items-center gap-2 mt-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-[9px] text-gray-400 font-black uppercase tracking-[0.2em]">Management</span>
                        </div>
                    </div>
                )}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className={`p-2 hover:bg-black hover:text-white rounded-xl text-gray-300 transition-all duration-300 ${isCollapsed ? 'mx-auto' : ''}`}
                >
                    {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>
            </div>

            {/* Navigation section */}
            <nav className="flex-1 px-4 space-y-1.5">
                {!isCollapsed && <p className="px-4 mb-4 text-[9px] font-black text-gray-300 uppercase tracking-[0.3em]">Main Menu</p>}

                {menuItems.map((item) => (
                    <SidebarItem
                        key={item.id}
                        icon={item.id === 'home' ? Home : item.icon}
                        label={item.label}
                        active={currentView === item.id}
                        onClick={() => setView(item.id as AdminViewType)}
                        collapsed={isCollapsed}
                    />
                ))}

                <div className="pt-8 pb-4">
                    <div className="h-px bg-gray-50 mx-4 mb-6" />
                    <Link href="/" className="group block">
                        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-gray-100 ${isCollapsed ? 'justify-center' : ''}`}>
                            <LayoutDashboard className="w-5 h-5 text-gray-400 group-hover:text-black transition-colors" />
                            {!isCollapsed && <span className="text-sm font-bold text-gray-400 group-hover:text-black">Public Site</span>}
                        </div>
                    </Link>
                </div>
            </nav>

            {/* Footer Section */}
            <div className="p-6">
                <button
                    className={`w-full flex items-center gap-3 px-5 py-4 bg-gray-50 text-gray-400 hover:bg-red-500 hover:text-white rounded-[20px] transition-all duration-500 group ${isCollapsed ? 'justify-center' : ''}`}
                >
                    <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    {!isCollapsed && <span className="font-black text-[10px] uppercase tracking-widest">Sign Out</span>}
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
