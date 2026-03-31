import Link from "next/link";
import { prisma } from "@/lib/prisma";
import AdSense from "@/components/AdSense";
import Blackboard from "@/components/Blackboard";

export const revalidate = 300; // 5分キャッシュ

const CATEGORY_EMOJI: Record<string, string> = {
  経済: "💰",
  政治: "🏛️",
  国際: "🌍",
  社会: "👫",
  科学: "🔬",
  IT: "💻",
};

const CATEGORY_COLORS: Record<string, string> = {
  経済: "bg-yellow-100",
  政治: "bg-blue-100",
  国際: "bg-green-100",
  社会: "bg-orange-100",
  科学: "bg-purple-100",
  IT: "bg-cyan-100",
};

const CATEGORY_PIN_COLORS: Record<string, string> = {
  経済: "#f59e0b",
  政治: "#3b82f6",
  国際: "#22c55e",
  社会: "#f97316",
  科学: "#a855f7",
  IT: "#06b6d4",
};

const ROTATIONS = [
  "-rotate-1", "rotate-1", "-rotate-2", "rotate-2",
  "-rotate-1", "rotate-0", "rotate-1", "-rotate-2",
  "rotate-2", "-rotate-1", "rotate-1", "-rotate-2",
];

const CATEGORIES = ["すべて", "経済", "政治", "国際", "社会", "科学", "IT"];

const JST = 9 * 60 * 60 * 1000;

function toJSTDateKey(date: Date): string {
  return new Date(date.getTime() + JST).toISOString().split("T")[0];
}

