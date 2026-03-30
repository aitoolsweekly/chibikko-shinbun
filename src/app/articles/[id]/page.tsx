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
    <div className="min-h-screen cork-bg">
      {/* ヘッダー */}
      <header className="relative py-4 px-4" style={{ background: "linear-gradient(135deg, #2d5a27 0%, #3a7a32 50%, #2d5a27 100%)" }}>
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-crayon text-white text-lg hover:opacity-70 transition-opacity" style={{ textShadow: "1px 1px 0px rgba(0,0,0,0.3)" }}>
            ← ちびっこ新聞
          </Link>
          <span className="text-green-200 text-xs opacity-70">{date}</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* 画鋲つきカード */}
        <div className="relative">
          <div className="absolute top-2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-5 h-5 rounded-full border-2 border-gray-400 shadow"
            style={{ background: "radial-gradient(circle at 35% 35%, #ff6b6b, #cc2200)" }} />

          <div className="bg-yellow-50 rounded-sm p-6 pt-8 card-pinned">
            <div className="text-xs text-gray-500 font-bold mb-3">{article.category}</div>

            <h1 className="font-black text-gray-800 leading-tight mb-5 border-b-2 border-dashed border-gray-300 pb-4" style={{ fontSize: "clamp(1.6rem, 4vw, 2.2rem)" }}>
              {article.titleKids}
            </h1>

            <p className="text-base leading-loose text-gray-700 whitespace-pre-wrap mb-8">
              {article.bodyKids}
            </p>

            {/* 元記事 */}
            <div className="bg-gray-50 rounded p-4 border border-gray-200">
              <p className="text-xs font-bold text-gray-400 mb-2">📰 おとな向けのニュース</p>
              <h2 className="text-sm font-bold text-gray-600 mb-2">{article.title}</h2>
              <p className="text-xs text-gray-500 leading-relaxed">{article.body}</p>
              <a
                href={article.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-2 text-xs text-blue-400 underline"
              >
                もとの記事 → {article.sourceTitle}
              </a>
            </div>
          </div>
        </div>

        <div className="text-center mt-10">
          <Link href="/" className="font-crayon inline-block bg-white border-2 border-gray-700 font-black px-8 py-3 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all text-sm">
            ほかのニュースをよむ 📰
          </Link>
        </div>
      </main>

      <footer className="text-center py-6 text-xs text-amber-900 opacity-70 font-crayon">
        © 2026 ちびっこ新聞
      </footer>
    </div>
  );
}
