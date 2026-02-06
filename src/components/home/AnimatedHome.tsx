'use client';

import { motion, useScroll, useTransform } from "framer-motion";
import { ReactNode } from "react";

export function RevealSection({ children, delay = 0 }: { children: ReactNode, delay?: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, delay }}
        >
            {children}
        </motion.div>
    );
}

export function ParallaxText({ text, speed = 200, className = "" }: { text: string, speed?: number, className?: string }) {
    const { scrollY } = useScroll();
    const y = useTransform(scrollY, [0, 2000], [0, speed]);

    return (
        <motion.div style={{ y }} className={className}>
            {text}
        </motion.div>
    );
}

export function ArtHeroWrapper({ children, stats }: { children: ReactNode, stats: { artworks: number, artists: number } }) {
    const { scrollY } = useScroll();
    const y = useTransform(scrollY, [0, 500], [0, 200]);

    return (
        <header className="relative min-h-[95vh] flex items-center px-6 lg:px-12 overflow-hidden bg-surface grain">
            <motion.div
                style={{ y }}
                className="absolute -top-20 -right-20 lg:right-0 opacity-[0.05] select-none pointer-events-none"
            >
                <span className="text-[45vw] font-serif font-black leading-none italic uppercase text-charcoal">Art</span>
            </motion.div>

            <div className="max-w-7xl mx-auto w-full relative z-10">
                {children}
            </div>
        </header>
    );
}
