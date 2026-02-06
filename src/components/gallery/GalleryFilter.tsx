'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, X } from 'lucide-react';

function useDebouncedValue(value: string, delay: number) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

export default function GalleryFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // State from URL
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
    const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
    const [category, setCategory] = useState(searchParams.get('category') || 'all');
    const [showFilters, setShowFilters] = useState(false);

    const debouncedSearch = useDebouncedValue(search, 500);

    // Update URL on change
    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());

        if (debouncedSearch) params.set('search', debouncedSearch);
        else params.delete('search');

        if (minPrice) params.set('minPrice', minPrice);
        else params.delete('minPrice');

        if (maxPrice) params.set('maxPrice', maxPrice);
        else params.delete('maxPrice');

        if (category && category !== 'all') params.set('category', category);
        else params.delete('category');

        const newQueryString = params.toString();
        const currentQueryString = searchParams.toString();

        // Only push if something changed to prevent infinite loops
        if (newQueryString !== currentQueryString) {
            router.push(`/gallery?${newQueryString}`);
        }
    }, [debouncedSearch, minPrice, maxPrice, category, router, searchParams]);

    return (
        <div className="mb-12 space-y-4">
            {/* Search Bar */}
            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search artworks..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-black rounded-full py-3 pl-12 pr-6 transition-all outline-none"
                    />
                </div>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`px-6 flex items-center gap-2 rounded-full font-bold text-sm transition-colors border ${showFilters ? 'bg-black text-white border-black' : 'bg-white border-gray-200 hover:border-black'}`}
                >
                    <SlidersHorizontal className="w-4 h-4" />
                    Filters
                </button>
            </div>

            {/* Expanded Filters */}
            {showFilters && (
                <div className="bg-gray-50 p-6 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
                    {/* Category */}
                    <div>
                        <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Category</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 outline-none focus:border-black"
                        >
                            <option value="all">All Categories</option>
                            <option value="Painting">Painting</option>
                            <option value="Sculpture">Sculpture</option>
                            <option value="Photography">Photography</option>
                            <option value="Digital">Digital Art</option>
                        </select>
                    </div>

                    {/* Price Range */}
                    <div className="col-span-2">
                        <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Price Range (KRW)</label>
                        <div className="flex gap-4 items-center">
                            <input
                                type="number"
                                placeholder="Min"
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 outline-none focus:border-black"
                            />
                            <span className="text-gray-400">-</span>
                            <input
                                type="number"
                                placeholder="Max"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 outline-none focus:border-black"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Active Filters Tags */}
            {(category !== 'all' || minPrice || maxPrice) && (
                <div className="flex gap-2 flex-wrap">
                    {category !== 'all' && (
                        <button onClick={() => setCategory('all')} className="flex items-center gap-1 px-3 py-1 bg-black text-white text-xs rounded-full">
                            {category} <X size={12} />
                        </button>
                    )}
                    {minPrice && (
                        <button onClick={() => setMinPrice('')} className="flex items-center gap-1 px-3 py-1 bg-black text-white text-xs rounded-full">
                            Min: {minPrice} <X size={12} />
                        </button>
                    )}
                    {maxPrice && (
                        <button onClick={() => setMaxPrice('')} className="flex items-center gap-1 px-3 py-1 bg-black text-white text-xs rounded-full">
                            Max: {maxPrice} <X size={12} />
                        </button>
                    )}
                    <button onClick={() => {
                        setCategory('all');
                        setMinPrice('');
                        setMaxPrice('');
                        setSearch('');
                    }} className="text-xs text-gray-500 underline ml-2">
                        Clear All
                    </button>
                </div>
            )}
        </div>
    );
}
