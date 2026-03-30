import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="ja" className="h-full">
      <body className="min-h-full flex flex-col bg-[#fffef0]">{children}</body>
    </html>
  );
}
