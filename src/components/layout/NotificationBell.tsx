'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, BellDot, X, Check, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getNotifications, markAsRead, markAllAsRead } from '@/app/actions/notifications';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function NotificationBell() {
    const { data: session } = useSession();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    useEffect(() => {
        if (session) {
            fetchNotifications();
            // 3분마다 자동 일신
            const interval = setInterval(fetchNotifications, 180000);
            return () => clearInterval(interval);
        }
    }, [session]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        const res = await getNotifications();
        if (res.success) {
            setNotifications(res.notifications);
        }
    };

    const handleMarkAsRead = async (id: string) => {
        const res = await markAsRead(id);
        if (res.success) {
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        }
    };

    const handleMarkAllAsRead = async () => {
        const res = await markAllAsRead();
        if (res.success) {
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        }
    };

    if (!session) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2.5 rounded-full hover:bg-gray-50 transition-colors"
            >
                {unreadCount > 0 ? (
                    <BellDot className="w-5 h-5 text-accent" />
                ) : (
                    <Bell className="w-5 h-5 text-gray-400" />
                )}
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full border-2 border-white" />
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-4 w-[380px] bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-[100]"
                    >
                        {/* Header */}
                        <div className="px-6 py-5 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-[11px] font-black uppercase tracking-widest text-black">Notifications</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="text-[10px] font-black uppercase tracking-widest text-accent hover:text-black transition-colors"
                                >
                                    Mark all as read
                                </button>
                            )}
                        </div>

                        {/* List */}
                        <div className="max-h-[450px] overflow-y-auto no-scrollbar">
                            {notifications.length > 0 ? (
                                <div className="flex flex-col">
                                    {notifications.map((n) => (
                                        <div
                                            key={n._id}
                                            className={`p-6 border-b border-gray-50 hover:bg-gray-50/80 transition-all group ${!n.isRead ? 'bg-accent/[0.02]' : ''}`}
                                        >
                                            <div className="flex gap-4">
                                                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.isRead ? 'bg-accent' : 'bg-transparent'}`} />
                                                <div className="flex-grow space-y-1">
                                                    <p className="text-xs font-bold text-black leading-snug">{n.title}</p>
                                                    <p className="text-[11px] text-gray-500 leading-relaxed">{n.message}</p>
                                                    <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest pt-1">
                                                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: ko })}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => handleMarkAsRead(n._id)}
                                                    className={`shrink-0 p-2 rounded-full hover:bg-white transition-colors opacity-0 group-hover:opacity-100 ${n.isRead ? 'invisible' : ''}`}
                                                >
                                                    <Check className="w-3.5 h-3.5 text-accent" />
                                                </button>
                                            </div>
                                            {n.link && (
                                                <Link
                                                    href={n.link}
                                                    onClick={() => handleMarkAsRead(n._id)}
                                                    className="mt-4 flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
                                                >
                                                    View Details <ExternalLink size={10} />
                                                </Link>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-20 flex flex-col items-center justify-center text-center px-10">
                                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                        <Bell className="w-5 h-5 text-gray-200" />
                                    </div>
                                    <p className="text-[11px] font-black uppercase tracking-widest text-gray-300">No Notifications</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
