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
    <div className="min-h-screen">
      {/* ヘッダー */}
      <header className="bg-gradient-to-r from-pink-400 via-yellow-400 to-blue-400 py-4 px-4 shadow-lg">
        <div className="max-w-3xl mx-auto">
          <Link href="/" className="text-white font-black text-lg hover:opacity-80 transition-opacity">
            ← 🗞️ ちびっこ新聞
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <article className="bg-white rounded-3xl shadow-md border-4 border-dashed border-yellow-300 p-8">
          {/* カテゴリ・日付 */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-black bg-yellow-300 text-yellow-900 px-3 py-1 rounded-full">
              {article.category}
            </span>
            <span className="text-xs text-gray-400">{date}</span>
          </div>

          {/* ちびっこタイトル */}
          <h1 className="text-2xl font-black text-gray-800 leading-snug mb-2">
            {article.titleKids}
          </h1>

          {/* ちびっこ本文 */}
          <div className="bg-yellow-50 rounded-2xl p-6 mb-8">
            <p className="text-base leading-relaxed text-gray-700 whitespace-pre-wrap">
              {article.bodyKids}
            </p>
          </div>

          {/* 区切り */}
          <div className="border-t-2 border-dashed border-gray-200 pt-6">
            <p className="text-xs font-bold text-gray-400 mb-3">📰 もとのニュース（おとな向け）</p>
            <h2 className="text-base font-bold text-gray-600 mb-2">{article.title}</h2>
            <p className="text-sm text-gray-500 leading-relaxed">{article.body}</p>
            <a
              href={article.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-3 text-xs text-blue-500 hover:underline"
            >
              もとの記事をよむ → {article.sourceTitle}
            </a>
          </div>
        </article>

        <div className="text-center mt-8">
          <Link
            href="/"
            className="inline-block bg-gradient-to-r from-pink-400 to-yellow-400 text-white font-black px-8 py-3 rounded-full shadow hover:opacity-90 transition-opacity"
          >
            ほかのニュースをよむ 📰
          </Link>
        </div>
      </main>

      <footer className="text-center py-8 text-xs text-gray-400">
        <p>© 2026 ちびっこ新聞 🗞️ むずかしいニュースをかんたんに！</p>
      </footer>
    </div>
  );
}
