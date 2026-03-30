import Link from "next/link";
import { prisma } from "@/lib/prisma";

const CATEGORY_COLORS: Record<string, string> = {
  経済: "bg-yellow-300 text-yellow-900",
  政治: "bg-red-300 text-red-900",
  国際: "bg-blue-300 text-blue-900",
  社会: "bg-green-300 text-green-900",
};

const CATEGORY_EMOJI: Record<string, string> = {
  経済: "💰",
  政治: "🏛️",
  国際: "🌍",
  社会: "👫",
};

export const dynamic = "force-dynamic";

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

  return (
    <div className="min-h-screen">
      {/* ヘッダー */}
      <header className="bg-gradient-to-r from-pink-400 via-yellow-400 to-blue-400 py-6 px-4 shadow-lg">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl font-black text-white drop-shadow-md tracking-wide">
            🗞️ ちびっこ新聞
          </h1>
          <p className="text-white font-bold mt-1 text-sm opacity-90">
            むずかしいニュースを、かんたんにするよ！
          </p>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {articles.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-6xl">📰</p>
            <p className="text-xl font-bold text-gray-500 mt-4">いまニュースをよみにいってるよ！</p>
            <p className="text-gray-400 mt-2">しばらくまってね 🌟</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => {
              const color = CATEGORY_COLORS[article.category] || "bg-purple-300 text-purple-900";
              const emoji = CATEGORY_EMOJI[article.category] || "📰";
              const date = new Date(article.publishedAt).toLocaleDateString("ja-JP", {
                month: "short",
                day: "numeric",
              });

              return (
                <Link key={article.id} href={`/articles/${article.id}`}>
                  <div className="bg-white rounded-3xl shadow-md hover:shadow-xl transition-all duration-200 hover:-translate-y-1 border-4 border-dashed border-yellow-300 p-5 h-full flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-xs font-black px-3 py-1 rounded-full ${color}`}>
                        {emoji} {article.category}
                      </span>
                      <span className="text-xs text-gray-400 ml-auto">{date}</span>
                    </div>
                    <h2 className="text-lg font-black text-gray-800 leading-snug mb-3">
                      {article.titleKids}
                    </h2>
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 flex-1">
                      {article.bodyKids}
                    </p>
                    <p className="text-xs text-pink-500 font-bold mt-4 text-right">
                      つづきをよむ →
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      {/* フッター */}
      <footer className="text-center py-8 text-xs text-gray-400 mt-auto">
        <p>© 2026 ちびっこ新聞 🗞️ むずかしいニュースをかんたんに！</p>
      </footer>
    </div>
  );
}
