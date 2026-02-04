import Link from "next/link";
import { ArrowUpRight, Sparkles, Heart, ShieldCheck } from "lucide-react";

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="pt-60 pb-40 px-6 lg:px-12 bg-surface overflow-hidden relative">
                <div className="absolute top-0 right-0 w-2/3 h-full -z-0">
                    <div className="absolute inset-0 bg-gradient-to-l from-gray-50/80 to-transparent" />
                    <div className="absolute top-20 right-20 w-80 h-[1px] bg-black/5 -rotate-45" />
                    <div className="absolute bottom-40 right-60 w-[500px] h-[500px] rounded-full border border-black/[0.02]" />
                </div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <span className="text-[10px] font-black tracking-[0.5em] text-accent uppercase mb-8 block">Our Story</span>
                    <h1 className="text-[12vw] lg:text-[140px] font-serif font-light tracking-tighter leading-[0.8] italic mb-12">
                        Arts <br /> Factory
                    </h1>
                    <p className="text-gray-500 font-serif text-2xl lg:text-4xl italic max-w-4xl leading-relaxed">
                        "우리는 예술이 특정 계층의 전유물이 아닌, <br className="hidden md:block" />
                        모든 이의 일상 속에 자연스럽게 스며드는 세상을 꿈꿉니다."
                    </p>
                </div>
            </section>

            {/* Philosophy Section */}
            <section className="py-40 px-6 lg:px-12">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
                    <div className="space-y-12">
                        <div className="space-y-6">
                            <h2 className="text-[10px] font-black tracking-[0.4em] text-gray-400 uppercase">Philosophy</h2>
                            <h3 className="text-5xl font-serif font-light tracking-tight italic">Beyond the Frame</h3>
                            <p className="text-xl font-serif italic text-gray-600 leading-loose">
                                예술공장은 동시대의 유망한 작가들과 대중을 잇는 가장 건강한 통로입니다.
                                단순한 작품 거래를 넘어, 작가의 철학이 당신의 공간에서 새로운 이야기를 만들어낼 수 있도록
                                전문적인 큐레이션과 혁신적인 렌탈 시스템을 제공합니다.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-12 pt-12 border-t border-gray-100">
                            <div>
                                <span className="text-3xl font-serif font-light italic text-accent">Curated</span>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-2">Selection Spirit</p>
                            </div>
                            <div>
                                <span className="text-3xl font-serif font-light italic text-accent">Healthy</span>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-2">Art Ecosystem</p>
                            </div>
                        </div>
                    </div>
                    <div className="aspect-square bg-gray-50 rounded-[80px] overflow-hidden relative shadow-2xl shadow-black/5">
                        <img
                            src="https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?q=80&w=2067&auto=format&fit=crop"
                            alt="Gallery space"
                            className="w-full h-full object-cover grayscale-[20%]"
                        />
                    </div>
                </div>
            </section>

            {/* Value Section */}
            <section className="py-40 bg-black text-white px-6 lg:px-12">
                <div className="max-w-7xl mx-auto space-y-32">
                    <div className="text-center max-w-3xl mx-auto space-y-8">
                        <span className="text-[10px] font-black tracking-[0.5em] text-accent uppercase">Core Values</span>
                        <h2 className="text-5xl md:text-7xl font-serif font-light tracking-tight italic">Connecting Hearts through Art</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                        <div className="space-y-8 text-center">
                            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto">
                                <Sparkles className="w-8 h-8 text-accent" />
                            </div>
                            <h4 className="text-2xl font-serif font-light italic">Authenticity</h4>
                            <p className="text-gray-400 text-sm leading-relaxed font-serif italic text-lg">
                                작가의 진심이 담긴 원작만을 취급하며, 모든 작품의 진위와 가치를 보증합니다.
                            </p>
                        </div>
                        <div className="space-y-8 text-center">
                            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto">
                                <Heart className="w-8 h-8 text-accent" />
                            </div>
                            <h4 className="text-2xl font-serif font-light italic">Accessibility</h4>
                            <p className="text-gray-400 text-sm leading-relaxed font-serif italic text-lg">
                                합리적인 렌탈 시스템을 통해 예술적 경험의 문턱을 낮추고 대중화를 선도합니다.
                            </p>
                        </div>
                        <div className="space-y-8 text-center">
                            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto">
                                <ShieldCheck className="w-8 h-8 text-accent" />
                            </div>
                            <h4 className="text-2xl font-serif font-light italic">Trust</h4>
                            <p className="text-gray-400 text-sm leading-relaxed font-serif italic text-lg">
                                투명한 사후 관리와 전문적인 컨설팅으로 소장 그 이상의 만족감을 약속합니다.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-40 text-center px-6">
                <div className="max-w-4xl mx-auto space-y-12">
                    <h2 className="text-4xl md:text-6xl font-serif font-light tracking-tight italic">
                        정적이었던 당신의 공간에 <br />
                        새로운 숨결을 불어넣으세요.
                    </h2>
                    <Link
                        href="/gallery"
                        className="inline-flex items-center gap-6 px-12 py-6 bg-black text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-black/90 transition-all duration-500 shadow-2xl shadow-black/20 group"
                    >
                        Exploring Collection
                        <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </Link>
                </div>
            </section>
        </main>
    );
}
