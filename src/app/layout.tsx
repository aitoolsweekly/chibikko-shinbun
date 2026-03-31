import type { Metadata } from "next";
import { Yomogi, Klee_One } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const yomogi = Yomogi({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-yomogi",
  display: "swap",
});

const kleeOne = Klee_One({
  weight: "600",
  subsets: ["latin"],
  variable: "--font-klee",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ちびっこ新聞",
  description: "世界のむずかしいニュースを幼稚園児でもわかるように翻訳するメディアです。",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;

  return (
    <html lang="ja" className={`h-full ${yomogi.variable} ${kleeOne.variable}`}>
      <head>
        <meta name="google-site-verification" content="u5YiTohk8kOKZhLCaLBdmVc-_ldxGdEBNQG87WUrz5o" />
        <meta name="google-adsense-account" content="ca-pub-5313624085381885" />
        {adsenseId && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
