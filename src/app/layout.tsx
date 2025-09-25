import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";
import GoogleAnalytics from "@/components/GoogleAnalytics";

export const metadata: Metadata = {
  title: "스포츠엑스 - 해외 스포츠 산업의 흐름을 한국어로 읽다",
  description: "스포츠 커리어를 위한 지식 허브. 해외 스포츠 산업의 최신 트렌드와 인사이트를 한국어로 제공합니다.",
  keywords: ["스포츠", "스포츠비즈니스", "해외스포츠", "스포츠뉴스", "스포츠분석"],
  authors: [{ name: "스포츠엑스" }],
  openGraph: {
    title: "스포츠엑스 - 해외 스포츠 산업의 흐름을 한국어로 읽다",
    description: "스포츠 커리어를 위한 지식 허브",
    type: "website",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "스포츠엑스 - 해외 스포츠 산업의 흐름을 한국어로 읽다",
    description: "스포츠 커리어를 위한 지식 허브",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="dark">
      <head>
        {/* Google Analytics - 낮은 우선순위 */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-CLB2V5EHD5"
          strategy="lazyOnload"
        />
        <Script id="google-analytics" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-CLB2V5EHD5');
          `}
        </Script>
      </head>
      <body className="font-pretendard antialiased min-h-screen" style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
        <GoogleAnalytics />
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
