import Link from "next/link";
import { prisma } from "@/lib/prisma";
import AdSense from "@/components/AdSense";

export const dynamic = "force-dynamic";

const CATEGORY_EMOJI: Record<string, string> = {
  経済: "💰",
  政治: "🏛️",
  国際: "🌍",
  社会: "👫",
};

const CARD_COLORS = [
  "bg-yellow-100", "bg-pink-100", "bg-blue-100", "bg-green-100",
  "bg-orange-100", "bg-purple-100", "bg-red-100", "bg-teal-100",
  "bg-lime-100", "bg-rose-100", "bg-sky-100", "bg-amber-100",
];

const ROTATIONS = [
  "-rotate-1", "rotate-1", "-rotate-2", "rotate-2",
  "-rotate-1", "rotate-0", "rotate-1", "-rotate-2",
  "rotate-2", "-rotate-1", "rotate-1", "-rotate-2",
];

const CATEGORIES = ["すべて", "経済", "政治", "国際", "社会"];

function getDateLabel(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diff = Math.floor((today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "きょう";
  if (diff === 1) return "きのう";
  return date.toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" }) + "のニュース";
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; date?: string }>;
}) {
  const params = await searchParams;
  const selectedCategory = params.category && params.category !== "すべて" ? params.category : null;
  const selectedDate = params.date || null;

  // 利用可能な日付一覧
  const allDates = await prisma.article.findMany({
    select: { publishedAt: true },
    distinct: ["publishedAt"],
    orderBy: { publishedAt: "desc" },
    take: 30,
  });
  const uniqueDates = [...new Set(
    allDates.map(a => a.publishedAt.toISOString().split("T")[0])
  )].slice(0, 7);

  // 記事取得
  const where: { category?: string; publishedAt?: { gte: Date; lt: Date } } = {};
  if (selectedCategory) where.category = selectedCategory;
  if (selectedDate) {
    const start = new Date(selectedDate);
    const end = new Date(selectedDate);
    end.setDate(end.getDate() + 1);
    where.publishedAt = { gte: start, lt: end };
  }

  const articles = await prisma.article.findMany({
    where,
    orderBy: { publishedAt: "desc" },
    take: 24,
    select: { id: true, titleKids: true, bodyKids: true, category: true, publishedAt: true },
  });

  const today = new Date().toLocaleDateString("ja-JP", {
    year: "numeric", month: "long", day: "numeric",
  });

  const buildUrl = (cat?: string, date?: string) => {
    const p = new URLSearchParams();
    if (cat && cat !== "すべて") p.set("category", cat);
    if (date) p.set("date", date);
    const q = p.toString();
    return q ? `/?${q}` : "/";
  };

  return (
    <div className="min-h-screen cork-bg">
      {/* ヘッダー：黒板 */}
      <header className="relative py-5 px-4" style={{ background: "linear-gradient(135deg, #2d5a27 0%, #3a7a32 50%, #2d5a27 100%)" }}>
        <div className="absolute top-2 left-0 right-0 h-px opacity-30" style={{ background: "repeating-linear-gradient(90deg, white 0px, white 30px, transparent 30px, transparent 40px)" }} />
        <div className="absolute bottom-2 left-0 right-0 h-px opacity-30" style={{ background: "repeating-linear-gradient(90deg, white 0px, white 20px, transparent 20px, transparent 30px)" }} />
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-crayon text-white drop-shadow-lg" style={{ fontSize: "clamp(2.8rem, 9vw, 5rem)", textShadow: "3px 3px 0px rgba(0,0,0,0.3)" }}>
            ちびっこ新聞
          </h1>
          <div className="text-green-200 text-sm font-crayon mt-1 opacity-80">むずかしいニュースを　かんたんに！</div>
          <div className="text-green-300 text-xs mt-1 opacity-60">{today}</div>
        </div>
      </header>

      {/* フィルターバー */}
      <div className="bg-amber-800 bg-opacity-40 px-4 py-3 sticky top-0 z-30 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto space-y-2">

          {/* カテゴリタブ */}
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((cat) => {
              const active = cat === "すべて" ? !selectedCategory : selectedCategory === cat;
              return (
                <Link
                  key={cat}
                  href={buildUrl(cat, selectedDate || undefined)}
                  className={`font-crayon text-sm px-3 py-1 rounded-full border-2 transition-all font-bold ${
                    active
                      ? "bg-white text-amber-900 border-white shadow-md"
                      : "bg-transparent text-white border-white border-opacity-60 hover:bg-white hover:bg-opacity-20"
                  }`}
                >
                  {cat !== "すべて" ? `${CATEGORY_EMOJI[cat]} ` : "📰 "}{cat}
                </Link>
              );
            })}
          </div>

          {/* 日付タブ */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <Link
              href={buildUrl(selectedCategory || undefined)}
              className={`font-crayon text-xs px-3 py-1 rounded-full border whitespace-nowrap transition-all ${
                !selectedDate
                  ? "bg-yellow-300 text-amber-900 border-yellow-300 font-bold"
                  : "bg-transparent text-yellow-200 border-yellow-200 border-opacity-60 hover:bg-yellow-200 hover:bg-opacity-20"
              }`}
            >
              📅 すべての日
            </Link>
            {uniqueDates.map((dateStr) => {
              const d = new Date(dateStr);
              const label = getDateLabel(d);
              const active = selectedDate === dateStr;
              return (
                <Link
                  key={dateStr}
                  href={buildUrl(selectedCategory || undefined, dateStr)}
                  className={`font-crayon text-xs px-3 py-1 rounded-full border whitespace-nowrap transition-all ${
                    active
                      ? "bg-yellow-300 text-amber-900 border-yellow-300 font-bold"
                      : "bg-transparent text-yellow-200 border-yellow-200 border-opacity-60 hover:bg-yellow-200 hover:bg-opacity-20"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* 掲示板 */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {articles.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-white rounded-lg p-8 inline-block shadow-lg">
              <p className="text-5xl">🔍</p>
              <p className="text-lg font-bold text-gray-500 mt-4 font-crayon">ニュースがまだないよ！</p>
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
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-gray-400">
                        {getDateLabel(article.publishedAt)}
                      </span>
                      <span className="text-xs text-gray-400 font-bold">よむ →</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      {/* フッター広告 */}
      <div className="max-w-5xl mx-auto px-4 pb-4">
        <AdSense slot="0987654321" format="horizontal" />
      </div>

      <footer className="text-center py-4 text-xs text-amber-900 opacity-70 font-crayon">
        © 2026 ちびっこ新聞 ｜{" "}
        <Link href="/privacy" className="underline hover:opacity-70">プライバシーポリシー</Link>
      </footer>
    </div>
  );
}
