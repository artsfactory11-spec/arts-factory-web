import dbConnect from "@/lib/mongodb";
import Artwork from "@/models/Artwork";
import User from "@/models/User";
import Magazine from "@/models/Magazine";
import { Suspense } from "react";
import GallerySkeleton from "@/components/gallery/GallerySkeleton";
import GalleryContainer from "@/components/gallery/GalleryContainer";
import Link from "next/link";
import { ArrowUpRight, MousePointer2, Star, Heart } from 'lucide-react';
import { ArtHeroWrapper, RevealSection, ParallaxText } from "@/components/home/AnimatedHome";

// --- Data Fetching Components ---

async function HeroStats() {
  await dbConnect();
  const artworkCount = await Artwork.countDocuments({ status: 'approved' });
  const artistCount = await User.countDocuments({ role: 'partner', status: 'approved' });

  return (
    <div className="flex gap-12 mt-16">
      <div className="flex flex-col">
        <span className="text-4xl font-serif font-light tracking-tighter">{artworkCount}+</span>
        <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1">Curated Artworks</span>
      </div>
      <div className="flex flex-col">
        <span className="text-4xl font-serif font-light tracking-tighter">{artistCount}+</span>
        <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1">Active Artists</span>
      </div>
    </div>
  );
}

async function FeaturedSection() {
  await dbConnect();

  // 1. 관리자가 지정한 큐레이션 작품 조회
  let featured = await Artwork.find({ isCurated: true, status: 'approved' })
    .sort({ createdAt: -1 })
    .limit(2)
    .populate('artist_id', 'name');

  // 2. 큐레이션 작품이 부족할 경우 최신 작품으로 보완
  if (featured.length < 2) {
    const additional = await Artwork.find({ isCurated: { $ne: true }, status: 'approved' })
      .sort({ createdAt: -1 })
      .limit(2 - featured.length)
      .populate('artist_id', 'name');
    featured = [...featured, ...additional];
  }

  if (featured.length === 0) return null;

  return (
    <section className="px-6 lg:px-12 py-32 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          <div className="lg:col-span-5 lg:sticky lg:top-40">
            <span className="text-[10px] font-black tracking-[0.5em] text-accent uppercase mb-6 block">Curated Series</span>
            <h2 className="text-6xl lg:text-8xl font-serif font-light tracking-tighter leading-none italic mb-8">
              The <br /> Modern <br /> Archive
            </h2>
            <p className="text-gray-400 font-serif text-xl italic leading-relaxed max-w-sm">
              예술적 가치와 투자 가치를 동시에 지닌, 아트팩터리 전문가들이 엄선한 이달의 핵심 컬렉션입니다.
            </p>
            <div className="mt-12 w-16 h-[1px] bg-black" />
          </div>

          <div className="lg:col-span-7 space-y-32">
            {featured.map((item: any, i: number) => (
              <RevealSection key={item._id.toString()} delay={i * 0.2}>
                <div className={`relative group ${i % 2 !== 0 ? 'lg:mx-20' : ''}`}>
                  <div className="aspect-[4/5] overflow-hidden rounded-[60px] shadow-2xl">
                    <img src={item.firebase_image_url} alt={item.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                  </div>
                  <div className="absolute -bottom-10 -left-10 lg:left-auto lg:-right-10 bg-white p-12 rounded-[40px] shadow-2xl shadow-black/5 max-w-xs group-hover:-translate-y-4 transition-transform duration-500">
                    <span className="text-[9px] font-black tracking-widest text-accent uppercase mb-4 block">0{i + 1} Selection</span>
                    <h3 className="text-3xl font-serif italic mb-2">{item.title}</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Artist. {item.artist_id?.name || 'Unknown'}</p>
                  </div>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

async function ArtworkContent() {
  await dbConnect();
  const artworks = await Artwork.find({ status: 'approved' })
    .sort({ createdAt: -1 })
    .limit(8)
    .populate('artist_id', 'name');

  const formattedArtworks = JSON.parse(JSON.stringify(artworks));
  return <GalleryContainer initialArtworks={formattedArtworks} />;
}

async function ArtistSpotlight() {
  await dbConnect();

  // 1. 관리자가 지정한 스포트라이트 작가 조회
  let artist = await User.findOne({ isSpotlight: true, role: 'partner', status: 'approved' });

  // 2. 지정된 작가가 없으면 가장 최근 등록된 승인된 작가 노출
  if (!artist) {
    artist = await User.findOne({ role: 'partner', status: 'approved' }).sort({ createdAt: -1 });
  }

  if (!artist) return null;

  return (
    <section className="min-h-[85vh] py-24 bg-[#111] text-white relative overflow-hidden flex items-center">
      <ParallaxText
        text="SPOTLIGHT"
        speed={-150}
        className="absolute top-0 left-0 w-full h-full opacity-[0.05] pointer-events-none select-none overflow-hidden text-[60vw] font-black italic whitespace-nowrap -left-20"
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <RevealSection>
            <div className="relative">
              <div className="aspect-[3/4] rounded-[100px] overflow-hidden border border-white/10 p-4">
                <img src={artist.avatar_url || "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?q=80&w=2067&auto=format&fit=crop"} alt="Artist" className="w-full h-full object-cover rounded-[85px] grayscale-[20%]" />
              </div>
              <div className="absolute top-10 -right-10 w-48 h-48 bg-accent rounded-full flex flex-col items-center justify-center text-black shadow-2xl rotate-12">
                <span className="text-[10px] font-black uppercase tracking-tight text-center">Artist <br /> of the month</span>
              </div>
            </div>
          </RevealSection>

          <div className="space-y-16">
            <RevealSection delay={0.3}>
              <div className="space-y-8">
                <span className="text-[10px] font-black tracking-[0.5em] text-accent uppercase block">Featured Artist</span>
                <h2 className="text-8xl lg:text-[120px] font-serif font-light italic leading-none tracking-tighter">
                  {artist.name}
                </h2>
                <p className="text-2xl text-gray-400 font-serif italic leading-relaxed max-w-xl">
                  {artist.artist_bio || `"나의 작업은 보이지 않는 감정의 흐름을 캔버스 위에 고착시키는 과정이다."`}
                </p>
              </div>
              <div className="flex gap-12 pt-12 border-t border-white/10">
                <Link href="/artists" className="group inline-flex items-center gap-6 px-10 py-5 border border-white/20 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                  View Portfolio <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </RevealSection>
          </div>
        </div>
      </div>
    </section>
  );
}

async function MagazineSection() {
  await dbConnect();

  // 1. 관리자가 지정한 홈 노출 기사 조회
  let highlights = await Magazine.find({ isFeatured: true, is_published: true })
    .sort({ createdAt: -1 })
    .limit(2);

  // 2. 부족할 경우 최신 기사로 보완
  if (highlights.length < 2) {
    const additional = await Magazine.find({ isFeatured: { $ne: true }, is_published: true })
      .sort({ createdAt: -1 })
      .limit(2 - highlights.length);
    highlights = [...highlights, ...additional];
  }

  if (highlights.length === 0) return null;

  return (
    <section className="px-6 lg:px-12 py-32 bg-white">
      <div className="max-w-7xl mx-auto">
        <RevealSection>
          <div className="flex flex-col items-center text-center mb-24 space-y-6">
            <span className="text-[10px] font-black tracking-[0.5em] text-accent uppercase">Artistic Perspective</span>
            <h2 className="text-6xl font-serif font-light italic tracking-tighter">Magazine Highlights</h2>
          </div>
        </RevealSection>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
          {highlights.map((mag: any, i: number) => (
            <RevealSection key={mag._id.toString()} delay={i * 0.2}>
              <div className={`group space-y-12 ${i % 2 !== 0 ? 'lg:mt-40' : ''}`}>
                <div className="aspect-[4/3] bg-gray-50 rounded-[60px] overflow-hidden relative shadow-lg">
                  <img src={mag.thumbnail_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                  <div className="absolute top-10 left-10">
                    <span className="px-6 py-2 bg-white/90 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-[0.2em]">{mag.category}</span>
                  </div>
                </div>
                <div className="space-y-6">
                  <h3 className="text-4xl font-serif italic leading-tight group-hover:text-accent transition-colors">{mag.title}</h3>
                  <p className="text-gray-400 font-serif italic text-lg leading-relaxed line-clamp-2">
                    {mag.content.replace(/<[^>]*>/g, '').substring(0, 100)}...
                  </p>
                  <Link href={`/magazine/${mag._id}`} className="inline-block text-[10px] font-black uppercase tracking-widest border-b border-black pb-2">Read Story</Link>
                </div>
              </div>
            </RevealSection>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-black grain overflow-x-hidden">
      {/* 프리미엄 히어로 섹션 */}
      <ArtHeroWrapper stats={{ artworks: 0, artists: 0 }}>
        <div className="flex items-center gap-4 mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="w-12 h-[1px] bg-black" />
          <span className="text-[10px] font-black uppercase tracking-[0.5em]">The Essence of Contemporary Art</span>
        </div>

        <div className="flex flex-col lg:flex-row items-baseline lg:items-end justify-between gap-20">
          <div className="animate-in fade-in slide-in-from-left-8 duration-1000">
            <h1 className="text-[18vw] lg:text-[180px] font-serif font-light tracking-tighter text-black leading-[0.75] shrink-0">
              Arts <br />
              <span className="italic relative">
                Factory
                <div className="absolute -bottom-4 -left-4 w-full h-[2px] bg-accent/20 animate-in slide-in-from-left duration-1000" />
              </span>
            </h1>
          </div>

          <div className="flex-1 flex flex-col gap-16 animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <p className="text-gray-500 font-serif italic leading-relaxed text-3xl lg:text-4xl max-w-2xl">
              "우리는 당신의 공간에 <br className="hidden md:block" />
              숨 쉬는 예술을 제안합니다."
            </p>

            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-12">
              <Suspense fallback={<div className="h-20" />}>
                <HeroStats />
              </Suspense>

              <div className="flex flex-col gap-10 items-start md:items-end w-full md:w-auto">
                <span className="text-vertical hidden lg:block absolute -right-12 top-0 text-[10px] font-black tracking-[0.5em] text-gray-300 uppercase">
                  Museum Standard / Ownership
                </span>
                <Link
                  href="/gallery"
                  className="group relative inline-flex items-center gap-8 px-12 py-6 bg-black text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-black/90 transition-all duration-500 shadow-2xl shadow-black/30 overflow-hidden"
                >
                  <span className="relative z-10">Start Exploring</span>
                  <ArrowUpRight className="w-5 h-5 relative z-10 group-hover:rotate-45 transition-transform duration-500" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </ArtHeroWrapper>

      {/* Featured Collection */}
      <Suspense fallback={<div className="h-screen bg-white" />}>
        <FeaturedSection />
      </Suspense>

      {/* 최근 작품 섹션 */}
      <section className="px-6 lg:px-12 py-24 border-t border-gray-50 bg-white">
        <div className="max-w-7xl mx-auto">
          <RevealSection>
            <div className="mb-20 flex flex-col lg:flex-row justify-between items-end gap-12">
              <div>
                <span className="text-[10px] font-black tracking-[0.5em] text-accent uppercase mb-4 block">Explore our gallery</span>
                <h2 className="text-6xl font-serif font-light tracking-tighter italic">Recent Works</h2>
              </div>
              <Link href="/gallery" className="group flex items-center gap-4 text-xs font-black uppercase tracking-widest border-b border-black pb-2">
                View All Archive <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Link>
            </div>
          </RevealSection>

          <Suspense fallback={<GallerySkeleton />}>
            <ArtworkContent />
          </Suspense>
        </div>
      </section>

      {/* Artist Spotlight */}
      <Suspense fallback={<div className="h-[85vh] bg-[#111]" />}>
        <ArtistSpotlight />
      </Suspense>

      {/* Magazine Preview */}
      <Suspense fallback={<div className="h-[80vh] bg-white" />}>
        <MagazineSection />
      </Suspense>

      {/* Service Guide */}
      <section className="py-32 px-6 lg:px-12 bg-surface">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16">
          {[
            { title: 'Art Curation', desc: '당신의 취향과 공간을 분석하여 세상에 단 하나뿐인 분위기를 제안합니다.', icon: MousePointer2 },
            { title: 'Rental Service', desc: '고가의 작품을 합리적인 비용으로 경험하고, 주기적으로 공간의 리듬을 바꾸세요.', icon: Heart },
            { title: 'Artist Connect', desc: '검증된 동시대 작가들의 원화를 가장 투명한 경로로 소장할 수 있도록 돕습니다.', icon: Star }
          ].map((item, i) => (
            <RevealSection key={i} delay={i * 0.1}>
              <div className="p-16 bg-white rounded-[80px] border border-gray-100 shadow-sm transition-all duration-500 hover:shadow-2xl hover:-translate-y-4">
                <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mb-10 text-accent">
                  <item.icon className="w-10 h-10" />
                </div>
                <h4 className="text-3xl font-serif italic mb-6">{item.title}</h4>
                <p className="text-gray-400 font-serif italic text-lg leading-relaxed">{item.desc}</p>
              </div>
            </RevealSection>
          ))}
        </div>
      </section>
    </main>
  );
}
