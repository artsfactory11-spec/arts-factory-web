'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import NotificationBell from './NotificationBell';

const navItems = [
    { name: 'Artworks', href: '/gallery' },
    { name: 'Artists', href: '/artists' },
    { name: 'Magazine', href: '/magazine' },
    { name: 'Partner', href: '/partner' },
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
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'py-4 glass shadow-sm' : 'py-8 bg-transparent'
                }`}
        >
            <div className="max-w-7xl mx-auto px-6 lg:px-12 flex justify-between items-center">
                <Link href="/" className="group">
                    <span className="text-2xl font-serif font-bold tracking-tighter text-black">
                        ARTS FACTORY
                    </span>
                    <div className="h-px w-0 group-hover:w-full bg-black transition-all duration-500 mt-0.5" />
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-12">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`text-[10px] font-black tracking-[0.3em] uppercase transition-colors relative ${pathname === item.href ? 'text-black' : 'text-gray-400 hover:text-black'
                                }`}
                        >
                            {item.name}
                            {pathname === item.href && (
                                <motion.div
                                    layoutId="nav-underline"
                                    className="absolute -bottom-2 left-0 right-0 h-0.5 bg-black"
                                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                />
                            )}
                        </Link>
                    ))}
                    <div className="flex items-center gap-4">
                        <NotificationBell />
                        <Link
                            href="/partner"
                            className="px-6 py-2.5 bg-black text-white text-[10px] font-black uppercase tracking-widest hover:bg-black/80 transition-all shadow-xl shadow-black/10"
                        >
                            Inquiry
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
