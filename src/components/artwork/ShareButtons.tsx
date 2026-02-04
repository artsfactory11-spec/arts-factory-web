'use client';

import { useState } from 'react';
import { Share2, Link as LinkIcon, Twitter, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ShareButtonsProps {
    title: string;
    url?: string;
}

export default function ShareButtons({ title, url }: ShareButtonsProps) {
    const [copied, setCopied] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const shareUrl = typeof window !== 'undefined' ? (url || window.location.href) : '';

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    };

    const shareToTwitter = () => {
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`;
        window.open(twitterUrl, '_blank');
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 px-6 py-3 bg-gray-50 hover:bg-gray-100 rounded-full text-[10px] font-black uppercase tracking-widest transition-all"
            >
                <Share2 className="w-3.5 h-3.5" />
                Share
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute bottom-full left-0 mb-4 p-4 bg-white rounded-3xl shadow-2xl border border-gray-100 flex gap-2 z-50 min-w-[200px]"
                    >
                        <button
                            onClick={handleCopy}
                            className="flex-1 flex flex-col items-center gap-2 p-3 hover:bg-gray-50 rounded-2xl transition-colors group"
                        >
                            <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                                {copied ? <Check className="w-4 h-4 text-accent" /> : <LinkIcon className="w-4 h-4" />}
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-tighter">
                                {copied ? 'Copied' : 'Copy Link'}
                            </span>
                        </button>

                        <button
                            onClick={shareToTwitter}
                            className="flex-1 flex flex-col items-center gap-2 p-3 hover:bg-gray-50 rounded-2xl transition-colors group"
                        >
                            <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-[#1DA1F2] group-hover:text-white transition-colors">
                                <Twitter className="w-4 h-4" />
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-tighter">Twitter</span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
