import type { Metadata } from "next";
import "./app.css";

export const metadata: Metadata = {
  title: "ARTS FACTORY | Premium Art Curation & B2B Gallery",
  description: "현대 미술의 정수, 아트팩토리. 엄선된 작가들의 독창적인 작품을 큐레이션하고 구매 및 렌탈 서비스를 제공합니다.",
  keywords: ["아트팩토리", "현대 미술", "예술 작품 구매", "그림 렌탈", "아티스트 포트폴리오", "B2B 아트 서비스"],
  openGraph: {
    title: "ARTS FACTORY | Premium Art Curation",
    description: "큐레이팅된 현대 미술 작품과 아티스트들의 이야기를 만나보세요.",
    url: "https://artsfactory.co.kr",
    siteName: "ARTS FACTORY",
    locale: "ko_KR",
    type: "website",
  },
};

import Navbar from "@/components/layout/Navbar";
import AuthContext from "@/components/auth/AuthContext";
import Footer from "@/components/layout/Footer";
import { CompareProvider } from "@/context/CompareContext";
import CompareTray from "@/components/gallery/CompareTray";
import GoogleAnalytics from "@/components/layout/GoogleAnalytics";
import ImageProtection from "@/components/common/ImageProtection";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID || "";

  return (
    <html lang="ko">
      <body className="font-serif antialiased">
        <GoogleAnalytics ga_id={gaId} />
        <CompareProvider>
          <AuthContext>
            <ImageProtection />
            <Navbar />
            <div className="pt-20">
              {children}
            </div>
            <CompareTray />
            <Footer />
          </AuthContext>
        </CompareProvider>
      </body>
    </html>
  );
}
