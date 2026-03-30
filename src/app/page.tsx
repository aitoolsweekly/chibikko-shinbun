import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const CATEGORY_EMOJI: Record<string, string> = {
  経済: "💰",
  政治: "🏛️",
  国際: "🌍",
  社会: "👫",
};

export default async function Home() {
  const articles = await prisma.article.findMany({
    orderBy: { publishedAt: "desc" },
    take: 13,
    select: {
      id: true,
      titleKids: true,
      bodyKids: true,
      category: true,
      publishedAt: true,
    },
  });

  const today = new Date().toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  const top = articles[0];
  const second = articles.slice(1, 3);
  const rest = articles.slice(3);

  return (
    <div className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: "'Hiragino Maru Gothic ProN', 'BIZ UDPGothic', sans-serif" }}>

      {/* 題字エリア */}
      <header className="border-b-4 border-black bg-white px-4 pt-4 pb-2">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end justify-between border-b-2 border-black pb-2 mb-1">
            <div className="text-xs text-gray-500">{today}</div>
            <div className="text-xs text-gray-500">第1号</div>
          </div>
          <h1 className="text-center py-2" style={{ fontSize: "clamp(2.5rem, 8vw, 4.5rem)", fontWeight: 900, letterSpacing: "0.2em", lineHeight: 1 }}>
            ちびっこ新聞
          </h1>
          <div className="text-center text-sm font-bold text-gray-600 border-t-2 border-black pt-1">
            むずかしいニュースを　よっつにおる
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-3 py-4">
        {articles.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-6xl">📰</p>
            <p className="text-xl font-bold text-gray-500 mt-4">いまニュースをよみにいってるよ！</p>
          </div>
        ) : (
          <>
            {/* 1面トップ */}
            {top && (
              <div className="border-b-2 border-black mb-4 pb-4">
                <Link href={`/articles/${top.id}`}>
                  <div className="hover:opacity-80 transition-opacity">
                    <div className="text-xs font-black mb-1">
                      {CATEGORY_EMOJI[top.category] || "📰"} {top.category}
                    </div>
                    <h2 className="font-black leading-tight mb-2" style={{ fontSize: "clamp(1.6rem, 5vw, 2.4rem)" }}>
                      {top.titleKids}
                    </h2>
                    <p className="text-base leading-relaxed text-gray-700">
                      {top.bodyKids}
                    </p>
                    <p className="text-xs text-gray-400 mt-2 text-right">つづきをよむ →</p>
                  </div>
                </Link>
              </div>
            )}

            {/* 2・3番目：横並び */}
            {second.length > 0 && (
              <div className="grid grid-cols-2 gap-4 border-b-2 border-black mb-4 pb-4">
                {second.map((article) => (
                  <Link key={article.id} href={`/articles/${article.id}`}>
                    <div className="hover:opacity-80 transition-opacity">
                      <div className="text-xs font-black mb-1">
                        {CATEGORY_EMOJI[article.category] || "📰"} {article.category}
                      </div>
                      <h3 className="text-lg font-black leading-snug mb-2">{article.titleKids}</h3>
                      <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">{article.bodyKids}</p>
                      <p className="text-xs text-gray-400 mt-1 text-right">つづきをよむ →</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* 残り：小さいカード */}
            {rest.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-4">
                {rest.map((article, i) => (
                  <Link key={article.id} href={`/articles/${article.id}`}>
                    <div className={`hover:opacity-80 transition-opacity ${i < rest.length - 1 ? "border-b border-gray-300 pb-4" : ""}`}>
                      <div className="text-xs text-gray-500 mb-1">
                        {CATEGORY_EMOJI[article.category] || "📰"} {article.category}
                      </div>
                      <h3 className="text-sm font-black leading-snug mb-1">{article.titleKids}</h3>
                      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{article.bodyKids}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <footer className="border-t-2 border-black text-center py-4 mt-8 text-xs text-gray-500 bg-white">
        © 2026 ちびっこ新聞 ｜ むずかしいニュースをよっつにおる
      </footer>
    </div>
  );
}
