'use client';

import { useState, useRef } from 'react';
import QRCode from 'react-qr-code';
import { QrCode, Download, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ArtworkQRCodeProps {
    artworkId: string;
    title: string;
}

export default function ArtworkQRCode({ artworkId, title }: ArtworkQRCodeProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const qrRef = useRef<HTMLDivElement>(null);

    const shareUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/artwork/${artworkId}` 
        : '';

    const downloadQRCode = () => {
        if (!qrRef.current) return;
        setIsDownloading(true);

        const svg = qrRef.current.querySelector('svg');
        if (!svg) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            canvas.width = img.width + 40; // Add padding
            canvas.height = img.height + 100; // Add space for text
            if (ctx) {
                // Background
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Draw QR
                ctx.drawImage(img, 20, 20);
                
                // Add Text
                ctx.fillStyle = 'black';
                ctx.font = 'bold 14px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(title, canvas.width / 2, img.height + 50);
                ctx.font = '10px Arial';
                ctx.fillStyle = '#666';
                ctx.fillText('Arts Factory', canvas.width / 2, img.height + 75);

                const pngFile = canvas.toDataURL('image/png');
                const downloadLink = document.createElement('a');
                downloadLink.download = `QR_${title.replace(/\s+/g, '_')}.png`;
                downloadLink.href = pngFile;
                downloadLink.click();
                setIsDownloading(false);
            }
        };

        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-3 px-6 py-3 bg-black text-white hover:bg-zinc-800 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-black/10"
            >
                <QrCode className="w-3.5 h-3.5" />
                View & Print QR
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
                        />

                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white rounded-[40px] p-10 z-[70] shadow-2xl"
                        >
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors"
                                aria-label="닫기"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="text-center mb-8">
                                <h3 className="text-lg font-black uppercase tracking-tight mb-1">{title}</h3>
                                <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em]">Artwork QR Code</p>
                            </div>

                            <div className="flex justify-center mb-10 p-6 bg-white border border-gray-100 rounded-3xl" ref={qrRef}>
                                <QRCode
                                    size={200}
                                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                    value={shareUrl}
                                    viewBox={`0 0 256 256`}
                                />
                            </div>

                            <div className="space-y-4">
                                <p className="text-[11px] text-center text-gray-700 font-medium leading-relaxed px-4">
                                    이 QR 코드를 스캔하면 현재 작품의 상세 페이지와<br/>큐레이션 설명을 확인할 수 있습니다.
                                </p>
                                
                                <button
                                    onClick={downloadQRCode}
                                    disabled={isDownloading}
                                    className="w-full flex items-center justify-center gap-2 py-4 bg-gray-50 hover:bg-gray-100 rounded-2xl text-xs font-bold transition-all"
                                >
                                    {isDownloading ? (
                                        <Check className="w-4 h-4 text-green-500" />
                                    ) : (
                                        <Download className="w-4 h-4 text-black" />
                                    )}
                                    {isDownloading ? 'Downloading...' : 'Download for Gallery Print'}
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
