'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface CompareArtwork {
    _id: string;
    title: string;
    artist_name: string;
    firebase_image_url: string;
    category: string;
    price: number;
    rental_price?: number;
    size?: string;
    material?: string;
}

interface CompareContextType {
    compareList: CompareArtwork[];
    addToCompare: (artwork: CompareArtwork) => void;
    removeFromCompare: (id: string) => void;
    clearCompare: () => void;
    isInCompare: (id: string) => boolean;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: React.ReactNode }) {
    const [compareList, setCompareList] = useState<CompareArtwork[]>([]);

    const addToCompare = (artwork: CompareArtwork) => {
        if (compareList.length >= 4) {
            alert('최대 4개의 작품까지만 비교 가능합니다.');
            return;
        }
        if (!compareList.find(item => item._id === artwork._id)) {
            setCompareList(prev => [...prev, artwork]);
        }
    };

    const removeFromCompare = (id: string) => {
        setCompareList(prev => prev.filter(item => item._id !== id));
    };

    const clearCompare = () => {
        setCompareList([]);
    };

    const isInCompare = (id: string) => {
        return compareList.some(item => item._id === id);
    };

    return (
        <CompareContext.Provider value={{ compareList, addToCompare, removeFromCompare, clearCompare, isInCompare }}>
            {children}
        </CompareContext.Provider>
    );
}

export function useCompare() {
    const context = useContext(CompareContext);
    if (context === undefined) {
        throw new Error('useCompare must be used within a CompareProvider');
    }
    return context;
}
