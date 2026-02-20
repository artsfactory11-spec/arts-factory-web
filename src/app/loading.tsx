'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function Loading() {
    return (
        <div className="fixed inset-0 bg-white z-[9999] flex flex-col items-center justify-center overflow-hidden">
            {/* Minimal Background Pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-dot-pattern" />
            </div>

            <div className="relative flex flex-col items-center">
                {/* Artistic Loading Animation: Drawing Line */}
                <div className="relative w-32 h-32 mb-12">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                        <motion.circle
                            cx="50"
                            cy="50"
                            r="45"
                            stroke="black"
                            strokeWidth="0.5"
                            fill="none"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        />
                        <motion.path
                            d="M30 50 L70 50 M50 30 L50 70"
                            stroke="black"
                            strokeWidth="0.5"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                        />
                    </svg>

                    {/* Floating Accent Dots */}
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.6, 0.3]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute top-0 left-1/2 -translate-x-1/2 -mt-4 w-1.5 h-1.5 bg-accent rounded-full"
                    />
                </div>

                <div className="text-center space-y-4">
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[10px] font-black tracking-[0.8em] text-black uppercase ml-[0.8em]"
                    >
                        Arts Factory
                    </motion.h2>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: 40 }}
                        transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
                        className="h-[1px] bg-black/10 mx-auto"
                    />
                    <p className="text-xs font-serif italic text-gray-400">
                        Curating the finest moments...
                    </p>
                </div>
            </div>

            {/* Bottom Progress Indicator */}
            <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 3, repeat: Infinity }}
                className="fixed bottom-0 left-0 right-0 h-1 bg-black origin-left"
            />
        </div>
    );
}
