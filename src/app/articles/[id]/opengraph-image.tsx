import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

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

async function loadFont(): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(
      "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@900&display=swap",
      { headers: { "User-Agent": "Mozilla/5.0" } }
    ).then((r) => r.text());
    const fontUrl = css.match(/src: url\(([^)]+)\)/)?.[1];
    if (!fontUrl) return null;
    return fetch(fontUrl).then((r) => r.arrayBuffer());
  } catch {
    return null;
  }
}

async function fetchAsDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    const buf = await res.arrayBuffer();
    const base64 = Buffer.from(buf).toString("base64");
    const mime = res.headers.get("content-type") || "image/png";
    return `data:${mime};base64,${base64}`;
  } catch {
    return null;
  }
}

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await prisma.article.findUnique({
    where: { id },
    select: { titleKids: true, bodyKids: true, category: true },
  });

  function stripRuby(text: string): string {
    return text.replace(/\{([^|{}]+)\|[^|{}]+\}/g, "$1").replace(/\*\*([^*]+)\*\*/g, "$1");
  }

  const title = stripRuby(article?.titleKids ?? "ちびっこ新聞");
  const body = stripRuby(article?.bodyKids ?? "").slice(0, 70);
  const cat = article?.category ?? "";
  const emoji = CATEGORY_EMOJI[cat] ?? "📰";

  const [fontData, illustrationDataUrl] = await Promise.all([
    loadFont(),
    CATEGORY_IMAGE[cat] ? fetchAsDataUrl(CATEGORY_IMAGE[cat]) : Promise.resolve(null),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#c8954a",
          padding: "0",
          fontFamily: fontData ? "NotoSansJP" : "serif",
        }}
      >
        {/* 黒板ヘッダー */}
        <div
          style={{
            background: "linear-gradient(135deg, #2d5a27, #3a7a32)",
            padding: "28px 60px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ color: "white", fontSize: 36, fontWeight: 900, letterSpacing: "0.1em" }}>
            ちびっこ新聞
          </span>
          <span style={{ color: "#86efac", fontSize: 20 }}>
            {emoji} {cat}
          </span>
        </div>

        {/* カード */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 60px",
          }}
        >
          <div
            style={{
              background: "#fefce8",
              borderRadius: "4px",
              padding: "40px 48px",
              width: "100%",
              boxShadow: "4px 6px 16px rgba(0,0,0,0.3)",
              display: "flex",
              flexDirection: "row",
              gap: "32px",
              alignItems: "center",
              overflow: "hidden",
            }}
          >
            {/* テキスト */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "16px", minWidth: 0 }}>
              <div style={{ fontSize: title.length > 20 ? 44 : 52, fontWeight: 900, color: "#1f2937", lineHeight: 1.3, display: "flex", flexWrap: "wrap" }}>
                {title}
              </div>
              <div style={{ fontSize: 22, color: "#4b5563", lineHeight: 1.6, display: "flex", flexWrap: "wrap" }}>
                {body}…
              </div>
            </div>

            {/* イラスト */}
            {illustrationDataUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={illustrationDataUrl}
                style={{ width: 260, height: 320, objectFit: "contain", flexShrink: 0 }}
                alt=""
              />
            )}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: fontData
        ? [{ name: "NotoSansJP", data: fontData, style: "normal", weight: 900 }]
        : [],
    }
  );
}
