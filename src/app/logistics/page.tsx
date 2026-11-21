import { Metadata } from 'next';
import LogisticsHero from '@/components/logistics/LogisticsHero';
import TrustBadges from '@/components/logistics/TrustBadges';
import LogisticsCalculator from '@/components/logistics/LogisticsCalculator';
import LogisticsSOP from '@/components/logistics/LogisticsSOP';
import LogisticsFAQ from '@/components/logistics/LogisticsFAQ';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: '미술품 전문 물류 & 설치 (Art Logistics) | Arts Factory',
    description: '작품의 가치까지 온전히 이동합니다. 무진동·항온항습 특수탑차, 미술품 특약 동산물류보험, 국공립 관공서 비교견적 공식 대응 및 실시간 자동 견적 계산기 제공.',
    openGraph: {
        title: 'Arts Factory Fine Art Logistics & Installation',
        description: '무진동 특수탑차와 10년 이상 전문 아트 핸들러가 함께하는 미술품 전문 운송·설치 솔루션',
        type: 'website',
    },
};

export default function LogisticsPage() {
    return (
        <main className="min-h-screen bg-[#F4F1EE] text-[#121212] selection:bg-[#C5A059] selection:text-white">
            {/* 1. 히어로 섹션 */}
            <LogisticsHero />

            {/* 2. 4대 신뢰 배지 섹션 */}
            <TrustBadges />

            {/* 3. 실시간 아트 물류 자동 견적 계산기 (#calculator) */}
            <LogisticsCalculator />

            {/* 4. 운송 표준 프로세스 (SOP 5단계) */}
            <LogisticsSOP />

            {/* 5. 자주 묻는 질문 (FAQ) */}
            <LogisticsFAQ />
        </main>
    );
}
