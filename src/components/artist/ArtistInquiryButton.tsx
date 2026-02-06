"use client";

import React, { useState } from 'react';
import ArtistInquiryModal from './ArtistInquiryModal';

interface ArtistInquiryButtonProps {
    artistName: string;
}

export default function ArtistInquiryButton({ artistName }: ArtistInquiryButtonProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="flex-1 px-8 py-5 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-center hover:bg-zinc-800 transition-all shadow-2xl shadow-black/20"
            >
                Inquire about Artist
            </button>
            <ArtistInquiryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                artistName={artistName}
            />
        </>
    );
}