function getDateLabel(date: Date): string {
  const todayKey = toJSTDateKey(new Date());
  const targetKey = toJSTDateKey(date);
  const diff = Math.floor((new Date(todayKey).getTime() - new Date(targetKey).getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "きょう";
  if (diff === 1) return "きのう";
  return date.toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo", month: "numeric", day: "numeric" }) + "のニュース";
}

function isToday(date: Date): boolean {
  return toJSTDateKey(date) === toJSTDateKey(new Date());
}

function stripRuby(text: string): string {
  return text.replace(/\{([^|{}]+)\|[^|{}]+\}/g, "$1");
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; date?: string }>;
}) {
  const params = await searchParams;
  const selectedCategory = params.category && params.category !== "すべて" ? params.category : null;
  const selectedDate = params.date || null;

  const todayStr = new Date().toISOString().split("T")[0];

  const where: { category?: string; publishedAt?: { gte: Date; lt: Date } } = {};
  if (selectedCategory) where.category = selectedCategory;
  if (selectedDate) {
    const start = new Date(selectedDate + "T00:00:00+09:00");
    const end = new Date(selectedDate + "T00:00:00+09:00");
    end.setDate(end.getDate() + 1);
    where.publishedAt = { gte: start, lt: end };
  }

  const [allDates, breakingArticle, dailyTopic, rankingArticles, articles] = await Promise.all([
    prisma.article.findMany({
      select: { publishedAt: true },
      distinct: ["publishedAt"],
      orderBy: { publishedAt: "desc" },
      take: 30,
    }),
    prisma.article.findFirst({
      where: { isBreaking: true },
      orderBy: { publishedAt: "desc" },
      select: { id: true, titleKids: true, category: true },
    }),
    prisma.dailyTopic.findUnique({
      where: { date: todayStr },
    }),
    prisma.article.findMany({
      orderBy: { viewCount: "desc" },
      take: 5,
      select: { id: true, titleKids: true, category: true, viewCount: true },
    }),
    prisma.article.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      take: 30,
      select: { id: true, titleKids: true, bodyKids: true, category: true, publishedAt: true },
    }),
  ]);

  const uniqueDates = [...new Set(
    allDates.map(a => toJSTDateKey(a.publishedAt))
  )].slice(0, 7);

  const pickup = articles[0] ?? null;
  const restArticles = articles.slice(1);

  // 日付ごとにグループ化
  const groupedArticles = restArticles.reduce((groups, article) => {
    const dateKey = toJSTDateKey(article.publishedAt);
    if (!groups.has(dateKey)) groups.set(dateKey, []);
    groups.get(dateKey)!.push(article);
    return groups;
  }, new Map<string, typeof restArticles>());

  const buildUrl = (cat?: string, date?: string) => {
    const p = new URLSearchParams();
    if (cat && cat !== "すべて") p.set("category", cat);
    if (date) p.set("date", date);
    const q = p.toString();
    return q ? `/?${q}` : "/";
  };

  // 左サイドバー：カテゴリリンク
  const categoryLinks = CATEGORIES.map((cat) => {
    const active = cat === "すべて" ? !selectedCategory : selectedCategory === cat;
    return { cat, active, href: buildUrl(cat, selectedDate || undefined) };
  });

  // 左サイドバー：日付リンク
  const dateLinks = uniqueDates.map((dateStr) => {
    const d = new Date(dateStr);
    return { dateStr, label: getDateLabel(d), active: selectedDate === dateStr, href: buildUrl(selectedCategory || undefined, dateStr) };
  });

  return (
    <div className="min-h-screen cork-bg">
      <Blackboard />

      {/* 号外バナー */}
      {breakingArticle && (
        <div className="bg-red-600 text-white py-2 px-4 text-center font-black text-sm md:text-base animate-pulse sticky top-0 z-50">
          <Link href={`/articles/${breakingArticle.id}`} className="flex items-center justify-center gap-2 hover:underline">
            <span className="bg-white text-red-600 font-black px-2 py-0.5 rounded text-xs">号外！</span>
            <span>{stripRuby(breakingArticle.titleKids)}</span>
          </Link>
        </div>
      )}

      {/* モバイル用フィルターバー（lg以上では非表示） */}
      <div className="lg:hidden bg-amber-800 bg-opacity-40 px-4 py-3 sticky top-0 z-30 backdrop-blur-sm">
        <div className="space-y-2">
          <div className="flex gap-2 flex-wrap">
            {categoryLinks.map(({ cat, active, href }) => (
              <Link key={cat} href={href}
                className={`font-crayon text-sm px-3 py-1 rounded-full border-2 transition-all font-bold ${
                  active ? "bg-white text-amber-900 border-white shadow-md" : "bg-transparent text-white border-white border-opacity-60"
                }`}>
                {cat !== "すべて" ? `${CATEGORY_EMOJI[cat]} ` : "📰 "}{cat}
              </Link>
            ))}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            <Link href={buildUrl(selectedCategory || undefined)}
              className={`font-crayon text-xs px-3 py-1 rounded-full border whitespace-nowrap transition-all ${
                !selectedDate ? "bg-yellow-300 text-amber-900 border-yellow-300 font-bold" : "bg-transparent text-yellow-200 border-yellow-200 border-opacity-60"
              }`}>
              📅 すべての日
            </Link>
            {dateLinks.map(({ dateStr, label, active, href }) => (
              <Link key={dateStr} href={href}
                className={`font-crayon text-xs px-3 py-1 rounded-full border whitespace-nowrap transition-all ${
                  active ? "bg-yellow-300 text-amber-900 border-yellow-300 font-bold" : "bg-transparent text-yellow-200 border-yellow-200 border-opacity-60"
                }`}>
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* 桜の飾り */}
      <div className="relative max-w-7xl mx-auto pointer-events-none select-none hidden lg:block">
        <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjI_ngvPbVd5zvsoEB931lSMHyPiYJaeqwdORsFfTBBW4qMz71Dfce_HPYgb4L5HSEfCY4OhbpMq6m9kYKuJJPHQvVKN3OoJm1h_d6IasuFTLey2u6CQ0N6vnyyiiJ72EoiA6XAjO02XEA/s800/sakura_tree.png"
          alt="" className="absolute left-0 top-0 w-36 opacity-80" style={{ transform: "translateX(-60%)" }} />
        <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjI_ngvPbVd5zvsoEB931lSMHyPiYJaeqwdORsFfTBBW4qMz71Dfce_HPYgb4L5HSEfCY4OhbpMq6m9kYKuJJPHQvVKN3OoJm1h_d6IasuFTLey2u6CQ0N6vnyyiiJ72EoiA6XAjO02XEA/s800/sakura_tree.png"
          alt="" className="absolute right-0 top-0 w-36 opacity-80" style={{ transform: "translateX(60%) scaleX(-1)" }} />
      </div>

      {/* 3カラムレイアウト */}
      <div className="max-w-7xl mx-auto px-4 py-8 lg:flex lg:gap-6 lg:items-start">

        {/* 左サイドバー（PCのみ） */}
        <aside className="hidden lg:flex flex-col gap-4 w-56 shrink-0 sticky top-6">
          {/* カテゴリ */}
          <div className="bg-white bg-opacity-80 rounded-lg p-4 shadow border-l-4 border-amber-400">
            <p className="text-xs font-black text-amber-700 mb-3 font-crayon">📰 カテゴリ</p>
            <div className="flex flex-col gap-1">
              {categoryLinks.map(({ cat, active, href }) => (
                <Link key={cat} href={href}
                  className={`font-crayon text-sm px-2 py-1 rounded font-bold transition-all ${
                    active ? "bg-amber-500 text-white" : "text-amber-900 hover:bg-amber-100"
                  }`}>
                  {cat !== "すべて" ? `${CATEGORY_EMOJI[cat]} ` : "📰 "}{cat}
                </Link>
              ))}
            </div>
          </div>

          {/* 日付 */}
          <div className="bg-white bg-opacity-80 rounded-lg p-4 shadow border-l-4 border-green-400">
            <p className="text-xs font-black text-green-700 mb-3 font-crayon">📅 日付</p>
            <div className="flex flex-col gap-1">
              <Link href={buildUrl(selectedCategory || undefined)}
                className={`font-crayon text-xs px-2 py-1 rounded font-bold transition-all ${
                  !selectedDate ? "bg-green-500 text-white" : "text-green-900 hover:bg-green-100"
                }`}>
                すべての日
              </Link>
              {dateLinks.map(({ dateStr, label, active, href }) => (
                <Link key={dateStr} href={href}
                  className={`font-crayon text-xs px-2 py-1 rounded font-bold transition-all ${
                    active ? "bg-green-500 text-white" : "text-green-900 hover:bg-green-100"
                  }`}>
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </aside>

        {/* メインコンテンツ */}
        <main className="flex-1 min-w-0">
          {articles.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-white rounded-lg p-8 inline-block shadow-lg">
                <p className="text-5xl">🔍</p>
                <p className="text-lg font-bold text-gray-500 mt-4 font-crayon">ニュースがまだないよ！</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">

              {/* ピックアップ */}
              {pickup && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-yellow-400 text-amber-900 font-black text-xs px-3 py-1 rounded-full shadow font-crayon">
                      📌 編集長のおすすめ
                    </span>
                  </div>
                  <Link href={`/articles/${pickup.id}`} className="relative block">
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-5 h-5 rounded-full border-2 border-gray-400 shadow-md"
                      style={{ background: "radial-gradient(circle at 35% 35%, #ff6b6b, #cc2200)" }} />
                    <div className={`card-pinned ${CATEGORY_COLORS[pickup.category] ?? "bg-yellow-100"} rounded-sm p-6 pt-7 relative -rotate-1 shadow-xl`}>
                      {isToday(pickup.publishedAt) && (
                        <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-black px-2 py-0.5 rounded rotate-3 shadow font-crayon">
                          NEW
                        </span>
                      )}
                      <div className="text-sm text-gray-500 mb-2 font-bold">
                        {CATEGORY_EMOJI[pickup.category] ?? "📰"} {pickup.category}
                      </div>
                      <h2 className="font-black text-gray-800 leading-snug mb-3 text-xl md:text-2xl">
                        {stripRuby(pickup.titleKids)}
                      </h2>
                      <p className="text-sm text-gray-600 leading-relaxed line-clamp-4">
                        {stripRuby(pickup.bodyKids)}
                      </p>
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-xs text-gray-400">{getDateLabel(pickup.publishedAt)}</span>
                        <span className="text-sm text-amber-700 font-black">よむ →</span>
                      </div>
                    </div>
                  </Link>
                </div>
              )}

              {/* モバイルのみ：なんで？＋ランキング */}
              <div className="lg:hidden grid grid-cols-1 gap-5">
                {dailyTopic && (
                  <div className="bg-sky-100 rounded-sm p-5 rotate-1 card-pinned relative shadow-lg">
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-4 h-4 rounded-full border-2 border-gray-400 shadow-sm"
                      style={{ background: "radial-gradient(circle at 35% 35%, #60a5fa, #1d4ed8)" }} />
                    <div className="text-xs text-gray-500 font-bold mb-2">🤔 きょうのなんで？</div>
                    <h3 className="font-black text-gray-800 text-base mb-3">{dailyTopic.question}</h3>
                    <p className="text-xs text-gray-600 leading-relaxed">{dailyTopic.answer}</p>
                  </div>
                )}
                {rankingArticles.length > 0 && (
                  <div className="bg-orange-100 rounded-sm p-5 -rotate-1 card-pinned relative shadow-lg">
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-4 h-4 rounded-full border-2 border-gray-400 shadow-sm"
                      style={{ background: "radial-gradient(circle at 35% 35%, #fb923c, #c2410c)" }} />
                    <div className="text-xs text-gray-500 font-bold mb-3">🏆 にんきランキング</div>
                    <ol className="space-y-2">
                      {rankingArticles.map((a, i) => (
                        <li key={a.id}>
                          <Link href={`/articles/${a.id}`} className="flex items-start gap-2 hover:opacity-70">
                            <span className={`font-black text-sm min-w-5 ${i === 0 ? "text-yellow-500" : i === 1 ? "text-gray-400" : i === 2 ? "text-amber-600" : "text-gray-400"}`}>
                              {i + 1}
                            </span>
                            <span className="text-xs text-gray-700 leading-snug font-bold line-clamp-2">{stripRuby(a.titleKids)}</span>
                            <span className="text-xs text-gray-400 ml-auto whitespace-nowrap">👀{a.viewCount}</span>
                          </Link>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>

              {/* 記事グリッド（日付グループ） */}
              {Array.from(groupedArticles.entries()).map(([dateKey, dateArticles]) => (
                <div key={dateKey}>
                  {/* 日付ヘッダー */}
                  <div className="flex items-center gap-3 my-4">
                    <div className="h-px flex-1 bg-amber-400 opacity-50" />
                    <span className="bg-amber-100 text-amber-800 font-black text-sm px-4 py-1 rounded-full shadow border border-amber-300 font-crayon">
                      📅 {getDateLabel(new Date(dateKey))}
                    </span>
                    <div className="h-px flex-1 bg-amber-400 opacity-50" />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                    {dateArticles.map((article, i) => {
                      const color = CATEGORY_COLORS[article.category] ?? "bg-yellow-100";
                      const rotate = ROTATIONS[i % ROTATIONS.length];
                      const emoji = CATEGORY_EMOJI[article.category] || "📰";
                      const pinColor = isToday(article.publishedAt)
                        ? "radial-gradient(circle at 35% 35%, #ff6b6b, #cc2200)"
                        : `radial-gradient(circle at 35% 35%, ${CATEGORY_PIN_COLORS[article.category] ?? "#9ca3af"}, ${CATEGORY_PIN_COLORS[article.category] ?? "#4b5563"})`;

                      return (
                        <Link key={article.id} href={`/articles/${article.id}`} className="relative block">
                          <div className="absolute top-2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-4 h-4 rounded-full border-2 border-gray-400 shadow-sm"
                            style={{ background: pinColor }} />
                          <div className={`card-pinned ${color} ${rotate} rounded-sm p-4 pt-5 relative`}>
                            {isToday(article.publishedAt) && (
                              <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-black px-2 py-0.5 rounded rotate-3 shadow font-crayon leading-tight">
                                NEW
                              </span>
                            )}
                            <div className="text-sm text-gray-500 mb-2 font-bold">
                              {emoji} {article.category}
                            </div>
                            <h2 className="font-black text-gray-800 leading-snug mb-2 text-base md:text-lg">
                              {stripRuby(article.titleKids)}
                            </h2>
                            <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                              {stripRuby(article.bodyKids)}
                            </p>
                            <div className="flex items-center justify-between mt-3">
                              <span className="text-sm text-gray-400">{getDateLabel(article.publishedAt)}</span>
                              <span className="text-sm text-gray-400 font-bold">よむ →</span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* 右サイドバー（PCのみ） */}
        <aside className="hidden lg:flex flex-col gap-5 w-72 shrink-0 sticky top-6">

          {/* きょうのなんで？ */}
          {dailyTopic && (
            <div className="bg-white bg-opacity-80 rounded-lg p-4 shadow border-l-4 border-sky-400">
              <div className="text-xs font-black text-sky-600 mb-2 font-crayon">🤔 きょうのなんで？</div>
              <h3 className="font-black text-gray-800 text-sm mb-2">{dailyTopic.question}</h3>
              <p className="text-xs text-gray-600 leading-relaxed">{dailyTopic.answer}</p>
            </div>
          )}

          {/* ランキング */}
          {rankingArticles.length > 0 && (
            <div className="bg-white bg-opacity-80 rounded-lg p-4 shadow border-l-4 border-orange-400">
              <div className="text-xs font-black text-orange-600 mb-3 font-crayon">🏆 にんきランキング</div>
              <ol className="space-y-2.5">
                {rankingArticles.map((a, i) => (
                  <li key={a.id}>
                    <Link href={`/articles/${a.id}`} className="flex items-start gap-1.5 hover:opacity-70">
                      <span className={`font-black text-sm min-w-4 shrink-0 ${i === 0 ? "text-yellow-500" : i === 1 ? "text-gray-400" : i === 2 ? "text-amber-600" : "text-gray-400"}`}>
                        {i + 1}
                      </span>
                      <span className="text-xs text-gray-700 leading-snug font-bold line-clamp-2">{stripRuby(a.titleKids)}</span>
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* 広告 */}
          <AdSense slot="6692425721" format="auto" />
        </aside>
      </div>

      <footer className="text-center py-4 text-xs text-amber-900 opacity-70 font-crayon">
        © 2026 ちびっこ新聞 ｜{" "}
        <Link href="/privacy" className="underline hover:opacity-70">プライバシーポリシー</Link>
      </footer>
    </div>
  );
}
