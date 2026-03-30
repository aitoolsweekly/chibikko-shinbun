import Anthropic from "@anthropic-ai/sdk";
import Parser from "rss-parser";
import { prisma } from "./prisma";

const client = new Anthropic();
const parser = new Parser();

const RSS_FEEDS = [
  { url: "https://www3.nhk.or.jp/rss/news/cat6.xml", category: "経済" },
  { url: "https://www3.nhk.or.jp/rss/news/cat4.xml", category: "政治" },
  { url: "https://www3.nhk.or.jp/rss/news/cat5.xml", category: "国際" },
];

async function translateToKids(title: string, body: string): Promise<{ titleKids: string; bodyKids: string }> {
  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `以下のニュースを幼稚園児でもわかるように翻訳してください。

ルール：
- 難しい言葉はやさしい言葉に変える（ただし漢字はそのまま使ってOK）
- ポップで楽しい文体にする
- 絵文字を適度に使う
- 比喩や例えを使ってわかりやすくする
- タイトルは20文字以内
- 本文は150文字以内

タイトル：${title}
本文：${body}

以下のJSON形式で返してください：
{"titleKids": "幼稚園児向けタイトル", "bodyKids": "幼稚園児向け本文"}`,
      },
    ],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("JSONが取得できませんでした");

  return JSON.parse(jsonMatch[0]);
}

export async function runNewsAgent() {
  console.log("ニュースエージェント起動");
  let totalSaved = 0;

  for (const feed of RSS_FEEDS) {
    try {
      const parsed = await parser.parseURL(feed.url);
      const items = parsed.items.slice(0, 5); // 各フィードから最新5件

      for (const item of items) {
        if (!item.title || !item.link) continue;

        // 既存チェック
        const existing = await prisma.article.findFirst({
          where: { sourceUrl: item.link },
        });
        if (existing) continue;

        const body = item.contentSnippet || item.content || item.title;

        try {
          const { titleKids, bodyKids } = await translateToKids(item.title, body);

          await prisma.article.create({
            data: {
              title: item.title,
              titleKids,
              body,
              bodyKids,
              sourceUrl: item.link,
              sourceTitle: parsed.title || feed.url,
              category: feed.category,
              publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
            },
          });

          totalSaved++;
          console.log(`保存: ${titleKids}`);

          // レートリミット対策
          await new Promise((r) => setTimeout(r, 1000));
        } catch (e) {
          console.error(`翻訳失敗: ${item.title}`, e);
        }
      }
    } catch (e) {
      console.error(`RSS取得失敗: ${feed.url}`, e);
    }
  }

  console.log(`完了: ${totalSaved}件保存`);
  return totalSaved;
}
