import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import { postComment } from "./actions";

export const dynamic = "force-dynamic";

const SITE_URL = "https://chibikko-shinbun.vercel.app";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) return {};

  const url = `${SITE_URL}/articles/${id}`;
  return {
    title: `${article.titleKids} | ちびっこ新聞`,
    description: article.bodyKids.slice(0, 120),
    openGraph: {
      title: article.titleKids,
      description: article.bodyKids.slice(0, 120),
      url,
      siteName: "ちびっこ新聞",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: article.titleKids,
      description: article.bodyKids.slice(0, 120),
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [article, comments] = await Promise.all([
    prisma.article.findUnique({ where: { id } }),
    prisma.comment.findMany({
      where: { articleId: id },
      orderBy: { createdAt: "asc" },
    }),
  ]);
  if (!article) notFound();

  const date = new Date(article.publishedAt).toLocaleDateString("ja-JP", {
    year: "numeric", month: "long", day: "numeric",
  });

  const articleUrl = `${SITE_URL}/articles/${id}`;
  const xShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(article.titleKids + "\n\nちびっこ新聞で読む👇")}&url=${encodeURIComponent(articleUrl)}&hashtags=ちびっこ新聞`;
  const lineShareUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(articleUrl)}`;

  const postCommentWithId = postComment.bind(null, id);

  return (
    <div className="min-h-screen cork-bg">
      <header className="relative py-4 px-4" style={{ background: "linear-gradient(135deg, #2d5a27 0%, #3a7a32 50%, #2d5a27 100%)" }}>
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-crayon text-white text-lg hover:opacity-70 transition-opacity" style={{ textShadow: "1px 1px 0px rgba(0,0,0,0.3)" }}>
            ← ちびっこ新聞
          </Link>
          <span className="text-green-200 text-xs opacity-70">{date}</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* 記事カード */}
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

            {/* シェアボタン */}
            <div className="flex gap-3 mb-6">
              <a href={xShareUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm text-white transition-opacity hover:opacity-80"
                style={{ background: "#000000" }}>
                <span>𝕏</span> ポストする
              </a>
              <a href={lineShareUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm text-white transition-opacity hover:opacity-80"
                style={{ background: "#06C755" }}>
                <span>LINE</span> でシェア
              </a>
            </div>

            {/* 元記事 */}
            <div className="bg-gray-50 rounded p-4 border border-gray-200">
              <p className="text-xs font-bold text-gray-400 mb-2">📰 おとな向けのニュース</p>
              <h2 className="text-sm font-bold text-gray-600 mb-2">{article.title}</h2>
              <p className="text-xs text-gray-500 leading-relaxed">{article.body}</p>
              <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer"
                className="inline-block mt-2 text-xs text-blue-400 underline">
                もとの記事 → {article.sourceTitle}
              </a>
            </div>
          </div>
        </div>

        {/* コメント欄 */}
        <div className="mt-8 relative">
          <div className="absolute top-2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-4 h-4 rounded-full border-2 border-gray-400 shadow-sm"
            style={{ background: "radial-gradient(circle at 35% 35%, #60a5fa, #1d4ed8)" }} />
          <div className="bg-blue-50 rounded-sm p-6 pt-7 card-pinned" style={{ "--rotate": "0.5deg" } as React.CSSProperties}>
            <h2 className="font-black text-gray-700 text-lg mb-4 font-crayon">💬 みんなのコメント</h2>

            {/* 既存コメント */}
            {comments.length > 0 && (
              <div className="space-y-3 mb-5">
                {comments.map((comment) => (
                  <div key={comment.id} className="bg-white rounded p-3 border border-blue-100 shadow-sm">
                    <p className="text-sm text-gray-700 leading-relaxed">{comment.body}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(comment.createdAt).toLocaleDateString("ja-JP", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* 投稿フォーム */}
            <form action={postCommentWithId}>
              <textarea
                name="body"
                required
                maxLength={200}
                rows={3}
                className="w-full border-2 border-blue-200 rounded p-3 text-sm resize-none focus:outline-none focus:border-blue-400 bg-white"
                placeholder="「わかりやすかった！」「はじめてしった！」みたいなかんじでかいてね ✏️"
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  className="font-crayon font-black bg-blue-400 hover:bg-blue-500 text-white px-5 py-2 rounded-full text-sm transition-colors shadow"
                >
                  かく！ ✏️
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="text-center mt-8">
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
