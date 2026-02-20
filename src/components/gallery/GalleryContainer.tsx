'use client';

import { useState, useEffect } from 'react';
import GalleryItem from './GalleryItem';
import { getArtworks } from '@/app/actions/gallery';
import { Loader2, Search, RotateCcw, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { GENRES, STYLES, SUBJECTS, SPACES, SEASONS } from '@/lib/constants';
import { useRouter, useSearchParams } from 'next/navigation';

interface IGalleryArtwork {
    _id: string;
    title: string;
    artist_id?: {
        _id: string;
        name: string;
    };
    firebase_image_url: string;
    category: string;
    season: string;
    space: string;
    size: string;
    price: number;
}

interface IGalleryFilter {
    category: string;
    style: string;
    subject: string;
    season: string;
    space: string;
    price_range: string;
    size: string;
}

export default function GalleryContainer({
    initialArtworks,
    initialPagination
}: {
    initialArtworks: IGalleryArtwork[],
    initialPagination: {
        currentPage: number;
        totalPages: number;
        totalCount: number;
        hasMore: boolean;
    }
}) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [artworks, setArtworks] = useState(initialArtworks);
    const [pagination, setPagination] = useState(initialPagination);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState<IGalleryFilter>({
        category: 'All',
        style: 'All',
        subject: 'All',
        season: 'All',
        space: 'All',
        price_range: 'All',
        size: 'All'
    });

    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    // 검색어 또는 필터 변경 시 초기화 로드
    useEffect(() => {
        const fetchItems = async () => {
            setLoading(true);
            const page = parseInt(searchParams.get('page') || '1');
            const res = await getArtworks({ page, limit: 20, filter, search: debouncedSearch });
            if (res.success) {
                setArtworks(res.artworks);
                if (res.pagination) setPagination(res.pagination);
            }
            setLoading(false);
        };
        fetchItems();
    }, [filter, debouncedSearch, searchParams]);

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', newPage.toString());
        router.push(`/gallery?${params.toString()}`, { scroll: true });
    };

    const handleFilterChange = (newFilter: Partial<IGalleryFilter>) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', '1'); // 필터 변경 시 1페이지로 리셋
        // URL 업데이트는 GalleryContainer의 useEffect(resetAndFetch)에서 처리하도록 할 수도 있지만
        // 여기서는 상태만 변경하고 useEffect가 감지하게 함
        setFilter(prev => ({ ...prev, ...newFilter }));

        // URL에 필터 상태 반영 (선택 사항: 현재는 internal state로 관리 중)
    };

    const resetFilters = () => {
        setFilter({
            category: 'All',
            style: 'All',
            subject: 'All',
            season: 'All',
            space: 'All',
            price_range: 'All',
            size: 'All'
        });
        setSearch('');
    };

    return (
        <div className="space-y-12">
            {/* 검색 바 및 필터 바 헤더 */}
            <div className="flex flex-col gap-8">
                <div className="relative group max-w-2xl">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-black transition-colors" />
                    <input
                        id="gallery-search"
                        type="text"
                        placeholder="작품명 또는 작가명을 검색해보세요..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-16 pr-6 py-5 bg-gray-50 border-none rounded-[30px] text-lg font-serif italic focus:ring-2 focus:ring-black/5 focus:bg-white transition-all outline-none placeholder:text-gray-300"
                        title="작품 검색"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            className="absolute right-6 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                            title="검색어 초기화"
                        >
                            <X className="w-4 h-4 text-gray-400" />
                        </button>
                    )}
                </div>

                {/* 필터 바 */}
                <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl py-6 border-b border-gray-100 flex flex-wrap gap-y-4 items-center justify-between">
                    <div className="flex flex-wrap gap-x-8 gap-y-4 items-center">
                        {/* 1. 장르 */}
                        <div className="flex items-center gap-2 group cursor-pointer">
                            <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest group-hover:text-black transition-colors">장르</span>
                            <select
                                value={filter.category}
                                onChange={(e) => handleFilterChange({ category: e.target.value })}
                                className="text-xs border-none bg-transparent font-black focus:ring-0 cursor-pointer p-0 hover:text-blue-500 transition-colors"
                                title="장르 선택"
                            >
                                <option value="All">전체</option>
                                {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>

                        {/* 2. 스타일 */}
                        <div className="flex items-center gap-2 group cursor-pointer border-l border-gray-100 pl-8">
                            <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest group-hover:text-black transition-colors">스타일</span>
                            <select
                                value={filter.style}
                                onChange={(e) => handleFilterChange({ style: e.target.value })}
                                className="text-xs border-none bg-transparent font-black focus:ring-0 cursor-pointer p-0 hover:text-blue-500 transition-colors"
                                title="스타일 선택"
                            >
                                <option value="All">전체</option>
                                {STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>

                        {/* 3. 주제 */}
                        <div className="flex items-center gap-2 group cursor-pointer border-l border-gray-100 pl-8">
                            <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest group-hover:text-black transition-colors">주제</span>
                            <select
                                value={filter.subject}
                                onChange={(e) => handleFilterChange({ subject: e.target.value })}
                                className="text-xs border-none bg-transparent font-black focus:ring-0 cursor-pointer p-0 hover:text-blue-500 transition-colors"
                                title="주제 선택"
                            >
                                <option value="All">전체</option>
                                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>

                        {/* 4. 공간 */}
                        <div className="flex items-center gap-2 group cursor-pointer border-l border-gray-100 pl-8">
                            <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest group-hover:text-black transition-colors">공간</span>
                            <select
                                value={filter.space}
                                onChange={(e) => handleFilterChange({ space: e.target.value })}
                                className="text-xs border-none bg-transparent font-black focus:ring-0 cursor-pointer p-0 hover:text-blue-500 transition-colors"
                                title="공간 선택"
                            >
                                <option value="All">전체</option>
                                {SPACES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>

                        {/* 5. 계절 */}
                        <div className="flex items-center gap-2 group cursor-pointer border-l border-gray-100 pl-8">
                            <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest group-hover:text-black transition-colors">계절</span>
                            <select
                                value={filter.season}
                                onChange={(e) => handleFilterChange({ season: e.target.value })}
                                className="text-xs border-none bg-transparent font-black focus:ring-0 cursor-pointer p-0 hover:text-blue-500 transition-colors"
                                title="계절 선택"
                            >
                                <option value="All">전체</option>
                                {SEASONS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>

                        {/* 6. 가격 */}
                        <div className="flex items-center gap-2 group cursor-pointer border-l border-gray-100 pl-8">
                            <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest group-hover:text-black transition-colors">가격</span>
                            <select
                                value={filter.price_range}
                                onChange={(e) => handleFilterChange({ price_range: e.target.value })}
                                className="text-xs border-none bg-transparent font-black focus:ring-0 cursor-pointer p-0 hover:text-blue-500 transition-colors"
                                title="가격 선택"
                            >
                                <option value="All">전체</option>
                                <option value="0-1000000">100만원 이하</option>
                                <option value="1000000-5000000">100만 - 500만원</option>
                                <option value="5000000-10000000">500만 - 1000만원</option>
                                <option value="10000000">1000만원 이상</option>
                            </select>
                        </div>

                        {/* 7. 크기 */}
                        <div className="flex items-center gap-2 group cursor-pointer border-l border-gray-100 pl-8">
                            <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest group-hover:text-black transition-colors">크기</span>
                            <select
                                value={filter.size}
                                onChange={(e) => handleFilterChange({ size: e.target.value })}
                                className="text-xs border-none bg-transparent font-black focus:ring-0 cursor-pointer p-0 hover:text-blue-500 transition-colors"
                                title="크기 선택"
                            >
                                <option value="All">전체</option>
                                <option value="S">Small (~10호)</option>
                                <option value="M">Medium (11~30호)</option>
                                <option value="L">Large (31~60호)</option>
                                <option value="XL">X-Large (61호~)</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={resetFilters}
                            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
                        >
                            Reset
                            <RotateCcw className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            </div>

            {/* 활동 필터 태그 */}
            {Object.entries(filter).some(([key, v]) => key !== 'artist_id' && v !== 'All') && (
                <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-[10px] font-black uppercase text-gray-300 mr-2">활동 필터</span>
                    {Object.entries(filter).map(([key, value]) => {
                        if (value === 'All') return null;
                        let displayValue = value;
                        if (key === 'price_range') {
                            if (value === '0-1000000') displayValue = '100만원 이하';
                            else if (value === '1000000-5000000') displayValue = '100만-500만';
                            else if (value === '5000000-10000000') displayValue = '500만-1000만';
                            else if (value === '10000000') displayValue = '1000만원 이상';
                        }
                        if (key === 'size') {
                            if (value === 'S') displayValue = 'Small (~10호)';
                            else if (value === 'M') displayValue = 'Medium (11~30호)';
                            else if (value === 'L') displayValue = 'Large (31~60호)';
                            else if (value === 'XL') displayValue = 'X-Large (61호~)';
                        }

                        return (
                            <button
                                key={key}
                                onClick={() => handleFilterChange({ [key]: 'All' })}
                                className="flex items-center gap-1.5 px-4 py-1.5 bg-gray-50 hover:bg-black hover:text-white rounded-full text-[11px] font-bold transition-all text-gray-500"
                            >
                                {displayValue}
                                <X size={12} />
                            </button>
                        );
                    })}
                    <button
                        onClick={resetFilters}
                        className="text-[10px] font-black uppercase text-accent hover:underline ml-2"
                    >
                        Clear All
                    </button>
                </div>
            )}


            {/* 그리드 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
                {artworks.map((art) => (
                    <GalleryItem key={art._id} artwork={{
                        ...art,
                        artist_name: art.artist_id?.name || '작가 미상'
                    }} />
                ))}
            </div>

            {/* 페이지네이션 */}
            {!loading && pagination.totalPages > 1 && (
                <div className="py-20 flex justify-center items-center gap-2">
                    <button
                        onClick={() => handlePageChange(Math.max(1, pagination.currentPage - 1))}
                        disabled={pagination.currentPage === 1}
                        className="p-3 rounded-full hover:bg-gray-100 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                        title="이전 페이지"
                    >
                        <ChevronLeft size={20} />
                    </button>

                    <div className="flex items-center gap-1 mx-4">
                        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => {
                            // 현재 페이지 주변 5개만 표시 (간소화된 로직)
                            if (
                                p === 1 ||
                                p === pagination.totalPages ||
                                (p >= pagination.currentPage - 2 && p <= pagination.currentPage + 2)
                            ) {
                                return (
                                    <button
                                        key={p}
                                        onClick={() => handlePageChange(p)}
                                        className={`w-10 h-10 rounded-full text-sm font-black transition-all ${pagination.currentPage === p
                                            ? 'bg-black text-white'
                                            : 'text-gray-400 hover:text-black hover:bg-gray-50'
                                            }`}
                                    >
                                        {p}
                                    </button>
                                );
                            }
                            if (
                                (p === 2 && pagination.currentPage > 4) ||
                                (p === pagination.totalPages - 1 && pagination.currentPage < pagination.totalPages - 3)
                            ) {
                                return <span key={p} className="text-gray-300 px-1">...</span>;
                            }
                            return null;
                        })}
                    </div>

                    <button
                        onClick={() => handlePageChange(Math.min(pagination.totalPages, pagination.currentPage + 1))}
                        disabled={!pagination.hasMore}
                        className="p-3 rounded-full hover:bg-gray-100 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                        title="다음 페이지"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            )}

            {loading && (
                <div className="py-40 flex justify-center">
                    <Loader2 className="animate-spin text-black opacity-20" size={32} />
                </div>
            )}
        </div>
    );
}
