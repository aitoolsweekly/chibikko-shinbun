import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const CATEGORY_EMOJI: Record<string, string> = {
  経済: "💰",
  政治: "🏛️",
  国際: "🌍",
  社会: "👫",
};

// カード色：工作用紙っぽいカラフルな色
const CARD_COLORS = [
  "bg-yellow-100",
  "bg-pink-100",
  "bg-blue-100",
  "bg-green-100",
  "bg-orange-100",
  "bg-purple-100",
  "bg-red-100",
  "bg-teal-100",
  "bg-lime-100",
  "bg-rose-100",
  "bg-sky-100",
  "bg-amber-100",
];

const ROTATIONS = [
  "-rotate-1", "rotate-1", "-rotate-2", "rotate-2",
  "-rotate-1", "rotate-0", "rotate-1", "-rotate-2",
  "rotate-2", "-rotate-1", "rotate-1", "-rotate-2",
];

export default async function Home() {
  const articles = await prisma.article.findMany({
    orderBy: { publishedAt: "desc" },
    take: 12,
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
  });

  return (
    <div className="min-h-screen cork-bg">

      {/* ヘッダー：黒板風の帯 */}
      <header className="relative py-5 px-4" style={{ background: "linear-gradient(135deg, #2d5a27 0%, #3a7a32 50%, #2d5a27 100%)" }}>
        {/* チョークっぽいライン */}
        <div className="absolute top-2 left-0 right-0 h-px opacity-30" style={{ background: "repeating-linear-gradient(90deg, white 0px, white 30px, transparent 30px, transparent 40px)" }} />
        <div className="absolute bottom-2 left-0 right-0 h-px opacity-30" style={{ background: "repeating-linear-gradient(90deg, white 0px, white 20px, transparent 20px, transparent 30px)" }} />

        <div className="max-w-4xl mx-auto text-center">
          {/* クレヨン風タイトル */}
          <h1 className="font-crayon text-white drop-shadow-lg" style={{ fontSize: "clamp(2.8rem, 9vw, 5rem)", textShadow: "3px 3px 0px rgba(0,0,0,0.3), -1px -1px 0px rgba(255,255,255,0.1)" }}>
            ちびっこ新聞
          </h1>
          <div className="text-green-200 text-sm font-crayon mt-1 opacity-80">
            むずかしいニュースを　かんたんに！
          </div>
          <div className="text-green-300 text-xs mt-1 opacity-60">{today}</div>
        </div>
      </header>

      {/* 掲示板エリア */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {articles.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-white rounded-lg p-8 inline-block shadow-lg">
              <p className="text-6xl">📰</p>
              <p className="text-xl font-bold text-gray-500 mt-4 font-crayon">いまニュースをよみにいってるよ！</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {articles.map((article, i) => {
              const color = CARD_COLORS[i % CARD_COLORS.length];
              const rotate = ROTATIONS[i % ROTATIONS.length];
              const emoji = CATEGORY_EMOJI[article.category] || "📰";

              return (
                <Link key={article.id} href={`/articles/${article.id}`} className="relative block">
                  {/* 画鋲 */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-4 h-4 rounded-full border-2 border-gray-400 shadow-sm"
                    style={{ background: "radial-gradient(circle at 35% 35%, #ff6b6b, #cc2200)" }} />

                  <div className={`card-pinned ${color} ${rotate} rounded-sm p-4 pt-5 relative`}>
                    <div className="text-xs text-gray-500 mb-2 font-bold">
                      {emoji} {article.category}
                    </div>
                    <h2 className="font-black text-gray-800 leading-snug mb-2 text-sm md:text-base">
                      {article.titleKids}
                    </h2>
                    <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
                      {article.bodyKids}
                    </p>
                    <p className="text-xs text-gray-400 mt-3 text-right font-bold">
                      よむ →
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      <footer className="text-center py-6 text-xs text-amber-900 opacity-70 font-crayon">
        © 2026 ちびっこ新聞
      </footer>
    </div>
  );
}
