"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import VRViewer from './VRViewer';

interface VRSectionProps {
    artwork: any;
}

export default function VRSection({ artwork }: VRSectionProps) {
    const [showVR, setShowVR] = useState(false);

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h3 className="text-sm font-bold text-black uppercase tracking-tighter">Virtual Placement</h3>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">가상 공간에서 작품의 크기와 느낌을 확인해보세요.</p>
                </div>
                {!showVR && (
                    <button
                        onClick={() => setShowVR(true)}
                        className="px-6 py-3 bg-accent text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-accent/20"
                    >
                        Preview in VR
                    </button>
                )}
            </div>

            {showVR && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative"
                >
                    <VRViewer
                        imageUrl={artwork.firebase_image_url}
                        artworkTitle={artwork.title}
                        sizeDesc={artwork.size}
                    />
                    <button
                        onClick={() => setShowVR(false)}
                        className="absolute top-8 right-8 z-20 w-10 h-10 bg-black/10 hover:bg-black/20 text-black rounded-full flex items-center justify-center backdrop-blur-md transition-colors"
                    >
                        <X size={18} />
                    </button>
                </motion.div>
            )}
        </div>
    );
}
