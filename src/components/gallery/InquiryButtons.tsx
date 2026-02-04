"use client";

import React, { useState } from 'react';
import InquiryModal from './InquiryModal';

interface InquiryButtonsProps {
    artwork: {
        id: string;
        title: string;
        artist: string;
    };
}

const InquiryButtons = ({ artwork }: InquiryButtonsProps) => {
    const [modalConfig, setModalConfig] = useState<{ isOpen: boolean; type: 'purchase' | 'rental' }>({
        isOpen: false,
        type: 'purchase'
    });

    const openModal = (type: 'purchase' | 'rental') => {
        setModalConfig({ isOpen: true, type });
    };

    return (
        <>
            <div className="grid grid-cols-2 gap-4">
                <button
                    onClick={() => openModal('purchase')}
                    className="py-4 border border-black text-black hover:bg-black hover:text-white transition-all duration-300 uppercase tracking-widest text-[11px]"
                >
                    작품 구매 문의
                </button>
                <button
                    onClick={() => openModal('rental')}
                    className="py-4 bg-black text-white hover:bg-gray-800 transition-all duration-300 uppercase tracking-widest text-[11px]"
                >
                    대여 신청하기
                </button>
            </div>

            <InquiryModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
                artwork={artwork}
                defaultType={modalConfig.type}
            />
        </>
    );
};

export default InquiryButtons;
