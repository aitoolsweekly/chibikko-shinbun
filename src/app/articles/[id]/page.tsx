import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) notFound();

  const date = new Date(article.publishedAt).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: "'Hiragino Maru Gothic ProN', 'BIZ UDPGothic', sans-serif" }}>
      {/* 題字 */}
      <header className="border-b-4 border-black bg-white px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-black text-xl hover:opacity-70 transition-opacity" style={{ letterSpacing: "0.1em" }}>
            ← ちびっこ新聞
          </Link>
          <span className="text-xs text-gray-500">{date}</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <article>
          <div className="text-sm font-black text-gray-500 mb-2">{article.category}</div>

          {/* 見出し */}
          <h1 className="font-black leading-tight mb-4 border-b-2 border-black pb-4" style={{ fontSize: "clamp(1.8rem, 5vw, 2.6rem)" }}>
            {article.titleKids}
          </h1>

          {/* ちびっこ本文 */}
          <p className="text-lg leading-loose text-gray-800 whitespace-pre-wrap mb-8">
            {article.bodyKids}
          </p>

          {/* 元記事 */}
          <div className="border-t-2 border-dashed border-gray-400 pt-4">
            <p className="text-xs font-bold text-gray-400 mb-2">📰 おとな向けのニュース</p>
            <h2 className="text-sm font-bold text-gray-600 mb-2">{article.title}</h2>
            <p className="text-xs text-gray-500 leading-relaxed">{article.body}</p>
            <a
              href={article.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 text-xs text-gray-400 underline"
            >
              もとの記事 → {article.sourceTitle}
            </a>
          </div>
        </article>

        <div className="text-center mt-8">
          <Link href="/" className="inline-block border-2 border-black font-black px-8 py-3 bg-white hover:bg-black hover:text-white transition-colors text-sm">
            ほかのニュースをよむ
          </Link>
        </div>
      </main>

      <footer className="border-t-2 border-black text-center py-4 mt-8 text-xs text-gray-500 bg-white">
        © 2026 ちびっこ新聞 ｜ むずかしいニュースをよっつにおる
      </footer>
    </div>
  );
}
