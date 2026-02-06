"use client";

import React, { useState } from 'react';
import AdminSidebar, { AdminViewType } from './AdminSidebar';
import StatsView from './views/StatsView';
import AdminArtworkListView from './views/AdminArtworkListView';
import AdminArtistListView from './views/AdminArtistListView';
import AdminUploadView from './views/AdminUploadView';
import BulkUploadView from './views/BulkUploadView';
import AdminArtistRegisterView from './views/AdminArtistRegisterView';
import SettingsView from './views/SettingsView';
import AdminMagazineListView from './views/AdminMagazineListView';
import AdminMagazineEditorView from './views/AdminMagazineEditorView';
import AdminInquiryListView from './views/AdminInquiryListView';
import OrderManagementView from './views/OrderManagementView';
import SubscriptionManagementView from './views/SubscriptionManagementView';

interface AdminDashboardProps {
    initialArtworks: any[];
    initialUsers: any[];
    stats: any;
}

const AdminDashboard = ({ initialArtworks, initialUsers, stats }: AdminDashboardProps) => {
    const [currentView, setCurrentView] = useState<AdminViewType>('home');
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [editingMagazine, setEditingMagazine] = useState<any>(null);
    const [editingArtwork, setEditingArtwork] = useState<any>(null);
    const [editingArtist, setEditingArtist] = useState<any>(null);

    const renderView = () => {
        switch (currentView) {
            case 'home':
                return <StatsView stats={stats} setView={setCurrentView} />;
            case 'artworks':
                return (
                    <AdminArtworkListView
                        initialArtworks={initialArtworks}
                        onEdit={(art) => {
                            setEditingArtwork(art);
                            setCurrentView('artwork-edit');
                        }}
                    />
                );
            case 'artwork-edit':
                return (
                    <AdminUploadView
                        users={initialUsers}
                        initialData={editingArtwork}
                        onBack={() => setCurrentView('artworks')}
                        onSuccess={() => setCurrentView('artworks')}
                    />
                );
            case 'upload':
                return <AdminUploadView users={initialUsers} />;
            case 'bulk-upload':
                return <BulkUploadView users={initialUsers} />;
            case 'artists':
                return (
                    <AdminArtistListView
                        users={initialUsers}
                        onEdit={(artist) => {
                            setEditingArtist(artist);
                            setCurrentView('artist-edit');
                        }}
                    />
                );
            case 'artist-register':
                return <AdminArtistRegisterView onSuccess={() => setCurrentView('artists')} />;
            case 'artist-edit':
                return (
                    <AdminArtistRegisterView
                        initialData={editingArtist}
                        isEdit={true}
                        onSuccess={() => setCurrentView('artists')}
                    />
                );
            case 'settings':
                return <SettingsView />;
            case 'magazine':
                return (
                    <AdminMagazineListView
                        onEdit={(mag) => {
                            setEditingMagazine(mag);
                            setCurrentView('magazine-edit');
                        }}
                        onCreate={() => {
                            setEditingMagazine(null);
                            setCurrentView('magazine-edit');
                        }}
                    />
                );
            case 'magazine-edit':
                return (
                    <AdminMagazineEditorView
                        initialData={editingMagazine}
                        onBack={() => setCurrentView('magazine')}
                        onSuccess={() => setCurrentView('magazine')}
                    />
                );
            case 'inquiries':
                return <AdminInquiryListView />;
            case 'orders':
                return <OrderManagementView />;
            case 'subscriptions':
                return <SubscriptionManagementView />;
            default:
                return <StatsView stats={stats} setView={setCurrentView} />;
        }
    };

    return (
        <div className="flex min-h-screen bg-[#fafafa]">
            <AdminSidebar
                currentView={currentView}
                setView={setCurrentView}
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
                pendingCounts={{
                    artworks: stats.pendingArtworks || 0,
                    artists: stats.pendingArtists || 0
                }}
            />

            <main className={`flex-1 ${isCollapsed ? 'ml-20' : 'ml-64'} min-h-screen bg-[#fcfcfc] overflow-y-auto transition-all duration-300 relative`}>
                {/* 상단 통합 헤더 */}
                <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-md border-b border-gray-100 px-8 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-1 h-6 bg-black rounded-full" />
                        <h1 className="text-lg font-black tracking-tighter text-black uppercase">
                            {currentView === 'home' && 'Management Dashboard'}
                            {currentView === 'artworks' && 'Artwork Management'}
                            {currentView === 'upload' && 'Register Artwork'}
                            {currentView === 'bulk-upload' && 'Bulk Upload'}
                            {currentView === 'magazine' && 'Magazine Editor'}
                            {currentView === 'artists' && 'Partner Artists'}
                            {currentView === 'settings' && 'Platform Settings'}
                            {currentView === 'inquiries' && 'B2B Inquiries'}
                            {(currentView === 'artwork-edit' || currentView === 'magazine-edit' || currentView === 'artist-register') && 'Edit Content'}
                        </h1>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex flex-col items-end">
                            <span className="text-xs font-black text-black leading-none">MASTER ADMIN</span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Status: Online</span>
                        </div>
                        <div className="w-10 h-10 rounded-2xl bg-black flex items-center justify-center text-white text-xs font-black">
                            AF
                        </div>
                    </div>
                </header>

                <div className="max-w-7xl mx-auto p-8 lg:p-12">
                    {renderView()}
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
