import type { Metadata } from "next";
import { Yomogi } from "next/font/google";
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
  return (
    <html lang="ja" className={`h-full ${yomogi.variable}`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
