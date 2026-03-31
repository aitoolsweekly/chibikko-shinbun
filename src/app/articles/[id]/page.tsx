import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import { postComment } from "./actions";
import AdSense from "@/components/AdSense";
import Blackboard from "@/components/Blackboard";
import CommentReactions from "@/components/CommentReactions";

export const dynamic = "force-dynamic";

function stripRuby(text: string): string {
  return text.replace(/\{([^|{}]+)\|[^|{}]+\}/g, "$1");
}

function renderText(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|\{[^|{}]+\|[^|{}]+\})/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      const inner = part.slice(2, -2);
      // bold内にrubyが含まれる場合も処理
      return (
        <span key={i} className="font-black text-gray-900" style={{ fontSize: "1.15em" }}>
          {renderText(inner)}
        </span>
      );
    }
    if (part.startsWith("{") && part.includes("|") && part.endsWith("}")) {
      const [kanji, furigana] = part.slice(1, -1).split("|");
      return (
        <ruby key={i}>
          {kanji}
          <rt className="text-xs font-normal">{furigana}</rt>
        </ruby>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function renderBody(text: string) {
  return renderText(text);
}

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

const CATEGORY_EMOJI: Record<string, string> = {
  経済: "💰", 政治: "🏛️", 国際: "🌍", 社会: "👫", 科学: "🔬", IT: "💻",
};

const CATEGORY_IMAGE: Record<string, string> = {
  経済: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi4b0vv_f8vV_KB-QyNw_g9GpqGKIZ77ctzWX0TtdbukuHdYwFi7vIUYC37N96vAy8iFb1qIGZu8kVyiQRDONBIDokbehkJHDyGJOJlHGfQLU76ORlDbyIZyCsTfhtzsyUeXmWwc_LOx6be/s400/money_market_bubble.png",
  政治: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj9qRTmrZQ4HMjE_9DPDTOJYulyAlZmZShBYxi7hvjZHmvSs9dKaXazM7NHNMPeZrPbNedtL_XrEksNuQqIbn0XK38J3rqDSsmtfDgUP7ZGuYWKg7FSJhUR0B0BiXoGMdk0nMAygXWOC_o/s400/job_seijika_man.png",
  国際: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgRtBusXRnrxolUJfj6eLnzQNLQnvOacwDf4wOT_amRWv0CLrvU-lm5WJaJaOFMOFQbz20O8UD1hU4_hjka15SZLvn-9MtFDr900AvzP-P5xhKi6Mj5bYAY_t7xPgF6ACXJxPUDCVV1o8E/s400/kokusai_man.png",
  社会: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgHbQF6P1abgjaF0ElO2xd9iftOtHGxMLSGbA34n1qY_-L7e7OresOCjYlXJIycuv5ytOSrg1tC8Ag00kU0VBoqR6kUXvbPzInukx-eIhqTXeTHBvRhDZpAUi40k8Lk-z3rNYRt5UHjnl4Q/s400/job_news_caster_woman.png",
  科学: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg_OuWipqxF0EOSpDlj7P7DFuqehiylZrat5aNvP2avybkchX46z0UWNA-k7RCKnaRNjReNnUjxV27_HgZJ7qqeU4wKTlWkLfHW-AOZaU9KvXkLOFS7i2DznmtY1sRb0_eFn_iDmN3t3I_O/s400/kenkyu_man.png",
  IT: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjhW-EWKoRQKdpR-GQhA3uGitJpJp3_g8DjFAT8jRx09gO3dMAb1rcFxmh4vq2vRCUhDYdUJFlpzOLdGgV60KOqTEo17Uwi9TgTSIRbVtV138GNPaddDkcP1usZqggKc9-DX4Nuhr1XWYTv/s400/computer_programming_man.png",
};

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const todayStr = new Date().toISOString().split("T")[0];

  const [article, comments, rankingArticles, dailyTopic, latestArticles] = await Promise.all([
    prisma.article.findUnique({ where: { id } }),
    prisma.comment.findMany({
      where: { articleId: id },
      orderBy: { createdAt: "asc" },
      include: { reactions: { select: { type: true } } },
    }),
    prisma.article.findMany({
      orderBy: { viewCount: "desc" },
      take: 5,
      select: { id: true, titleKids: true, category: true, viewCount: true },
    }),
    prisma.dailyTopic.findUnique({ where: { date: todayStr } }),
    prisma.article.findMany({
      orderBy: { publishedAt: "desc" },
      take: 6,
      select: { id: true, titleKids: true, category: true, publishedAt: true },
    }),
    prisma.article.update({ where: { id }, data: { viewCount: { increment: 1 } } }).catch(() => null),
  ]);
  if (!article) notFound();

  const date = new Date(article.publishedAt).toLocaleDateString("ja-JP", {
    year: "numeric", month: "long", day: "numeric",
  });

  const articleUrl = `${SITE_URL}/articles/${id}`;
  const xShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(article.titleKids + "\n\nちびっこ新聞で読む👇")}&url=${encodeURIComponent(articleUrl)}&hashtags=ちびっこ新聞`;
  const lineShareUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(articleUrl)}`;

  const postCommentWithId = postComment.bind(null, id);

  const recentArticles = latestArticles.filter(a => a.id !== id).slice(0, 5);

  return (
    <div className="min-h-screen cork-bg">
      <Blackboard backLink />

      <div className="max-w-7xl mx-auto px-4 py-8 lg:flex lg:gap-6 lg:items-start">

        {/* 左サイドバー（PCのみ） */}
        <aside className="hidden lg:flex flex-col gap-4 w-56 shrink-0 sticky top-6">
          <div className="bg-white bg-opacity-80 rounded-lg p-4 shadow border-l-4 border-orange-400">
            <div className="text-xs font-black text-orange-600 mb-3 font-crayon">🏆 にんきランキング</div>
            <ol className="space-y-2.5">
              {rankingArticles.map((a, i) => (
                <li key={a.id}>
                  <Link href={`/articles/${a.id}`} className={`flex items-start gap-1.5 hover:opacity-70 ${a.id === id ? "opacity-40 pointer-events-none" : ""}`}>
                    <span className={`font-black text-sm min-w-4 shrink-0 ${i === 0 ? "text-yellow-500" : i === 1 ? "text-gray-400" : i === 2 ? "text-amber-600" : "text-gray-400"}`}>
                      {i + 1}
                    </span>
                    <span className="text-xs text-gray-700 leading-snug font-bold line-clamp-2">{a.titleKids}</span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </aside>

        {/* メインコンテンツ */}
        <main className="flex-1 min-w-0">
          {/* 記事カード */}
          <div className="relative">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-5 h-5 rounded-full border-2 border-gray-400 shadow"
              style={{ background: "radial-gradient(circle at 35% 35%, #ff6b6b, #cc2200)" }} />
            <div className="bg-yellow-50 rounded-sm p-6 pt-8 card-pinned">
              <div className="flex items-start gap-4 mb-5 pb-4 border-b-2 border-dashed border-gray-300">
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-500 font-bold mb-3">{article.category}</div>
                  <h1 className="font-black text-gray-800 leading-tight" style={{ fontSize: "clamp(1.6rem, 4vw, 2.2rem)" }}>
                    {renderText(article.titleKids)}
                  </h1>
                </div>
                {CATEGORY_IMAGE[article.category] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={CATEGORY_IMAGE[article.category]}
                    alt={article.category}
                    className="w-24 h-24 object-contain shrink-0 sm:w-32 sm:h-32"
                  />
                )}
              </div>
              <p className="text-xl leading-loose text-gray-700 mb-8">
                {renderBody(article.bodyKids)}
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

          {/* 広告（記事とコメントの間） */}
          <AdSense slot="8005507391" format="auto" />

          {/* コメント欄 */}
          <div className="mt-8 relative">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-4 h-4 rounded-full border-2 border-gray-400 shadow-sm"
              style={{ background: "radial-gradient(circle at 35% 35%, #60a5fa, #1d4ed8)" }} />
            <div className="bg-blue-50 rounded-sm p-6 pt-7 card-pinned" style={{ "--rotate": "0.5deg" } as React.CSSProperties}>
              <h2 className="font-black text-gray-700 text-lg mb-4 font-crayon">💬 みんなのコメント</h2>

              {comments.length > 0 && (
                <div className="space-y-3 mb-5">
                  {comments.map((comment) => {
                    const counts = comment.reactions.reduce<Record<string, number>>((acc, r) => {
                      acc[r.type] = (acc[r.type] ?? 0) + 1;
                      return acc;
                    }, {});
                    return (
                      <div key={comment.id} className="bg-white rounded p-3 border border-blue-100 shadow-sm">
                        <p className="text-sm text-gray-700 leading-relaxed">{comment.body}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(comment.createdAt).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </p>
                        <CommentReactions commentId={comment.id} articleId={id} counts={counts} />
                      </div>
                    );
                  })}
                </div>
              )}

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

          {/* つぎのニュース */}
          {recentArticles.length > 0 && (
            <div className="mt-8">
              <h2 className="font-crayon font-black text-gray-700 text-lg mb-4">📰 つぎのニュース</h2>
              <div className="flex flex-col gap-4">
                {recentArticles.map((a, i) => (
                  <Link key={a.id} href={`/articles/${a.id}`}
                    className="block relative"
                    style={{ "--rotate": `${i % 2 === 0 ? 0.5 : -0.5}deg` } as React.CSSProperties}>
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-4 h-4 rounded-full border-2 border-gray-400 shadow-sm"
                      style={{ background: "radial-gradient(circle at 35% 35%, #86efac, #16a34a)" }} />
                    <div className="bg-white rounded-sm p-4 pt-5 card-pinned hover:z-10">
                      <div className="text-xs text-gray-400 font-bold mb-1">{a.category}</div>
                      <p className="font-black text-gray-800 leading-snug text-base">
                        {CATEGORY_EMOJI[a.category] ?? "📰"} {stripRuby(a.titleKids)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="text-center mt-8">
            <Link href="/" className="font-crayon inline-block bg-white border-2 border-gray-700 font-black px-8 py-3 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all text-sm">
              トップにもどる 🏠
            </Link>
          </div>
        </main>

        {/* 右サイドバー（PCのみ） */}
        <aside className="hidden lg:flex flex-col gap-5 w-72 shrink-0 sticky top-6">
          {dailyTopic && (
            <div className="bg-white bg-opacity-80 rounded-lg p-4 shadow border-l-4 border-sky-400">
              <div className="text-xs font-black text-sky-600 mb-2 font-crayon">🤔 きょうのなんで？</div>
              <h3 className="font-black text-gray-800 text-sm mb-2">{dailyTopic.question}</h3>
              <p className="text-xs text-gray-600 leading-relaxed">{dailyTopic.answer}</p>
            </div>
          )}

          {recentArticles.length > 0 && (
            <div className="bg-white bg-opacity-80 rounded-lg p-4 shadow border-l-4 border-green-400">
              <div className="text-xs font-black text-green-600 mb-3 font-crayon">🆕 さいしんニュース</div>
              <div className="flex flex-col gap-3">
                {recentArticles.map((a) => (
                  <Link key={a.id} href={`/articles/${a.id}`} className="flex items-start gap-2 hover:opacity-70">
                    <span className="text-sm shrink-0">{CATEGORY_EMOJI[a.category] ?? "📰"}</span>
                    <span className="text-xs text-gray-700 leading-snug font-bold line-clamp-2">{a.titleKids}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <AdSense slot="6692425721" format="auto" />
        </aside>
      </div>

      <footer className="text-center py-6 text-xs text-amber-900 opacity-70 font-crayon">
        © 2026 ちびっこ新聞 ｜{" "}
        <Link href="/privacy" className="underline hover:opacity-70">プライバシーポリシー</Link>
      </footer>
    </div>
  );
}
