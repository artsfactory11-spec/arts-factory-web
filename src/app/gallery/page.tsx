import dbConnect from "@/lib/mongodb";
import { getArtworks } from "@/app/actions/gallery";
import GalleryContainer from "@/components/gallery/GalleryContainer";

export const dynamic = 'force-dynamic';

interface Props {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function GalleryPage({ searchParams }: Props) {
    await dbConnect(); // ensure DB connection

    const resolvedSearchParams = await searchParams;

    // Parse search params
    const category = typeof resolvedSearchParams.category === 'string' ? resolvedSearchParams.category : 'all';
    const minPrice = typeof resolvedSearchParams.minPrice === 'string' ? parseInt(resolvedSearchParams.minPrice) : undefined;
    const maxPrice = typeof resolvedSearchParams.maxPrice === 'string' ? parseInt(resolvedSearchParams.maxPrice) : undefined;
    const search = typeof resolvedSearchParams.search === 'string' ? resolvedSearchParams.search : undefined;
    const page = typeof resolvedSearchParams.page === 'string' ? parseInt(resolvedSearchParams.page) : 1;

    const res = await getArtworks({
        page,
        limit: 20,
        filter: {
            category: category !== 'all' ? category : undefined,
            price_range: (minPrice !== undefined || maxPrice !== undefined) ? `${minPrice || 0}-${maxPrice || ''}` : undefined
        },
        search
    });

    const artworks = res.success ? res.artworks : [];
    const pagination = res.pagination || { currentPage: 1, totalPages: 1, totalCount: 0, hasMore: false };

    return (
        <main className="min-h-screen bg-white pt-20 pb-20">
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
                <header className="mb-12">
                    <span className="text-[10px] font-black tracking-[0.5em] text-accent uppercase mb-4 block">아카이브</span>
                    <h1 className="text-6xl font-serif font-light tracking-tight italic">전체 컬렉션</h1>
                    <p className="text-gray-400 mt-6 text-lg font-serif italic max-w-xl">
                        &quot;아트팩토리가 큐레이션한 모든 작품들을 한자리에서 만나보세요.&quot;
                    </p>
                </header>

                <GalleryContainer initialArtworks={artworks} initialPagination={pagination} />
            </div>
        </main>
    );
}
