export const dynamic = 'force-dynamic';

import { getArtists } from "@/app/actions/user";
import ArtistCard from "@/components/gallery/ArtistCard";
import { Suspense } from "react";
import Link from "next/link";

async function ArtistListContent() {
    const result = await getArtists();

    if (!result.success || !result.artists.length) {
        return (
            <div className="col-span-full py-32 text-center text-gray-300">
                <p className="text-xl font-light">등록된 작가가 없습니다.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {result.artists.map((artist: { _id: string;[key: string]: any }) => (
                <ArtistCard key={artist._id} artist={artist} />
            ))}
        </div>
    );
}

export default function ArtistsPage() {
    return (
        <main className="min-h-screen bg-white">
            {/* Premium Header */}
            <header className="pt-24 pb-12 px-6 lg:px-12 bg-[#fafafa]">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div>
                            <span className="text-[10px] font-black tracking-[0.3em] text-gray-400 uppercase mb-4 block animate-in fade-in slide-in-from-bottom-2 duration-700">
                                우리의 작가들을 만나보세요
                            </span>
                            <h1 className="text-7xl font-extralight tracking-tighter text-black mb-8 animate-in fade-in slide-in-from-bottom-3 duration-1000">
                                작가
                            </h1>
                            <p className="max-w-xl text-lg text-gray-500 font-light leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
                                아트팩토리와 함께하는 재능 있는 아티스트들을 소개합니다. <br />
                                각자의 고유한 세계관과 철학을 가진 작가들의 작품을 통해 <br />
                                당신의 공간에 새로운 영감을 더해보세요.
                            </p>
                        </div>
                        <div className="flex gap-12 text-xs font-black tracking-[0.3em] uppercase text-gray-300 animate-in fade-in slide-in-from-right-4 duration-1000 delay-500">
                            <Link href="/" className="hover:text-black transition-colors">작품</Link>
                            <Link href="/artists" className="text-black hover:text-black transition-colors">작가</Link>
                            <Link href="/magazine" className="hover:text-black transition-colors">매거진</Link>
                            <Link href="/partner" className="hover:text-black transition-colors">파트너</Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Artist Grid Section */}
            <section className="px-6 lg:px-12 py-24">
                <div className="max-w-7xl mx-auto">
                    <Suspense fallback={
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-pulse">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="aspect-[4/5] bg-gray-50 rounded-3xl" />
                            ))}
                        </div>
                    }>
                        <ArtistListContent />
                    </Suspense>
                </div>
            </section>

            {/* Partnership Call to Action */}
            <section className="bg-black text-white py-32 px-6 lg:px-12 text-center">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-4xl font-light tracking-tight mb-8">당신도 아트팩토리의 작가가 될 수 있습니다</h2>
                    <p className="text-white/60 mb-12 font-light text-lg">
                        자신의 작품을 더 많은 사람들에게 알리고 <br />
                        일상 속에 예술을 전하고 싶은 작가님들을 기다립니다.
                    </p>
                    <button className="px-10 py-5 bg-white text-black rounded-full font-bold hover:bg-gray-200 transition-all hover:scale-105 active:scale-95">
                        작가 신청하기
                    </button>
                </div>
            </section>
        </main>
    );
}
