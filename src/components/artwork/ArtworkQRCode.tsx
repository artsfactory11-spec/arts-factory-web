'use client';

import { useState, useRef } from 'react';
import QRCode from 'react-qr-code';
import { QrCode, Download, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ArtworkQRCodeProps {
    artworkId: string;
    title: string;
    artistName: string;
    price: number;
}

export default function ArtworkQRCode({ artworkId, title, artistName, price }: ArtworkQRCodeProps) {
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
            // 고해상도 네임택 규격 (1200 x 1600)
            canvas.width = 1200;
            canvas.height = 1600;

            if (ctx) {
                // 1. 배경 (Pure White)
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // 2. 상단 브랜드 필러 (Arts Factory)
                ctx.fillStyle = '#000000';
                ctx.font = '900 54px sans-serif'; // 크기 키움 (32px -> 54px)
                ctx.textAlign = 'center';
                ctx.letterSpacing = '12px'; // 간격 넓힘
                ctx.fillText('ARTS FACTORY', canvas.width / 2, 120);

                // 3. QR 코드 배치 (중앙 상단)
                // QR 이미지를 600x600 크기로 중앙에 배치
                const qrSize = 600;
                const qrX = (canvas.width - qrSize) / 2;
                const qrY = 240;
                ctx.drawImage(img, qrX, qrY, qrSize, qrSize);
                
                // 4. 정보 구분선 (선택사항 - 미니멀을 위해 아주 연하게)
                ctx.strokeStyle = '#e5e7eb'; // gray-200 (약간 더 진하게)
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(300, 940);
                ctx.lineTo(900, 940);
                ctx.stroke();

                // 5. 작품 정보 렌더링
                // 작품명 (가장 크게)
                ctx.fillStyle = '#000000';
                ctx.font = '900 68px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(title, canvas.width / 2, 1070);

                // 작가명
                ctx.font = '700 46px sans-serif';
                ctx.fillStyle = '#111827'; // gray-900
                ctx.fillText(artistName, canvas.width / 2, 1160);

                // 가격 (₩ 표시)
                ctx.font = '600 42px sans-serif';
                ctx.fillStyle = '#374151'; // gray-700
                const formattedPrice = `₩ ${price.toLocaleString()}`;
                ctx.fillText(formattedPrice, canvas.width / 2, 1250);

                // 6. 하단 안내 문구
                ctx.font = '600 32px sans-serif'; // 크기 키움 (24px -> 32px)
                ctx.fillStyle = '#6b7280'; // gray-500 (더 진하게)
                ctx.fillText('Scan to view curation details', canvas.width / 2, 1480);

                const pngFile = canvas.toDataURL('image/png');
                const downloadLink = document.createElement('a');
                // 파일명 규칙 수정: 작가_작품명_QR.png
                const safeFileName = `${artistName}_${title}`.replace(/\s+/g, '_');
                downloadLink.download = `${safeFileName}_QR.png`;
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
