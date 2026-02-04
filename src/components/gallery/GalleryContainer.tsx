'use client';

import { useState, useEffect, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
import GalleryItem from './GalleryItem';
import { getArtworks } from '@/app/actions/gallery';
import { Loader2, Search, RotateCcw, X } from 'lucide-react';

export default function GalleryContainer({ initialArtworks }: { initialArtworks: any[] }) {
    const [artworks, setArtworks] = useState(initialArtworks);
    const [cursor, setCursor] = useState(initialArtworks.length > 0 ? initialArtworks[initialArtworks.length - 1]._id : '');
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(initialArtworks.length === 12);
    const [filter, setFilter] = useState({
        category: 'All',
        season: 'All',
        space: 'All',
        price_range: 'All',
        size: 'All'
    });

    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    const { ref, inView } = useInView({
        threshold: 0,
    });

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const loadMore = useCallback(async () => {
        if (loading || !hasMore) return;
        setLoading(true);
        const res = await getArtworks({ cursor, filter, search: debouncedSearch });

        if (res.success) {
            if (res.artworks.length < 12) setHasMore(false);
            else setHasMore(true);

            setArtworks(prev => [...prev, ...res.artworks]);
            if (res.nextCursor) setCursor(res.nextCursor);
        }
        setLoading(false);
    }, [cursor, loading, hasMore, filter, debouncedSearch]);

    useEffect(() => {
        if (inView) {
            loadMore();
        }
    }, [inView, loadMore]);

    // 검색어 또는 필터 변경 시 초기화 로드
    useEffect(() => {
        const resetAndFetch = async () => {
            setLoading(true);
            const res = await getArtworks({ cursor: '', filter, search: debouncedSearch });
            if (res.success) {
                setArtworks(res.artworks);
                setHasMore(res.artworks.length === 12);
                setCursor(res.artworks.length > 0 ? res.artworks[res.artworks.length - 1]._id : '');
            }
            setLoading(false);
        };
        resetAndFetch();
    }, [filter, debouncedSearch]);

    const handleFilterChange = (newFilter: any) => {
        setFilter(prev => ({ ...prev, ...newFilter }));
    };

    const resetFilters = () => {
        setFilter({
            category: 'All',
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
                        type="text"
                        placeholder="작품명 또는 작가명을 검색해보세요..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-16 pr-6 py-5 bg-gray-50 border-none rounded-[30px] text-lg font-serif italic focus:ring-2 focus:ring-black/5 focus:bg-white transition-all outline-none placeholder:text-gray-300"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            className="absolute right-6 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="w-4 h-4 text-gray-400" />
                        </button>
                    )}
                </div>

                {/* 필터 바 */}
                <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md py-6 border-b border-gray-50 flex gap-8 overflow-x-auto no-scrollbar items-center justify-between">
                    <div className="flex gap-8 items-center">
                        <div className="flex items-center gap-2 min-w-fit">
                            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">종류</span>
                            <select
                                value={filter.category}
                                onChange={(e) => handleFilterChange({ category: e.target.value })}
                                className="text-sm border-none bg-transparent font-bold focus:ring-0 cursor-pointer p-0"
                            >
                                <option value="All">전체 작품</option>
                                <option value="회화">회화</option>
                                <option value="사진">사진</option>
                                <option value="조각">조각</option>
                                <option value="디지털 아트">디지털 아트</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2 min-w-fit border-l border-gray-100 pl-8">
                            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">계절</span>
                            <select
                                value={filter.season}
                                onChange={(e) => handleFilterChange({ season: e.target.value })}
                                className="text-sm border-none bg-transparent font-bold focus:ring-0 cursor-pointer p-0 text-gray-400 hover:text-black transition-colors outline-none"
                            >
                                <option value="All">모든 계절</option>
                                <option value="봄">봄</option>
                                <option value="여름">여름</option>
                                <option value="가을">가을</option>
                                <option value="겨울">겨울</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2 min-w-fit border-l border-gray-100 pl-8">
                            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">공간</span>
                            <select
                                value={filter.space}
                                onChange={(e) => handleFilterChange({ space: e.target.value })}
                                className="text-sm border-none bg-transparent font-bold focus:ring-0 cursor-pointer p-0 text-gray-400 hover:text-black transition-colors outline-none"
                            >
                                <option value="All">모든 공간</option>
                                <option value="거실">거실</option>
                                <option value="침실">침실</option>
                                <option value="서재/오피스">서재/오피스</option>
                                <option value="현관/복도">현관/복도</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2 min-w-fit border-l border-gray-100 pl-8">
                            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">가격</span>
                            <select
                                value={filter.price_range}
                                onChange={(e) => handleFilterChange({ price_range: e.target.value })}
                                className="text-sm border-none bg-transparent font-bold focus:ring-0 cursor-pointer p-0 text-gray-400 hover:text-black transition-colors outline-none"
                            >
                                <option value="All">모든 가격</option>
                                <option value="0-1000000">100만원 이하</option>
                                <option value="1000000-5000000">100만 - 500만원</option>
                                <option value="5000000-10000000">500만 - 1000만원</option>
                                <option value="10000000">1000만원 이상</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2 min-w-fit border-l border-gray-100 pl-8">
                            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">크기</span>
                            <select
                                value={filter.size}
                                onChange={(e) => handleFilterChange({ size: e.target.value })}
                                className="text-sm border-none bg-transparent font-bold focus:ring-0 cursor-pointer p-0 text-gray-400 hover:text-black transition-colors outline-none"
                            >
                                <option value="All">모든 크기</option>
                                <option value="S">Small (10호 이하)</option>
                                <option value="M">Medium (11-30호)</option>
                                <option value="L">Large (31-60호)</option>
                                <option value="XL">Extra Large (61호 이상)</option>
                            </select>
                        </div>
                    </div>

                    <button
                        onClick={resetFilters}
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-accent hover:text-black px-4 py-2 bg-gray-50 rounded-full transition-all active:scale-95"
                    >
                        Reset Filter
                        <RotateCcw className="w-3 h-3" />
                    </button>
                </div>
            </div>


            {/* 그리드 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
                {artworks.map((art) => (
                    <GalleryItem key={art._id} artwork={{
                        ...art,
                        artist_name: art.artist_id?.name || '작가 미상'
                    }} />
                ))}
            </div>

            {/* 추가 로드 인디케이터 */}
            {hasMore && (
                <div ref={ref} className="py-20 flex justify-center">
                    {loading && <Loader2 className="animate-spin text-black opacity-20" size={24} />}
                </div>
            )}

            {artworks.length === 0 && !loading && (
                <div className="py-40 text-center">
                    <p className="text-gray-400 font-light italic">검색 조건에 맞는 작품이 없습니다.</p>
                </div>
            )}
        </div>
    );
}
