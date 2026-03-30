import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen cork-bg">
      <header className="relative py-4 px-4" style={{ background: "linear-gradient(135deg, #2d5a27 0%, #3a7a32 50%, #2d5a27 100%)" }}>
        <div className="max-w-2xl mx-auto">
          <Link href="/" className="font-crayon text-white text-lg hover:opacity-70 transition-opacity">
            ← ちびっこ新聞
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-sm p-8 card-pinned">
          <h1 className="text-2xl font-black text-gray-800 mb-6 border-b-2 border-dashed border-gray-300 pb-4">
            プライバシーポリシー
          </h1>

          <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
            <section>
              <h2 className="font-black text-base mb-2">広告について</h2>
              <p>
                当サイトでは、第三者配信の広告サービス（Google AdSense）を利用しています。
                広告配信事業者は、ユーザーの興味に応じた広告を表示するためにCookieを使用することがあります。
                Cookieを無効にする設定は、
                <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                  Google広告設定ページ
                </a>
                から行うことができます。
              </p>
            </section>

            <section>
              <h2 className="font-black text-base mb-2">アクセス解析ツールについて</h2>
              <p>
                当サイトでは、Googleによるアクセス解析ツール「Googleアナリティクス」を使用する場合があります。
                このGoogleアナリティクスはCookieを使用してデータを収集しますが、個人を特定する情報は含まれません。
              </p>
            </section>

            <section>
              <h2 className="font-black text-base mb-2">コメントについて</h2>
              <p>
                当サイトへのコメント投稿の際に入力いただいた内容はサイト上に公開されます。
                個人情報を含む内容の投稿はご遠慮ください。
                不適切なコメントは予告なく削除する場合があります。
              </p>
            </section>

            <section>
              <h2 className="font-black text-base mb-2">免責事項</h2>
              <p>
                当サイトの記事はAIによって生成・翻訳されたものです。
                内容の正確性・完全性を保証するものではありません。
                最新情報は各ニュースソースをご確認ください。
              </p>
            </section>

            <p className="text-xs text-gray-400 pt-4 border-t border-gray-200">
              最終更新日：2026年3月30日
            </p>
          </div>
        </div>
      </main>

      <footer className="text-center py-6 text-xs text-amber-900 opacity-70 font-crayon">
        © 2026 ちびっこ新聞
      </footer>
    </div>
  );
}
