'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Menu, X, User } from 'lucide-react';
import NotificationBell from './NotificationBell';
import { useSession } from 'next-auth/react';

function UserIconLink() {
    const { data: session } = useSession();
    const href = session ? '/mypage' : '/login';

    if (!session) {
        return (
            <Link
                href="/login"
                className="text-xs font-bold text-gray-500 hover:text-charcoal transition-colors uppercase tracking-widest"
            >
                Login
            </Link>
        );
    }

    return (
        <Link
            href={href}
            className="text-gray-400 hover:text-charcoal transition-colors"
            title="마이 페이지"
        >
            <User className="w-5 h-5" />
        </Link>
    );
}

const navItems = [
    { name: '작품', href: '/gallery' },
    { name: '작가', href: '/artists' },
    { name: '매거진', href: '/magazine' },
    { name: '파트너', href: '/partner' },
];

export default function Navbar() {
    const pathname = usePathname();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [pathname]);

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${scrolled ? 'py-4 bg-white/60 backdrop-blur-xl border-b border-white/20 shadow-[0_4px_30px_rgba(0,0,0,0.03)]' : 'py-10 bg-transparent'
                }`}
        >
            <div className="max-w-7xl mx-auto px-6 lg:px-12 flex justify-between items-center">
                <Link href="/" className="group">
                    <span className={`text-2xl font-serif font-bold tracking-tighter transition-colors duration-500 ${scrolled ? 'text-charcoal' : 'text-charcoal'}`}>
                        ARTS FACTORY
                    </span>
                    <div className="h-px w-0 group-hover:w-full bg-accent transition-all duration-500 mt-0.5" />
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-14">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`text-[13px] font-bold tracking-tight transition-colors relative ${pathname === item.href ? 'text-charcoal' : 'text-gray-500 hover:text-charcoal'
                                }`}
                        >
                            {item.name}
                            {pathname === item.href && (
                                <motion.div
                                    layoutId="nav-underline"
                                    className="absolute -bottom-2 left-0 right-0 h-[2px] bg-accent"
                                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                />
                            )}
                        </Link>
                    ))}
                    <div className="flex items-center gap-6">
                        <UserIconLink />
                        <NotificationBell />
                        <Link
                            href="/inquiry"
                            className="px-8 py-3 bg-charcoal text-white text-[12px] font-bold hover:bg-accent transition-all duration-500 shadow-2xl shadow-charcoal/10 rounded-full"
                        >
                            문의하기
                        </Link>
                    </div>
                </div>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden text-black p-2"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-full left-0 right-0 bg-white border-t border-gray-100 flex flex-col p-8 md:hidden shadow-2xl"
                    >
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`py-4 text-2xl font-serif tracking-tight border-b border-gray-50 ${pathname === item.href ? 'text-black font-semibold' : 'text-gray-400'
                                    }`}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
