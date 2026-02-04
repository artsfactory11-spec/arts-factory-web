export const dynamic = 'force-dynamic';

import { getMagazineById } from "@/app/actions/magazine";
import Link from "next/link";
import NextImage from "next/image";
import { Clock, Eye, ChevronLeft, Calendar, User, Share2 } from "lucide-react";
import ShareButton from "@/components/magazine/ShareButton";
import { Metadata, ResolvingMetadata } from "next";
import MagazineEditorial from "@/components/magazine/MagazineEditorial";

interface Props {
    params: { id: string };
}

export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const { id } = await params;
    const res = await getMagazineById(id);
    if (!res.success || !res.magazine) return { title: 'Magazine | Arts Factory' };

    const magazine = res.magazine;
    const previousImages = (await parent).openGraph?.images || [];

    return {
        title: `${magazine.title} | Arts Factory Magazine`,
        description: magazine.content?.replace(/<[^>]*>?/gm, '').substring(0, 160),
        openGraph: {
            title: magazine.title,
            description: magazine.content?.replace(/<[^>]*>?/gm, '').substring(0, 160),
            images: [magazine.thumbnail_url, ...previousImages],
            type: 'article',
        },
    };
}

export default async function MagazineDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const res = await getMagazineById(id);

    if (!res.success || !res.magazine) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mb-8 text-gray-200">
                    <Clock className="w-10 h-10" />
                </div>
                <h1 className="text-3xl font-black tracking-tighter mb-4 text-black">기사를 찾을 수 없습니다</h1>
                <Link href="/magazine" className="text-gray-400 hover:text-black transition-colors font-bold text-xs uppercase tracking-widest border-b border-transparent hover:border-black pb-1">
                    Back to Magazine
                </Link>
            </div>
        );
    }

    const { magazine } = res;

    // 가상의 읽기 시간 계산 (본문 텍스트 기준)
    const wordCount = magazine.content?.replace(/<[^>]*>?/gm, '').split(/\s+/).length || 0;
    const readTime = Math.ceil(wordCount / 200);

    return (
        <main className="min-h-screen bg-white">
            {/* Minimal Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 px-6 lg:px-12 py-8 flex justify-between items-center bg-white/80 backdrop-blur-md border-b border-gray-50">
                <Link href="/magazine" className="flex items-center gap-2 text-gray-400 hover:text-black transition-all font-black text-[10px] tracking-widest uppercase group">
                    <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Back to Magazine
                </Link>
                <div className="flex gap-8 text-[10px] font-black tracking-widest uppercase text-gray-300">
                    <Link href="/" className="hover:text-black transition-colors">Artworks</Link>
                    <Link href="/artists" className="hover:text-black transition-colors">Artists</Link>
                </div>
            </nav>

            {/* Article Header */}
            <header className="pt-48 pb-24 px-6 lg:px-12">
                <div className="max-w-4xl mx-auto">
                    <div className="flex flex-col items-center text-center space-y-8">
                        <div className="flex items-center gap-4">
                            <span className="px-6 py-2 bg-black text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow-2xl shadow-black/20">
                                {magazine.category}
                            </span>
                            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                                {readTime} min read
                            </span>
                        </div>
                        <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-black leading-[0.9] lg:-ml-2">
                            {magazine.title}
                        </h1>
                        <div className="flex items-center justify-center gap-12 text-[10px] font-black uppercase tracking-[0.3em] text-gray-300 border-y border-gray-50 py-8 w-full animate-in fade-in slide-in-from-bottom-2 duration-1000 delay-400">
                            <span className="flex items-center gap-3"><Calendar className="w-4 h-4" /> {new Date(magazine.createdAt).toLocaleDateString()}</span>
                            <span className="flex items-center gap-3"><User className="w-4 h-4" /> {magazine.author || 'ARTS FACTORY'}</span>
                            <span className="flex items-center gap-3"><Eye className="w-4 h-4" /> {magazine.view_count || 0} Views</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Thumbnail */}
            <div className="px-6 lg:px-12">
                <div className="max-w-7xl mx-auto aspect-[21/9] rounded-[80px] overflow-hidden shadow-2xl shadow-black/5 bg-gray-50 border border-gray-100 relative">
                    <NextImage
                        src={magazine.thumbnail_url}
                        alt={magazine.title}
                        fill
                        className="object-cover"
                        priority
                        placeholder="blur"
                        blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
                    />
                </div>
            </div>

            {/* Content */}
            <article className="max-w-4xl mx-auto px-6 py-40">
                <MagazineEditorial content={magazine.content || ''} />

                {/* Share/Actions */}
                <div className="mt-32 pt-20 border-t border-gray-50 flex flex-col items-center gap-12 text-center">
                    <div className="space-y-4">
                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">Enjoyed this story?</p>
                        <ShareButton title={magazine.title} />
                    </div>
                    <Link
                        href="/magazine"
                        className="text-gray-400 hover:text-black transition-colors font-black text-[10px] uppercase tracking-widest border-b border-transparent hover:border-black pb-1"
                    >
                        More Stories
                    </Link>
                </div>
            </article>

        </main>
    );
}
