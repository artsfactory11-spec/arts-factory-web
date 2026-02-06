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
        <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1">엄선된 작품들</span>
      </div>
      <div className="flex flex-col">
        <span className="text-4xl font-serif font-light tracking-tighter">{artistCount}+</span>
        <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1">활동 작가군</span>
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
    <section className="px-6 lg:px-12 py-40 bg-surface overflow-hidden relative">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-24 items-start">
          <div className="lg:col-span-5 lg:sticky lg:top-48 z-10">
            <span className="text-[10px] font-black tracking-[0.6em] text-accent uppercase mb-8 block">큐레이션 시리즈</span>
            <h2 className="text-7xl lg:text-9xl font-serif font-light tracking-tighter leading-[0.8] italic mb-10 text-charcoal">
              The <br /> Modern <br /> Archive
            </h2>
            <p className="text-gray-400 font-serif text-xl italic leading-relaxed max-w-sm">
              예술적 가치와 투자 가치를 동시에 지닌, 아트팩토리 전문가들이 엄선한 이달의 핵심 컬렉션입니다.
            </p>
            <div className="mt-14 w-20 h-[1px] bg-accent/30" />
          </div>

          <div className="lg:col-span-7 space-y-48 relative">
            {featured.map((item: any, i: number) => (
              <RevealSection key={item._id.toString()} delay={i * 0.2}>
                <div className={`relative group ${i % 2 !== 0 ? 'lg:ml-32' : 'lg:mr-32'}`}>
                  <div className="aspect-[4/5] overflow-hidden rounded-[40px] shadow-[0_30px_60px_rgba(0,0,0,0.08)] bg-white p-4 transition-transform duration-1000 group-hover:-translate-y-4">
                    <img src={item.firebase_image_url} alt={item.title} className="w-full h-full object-cover rounded-[30px] transition-transform duration-1000 group-hover:scale-105" />
                  </div>
                  <div className="absolute -bottom-12 -left-6 lg:left-auto lg:-right-12 bg-white/80 backdrop-blur-xl p-10 rounded-[30px] shadow-[0_20px_40px_rgba(0,0,0,0.05)] border border-white/20 max-w-xs group-hover:-translate-y-6 transition-transform duration-700">
                    <span className="text-[9px] font-black tracking-[0.3em] text-accent uppercase mb-4 block">Selection 0{i + 1}</span>
                    <h3 className="text-3xl font-serif italic mb-3 text-charcoal">{item.title}</h3>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em]">Artist. {item.artist_id?.name || 'Unknown'}</p>
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
    <section className="min-h-[90vh] py-32 bg-charcoal text-white relative overflow-hidden flex items-center">
      <ParallaxText
        text="SPOTLIGHT"
        speed={-180}
        className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none select-none overflow-hidden text-[65vw] font-black italic whitespace-nowrap -left-32 text-white"
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <RevealSection>
            <div className="relative">
              <div className="aspect-[3/4] rounded-[60px] overflow-hidden border border-white/5 p-4 bg-white/5 backdrop-blur-sm">
                <img src={artist.avatar_url || "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?q=80&w=2067&auto=format&fit=crop"} alt="Artist" className="w-full h-full object-cover rounded-[50px] grayscale-[30%] group-hover:grayscale-0 transition-all duration-1000" />
              </div>
              <div className="absolute top-12 -right-12 w-56 h-56 bg-accent rounded-full flex flex-col items-center justify-center text-charcoal shadow-[0_20px_40px_rgba(197,160,89,0.3)] rotate-12">
                <span className="text-[11px] font-black uppercase tracking-tight text-center leading-tight">Artist <br /> of the month</span>
              </div>
            </div>
          </RevealSection>

          <div className="space-y-20">
            <RevealSection delay={0.3}>
              <div className="space-y-10">
                <span className="text-[10px] font-black tracking-[0.6em] text-accent uppercase block">이달의 작가</span>
                <h2 className="text-8xl lg:text-[140px] font-serif font-light italic leading-[0.8] tracking-tighter">
                  {artist.name}
                </h2>
                <p className="text-2xl text-gray-400 font-serif italic leading-relaxed max-w-xl">
                  {artist.artist_bio || `"나의 작업은 보이지 않는 감정의 흐름을 캔버스 위에 고착시키는 과정이다."`}
                </p>
              </div>
              <div className="flex gap-12 pt-16 border-t border-white/5">
                <Link href="/artists" className="group inline-flex items-center gap-8 px-12 py-6 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white hover:text-charcoal transition-all duration-500">
                  포트폴리오 보기 <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
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
            <span className="text-[10px] font-black tracking-[0.6em] text-accent uppercase">예술적 관점</span>
            <h2 className="text-6xl font-serif font-light italic tracking-tighter">매거진 하이라이트</h2>
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
                  <Link href={`/magazine/${mag._id}`} className="inline-block text-[10px] font-black uppercase tracking-widest border-b border-black pb-2">기사 자세히 보기</Link>
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
    <main className="min-h-screen bg-surface text-charcoal grain overflow-x-hidden">
      {/* 프리미엄 히어로 섹션 */}
      <ArtHeroWrapper stats={{ artworks: 0, artists: 0 }}>
        <div className="flex items-center gap-6 mb-20 animate-in fade-in slide-in-from-bottom-6 duration-1000">
          <div className="w-16 h-[1px] bg-accent" />
          <span className="text-[10px] font-black uppercase tracking-[0.6em] text-accent">현대 미술의 정수</span>
        </div>

        <div className="flex flex-col lg:flex-row items-baseline lg:items-end justify-between gap-24">
          <div className="animate-in fade-in slide-in-from-left-12 duration-1000 cubic-bezier(0.2, 0, 0.2, 1)">
            <h1 className="text-[20vw] lg:text-[220px] font-serif font-light tracking-tighter text-charcoal leading-[0.7] shrink-0">
              Arts <br />
              <span className="italic relative">
                Factory
                <div className="absolute -bottom-6 -left-8 w-full h-[4px] bg-accent/20 animate-in slide-in-from-left duration-1200" />
              </span>
            </h1>
          </div>

          <div className="flex-1 flex flex-col gap-20 animate-in fade-in slide-in-from-bottom-12 duration-1200 cubic-bezier(0.2, 0, 0.2, 1)">
            <p className="text-gray-500 font-serif italic leading-relaxed text-4xl lg:text-5xl max-w-2xl">
              "우리는 당신의 공간에 <br className="hidden md:block" />
              숨 쉬는 예술을 제안합니다."
            </p>

            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-16">
              <Suspense fallback={<div className="h-20" />}>
                <HeroStats />
              </Suspense>

              <div className="flex flex-col gap-12 items-start md:items-end w-full md:w-auto">
                <span className="text-vertical hidden lg:block absolute -right-16 top-0 text-[10px] font-black tracking-[0.6em] text-gray-300 uppercase">
                  뮤지엄 표준 / 소장 가치
                </span>
                <Link
                  href="/gallery"
                  className="group relative inline-flex items-center gap-10 px-14 py-7 bg-charcoal text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:bg-accent transition-all duration-700 shadow-[0_20px_40px_rgba(0,0,0,0.15)] overflow-hidden"
                >
                  <span className="relative z-10">탐색 시작하기</span>
                  <ArrowUpRight className="w-5 h-5 relative z-10 group-hover:rotate-45 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-accent translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
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
                <span className="text-[10px] font-black tracking-[0.6em] text-accent uppercase mb-4 block">갤러리 둘러보기</span>
                <h2 className="text-6xl font-serif font-light tracking-tighter italic">최신 작품</h2>
              </div>
              <Link href="/gallery" className="group flex items-center gap-4 text-xs font-black uppercase tracking-widest border-b border-black pb-2">
                전체 아카이브 보기 <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
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
            { title: '아트 큐레이션', desc: '당신의 취향과 공간을 분석하여 세상에 단 하나뿐인 분위기를 제안합니다.', icon: MousePointer2 },
            { title: '렌탈 서비스', desc: '고가의 작품을 합리적인 비용으로 경험하고, 주기적으로 공간의 리듬을 바꾸세요.', icon: Heart },
            { title: '아티스트 커넥트', desc: '검증된 동시대 작가들의 원화를 가장 투명한 경로로 소장할 수 있도록 돕습니다.', icon: Star }
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
