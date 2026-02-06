import Link from 'next/link';
import { getSettings } from '@/app/actions/settings';
import { Instagram, Youtube, Chrome, Mail, Phone, MapPin, CreditCard, ChevronRight } from 'lucide-react';

export default async function Footer() {
    const res = await getSettings();
    const s = res.success && res.settings ? res.settings : {
        siteName: 'ARTS FACTORY',
        companyName: '(주)아츠팩토리',
        representative: '이효주',
        businessNumber: '227-13-96095',
        mailOrderNumber: '제2020-광주동구-0011호',
        address: '광주광역시 동구 문화전당로23번길 7, 2층 202호(남동)',
        phone: '062.224.0801',
        fax: '062.224.0901',
        email: 'artrental09@naver.com',
        bankName: 'IBK기업은행',
        accountNumber: '187-082975-01-013',
        accountHolder: '(예술공장)',
        operationHours: 'MON-FRI 10:00 - 18:00 / SAT 10:00 - 14:00 (LUNCH 12:00 ~ 13:00 / 주말, 공휴일 휴무)',
        snsLinks: { instagram: '', blog: '', youtube: '', kakaotalk: '' }
    };

    return (
        <footer className="bg-[#111111] text-white pt-10 pb-8 px-6 lg:px-12 mt-4">
            <div className="max-w-7xl mx-auto">
                {/* Upper Section: Compact Grid */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-8 pb-8 border-b border-white/[0.08]">
                    {/* Brand & Terms */}
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                        <h2 className="text-2xl font-serif font-light tracking-tighter italic text-white">{s.siteName}</h2>
                        <nav className="flex gap-x-5 text-[10px] font-black tracking-widest uppercase text-gray-400">
                            <Link href="/about" className="hover:text-accent transition-colors">소개</Link>
                            <Link href="/terms" className="hover:text-accent transition-colors">이용약관</Link>
                            <Link href="/privacy" className="hover:text-accent transition-colors">개인정보처리방침</Link>
                        </nav>
                    </div>

                    {/* CS & Hours - Slim */}
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-12">
                        <div className="flex items-center gap-4">
                            <div className="text-[10px] font-black tracking-[0.2em] text-accent uppercase">고객센터</div>
                            <div className="text-2xl font-serif italic text-white tracking-tight">{s.phone}</div>
                        </div>
                        <div className="text-[10px] text-gray-400 font-serif italic tracking-wide">
                            {s.operationHours}
                        </div>
                    </div>

                    {/* Banking - Ultra Slim Inline */}
                    <div className="flex items-center gap-4 bg-white/[0.05] px-5 py-2.5 rounded-full border border-white/10 shadow-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                            <span className="text-[11px] font-bold text-gray-200">{s.bankName}</span>
                        </div>
                        <span className="text-sm font-serif text-gray-300 tracking-tight">{s.accountNumber}</span>
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">예금주. {s.accountHolder}</span>
                    </div>
                </div>

                {/* Lower Section: Corporate & Copyright Combined */}
                <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2 text-[10px] text-gray-400 font-medium tracking-tight leading-relaxed">
                        <span className="text-gray-300">대표. {s.representative}</span>
                        <span className="opacity-30 border-l border-white h-2 hidden md:inline" />
                        <span>사업자등록번호. {s.businessNumber}</span>
                        <span className="opacity-30 border-l border-white h-2 hidden md:inline" />
                        <span>통신판매업신고. {s.mailOrderNumber}</span>
                        <span className="opacity-30 border-l border-white h-2 hidden md:inline" />
                        <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3 opacity-60 text-accent" /> {s.address}</span>
                        <span className="opacity-30 border-l border-white h-2 hidden md:inline" />
                        <span className="flex items-center gap-1.5 font-serif italic lowercase text-gray-300 underline underline-offset-4 decoration-white/10">{s.email}</span>
                    </div>

                    <div className="flex items-center gap-10">
                        <div className="flex gap-5">
                            {s.snsLinks.instagram && (
                                <a href={s.snsLinks.instagram} target="_blank" className="text-gray-400 hover:text-accent transition-colors">
                                    <Instagram className="w-4 h-4" />
                                </a>
                            )}
                            {s.snsLinks.blog && (
                                <a href={s.snsLinks.blog} target="_blank" className="text-gray-400 hover:text-accent transition-colors">
                                    <Chrome className="w-4 h-4" />
                                </a>
                            )}
                            {s.snsLinks.youtube && (
                                <a href={s.snsLinks.youtube} target="_blank" className="text-gray-400 hover:text-accent transition-colors">
                                    <Youtube className="w-4 h-4" />
                                </a>
                            )}
                        </div>
                        <p className="text-[10px] text-gray-600 font-black tracking-[0.3em] uppercase whitespace-nowrap">
                            © {new Date().getFullYear()} {s.siteName}
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
