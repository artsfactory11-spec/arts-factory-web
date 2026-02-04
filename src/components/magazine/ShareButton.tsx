"use client";

import React from 'react';
import { Share2, Link as LinkIcon, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ShareButton = ({ title }: { title: string }) => {
    const [copied, setCopied] = React.useState(false);

    const handleShare = async () => {
        const url = window.location.href;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: title,
                    url: url
                });
            } catch (err) {
                console.log("Share failed:", err);
            }
        } else {
            try {
                await navigator.clipboard.writeText(url);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (err) {
                console.log("Copy failed:", err);
            }
        }
    };

    return (
        <div className="relative">
            <button
                onClick={handleShare}
                className="flex items-center gap-3 px-10 py-5 bg-black text-white rounded-full text-xs font-black uppercase tracking-[0.2em] hover:bg-gray-800 transition-all active:scale-95 shadow-2xl shadow-black/10 group"
            >
                <Share2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                친구에게 공유하기
            </button>

            <AnimatePresence>
                {copied && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-1/2 -translate-x-1/2 mt-4 px-4 py-2 bg-black text-white text-[10px] font-bold rounded-lg whitespace-nowrap flex items-center gap-2"
                    >
                        <CheckCircle2 className="w-3 h-3 text-green-400" /> 링크가 복사되었습니다
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ShareButton;
