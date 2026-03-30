import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await prisma.article.findUnique({
    where: { id },
    select: { titleKids: true, bodyKids: true, category: true },
  });

  const CATEGORY_EMOJI: Record<string, string> = {
    経済: "💰", 政治: "🏛️", 国際: "🌍", 社会: "👫",
  };

  const title = article?.titleKids ?? "ちびっこ新聞";
  const body = article?.bodyKids?.slice(0, 80) ?? "";
  const cat = article?.category ?? "";
  const emoji = CATEGORY_EMOJI[cat] ?? "📰";

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
              padding: "48px 56px",
              width: "100%",
              boxShadow: "4px 6px 16px rgba(0,0,0,0.3)",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            <div style={{ fontSize: 52, fontWeight: 900, color: "#1f2937", lineHeight: 1.3 }}>
              {title}
            </div>
            <div style={{ fontSize: 26, color: "#4b5563", lineHeight: 1.6 }}>
              {body}…
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
