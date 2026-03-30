import type { Metadata } from "next";
import { Yomogi } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const yomogi = Yomogi({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-yomogi",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ちびっこ新聞 🗞️ むずかしいニュースをかんたんに！",
  description: "世界のむずかしいニュースを幼稚園児でもわかるように翻訳するメディアです。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;

  return (
    <html lang="ja" className={`h-full ${yomogi.variable}`}>
      <head>
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
