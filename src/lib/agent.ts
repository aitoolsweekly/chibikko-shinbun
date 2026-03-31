import Anthropic from "@anthropic-ai/sdk";
import Parser from "rss-parser";
import { TwitterApi } from "twitter-api-v2";
import { prisma } from "./prisma";

const client = new Anthropic();
const parser = new Parser();

const RSS_FEEDS = [
  // NHK（難しいニュース系）
  { url: "https://www3.nhk.or.jp/rss/news/cat6.xml", category: "経済" },
  { url: "https://www3.nhk.or.jp/rss/news/cat4.xml", category: "政治" },
  { url: "https://www3.nhk.or.jp/rss/news/cat5.xml", category: "国際" },
  { url: "https://www3.nhk.or.jp/rss/news/cat1.xml", category: "社会" },
  { url: "https://www3.nhk.or.jp/rss/news/cat2.xml", category: "科学" },
  // IT・テクノロジー
  { url: "https://rss.itmedia.co.jp/rss/2.0/news_bursts.xml", category: "IT" },
];

async function translateToKids(title: string, body: string): Promise<{ titleKids: string; bodyKids: string }> {
  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
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
- 本文は320文字以内
- 本文には「だれが・なにを・どうした」「どんな数字か（金額・人数・割合など）」「それによってなにが変わるか」を必ず含める
- 元の記事にある具体的な数字・人名・地名・組織名は省かずに使うこと（ただし読み方はやさしく）
- ぼんやりとした説明（「ルールが変わった」「問題が起きた」）だけで終わらせず、具体的に何がどうなるかを書く
- 本文中の重要な単語や数字を2〜3箇所、**単語**のようにアスタリスク2つで囲む（例：**1000億円**、**消費税**）
- アスタリスクで囲む部分は名詞・数字など短いものだけ（文節全体は囲まない）
- 必ず日本語のみで書くこと。韓国語（ハングル文字）・中国語簡体字は絶対に使わないこと
- タイトルと本文の難しい漢字にはフリガナをふること。形式は {漢字|ふりがな}（例：{総理|そうり}、{経済|けいざい}、{大臣|だいじん}）
- すべての漢字にフリガナは不要。小学校高学年以上で習う難しい漢字だけでよい
- **太字** と {漢字|ふりがな} は併用してよい（例：**{消費税|しょうひぜい}**）

タイトル：${title}
本文：${body}

以下のJSON形式で返してください：
{"titleKids": "幼稚園児向けタイトル（難漢字に{漢字|ふりがな}付き）", "bodyKids": "幼稚園児向け本文（**重要語**と{漢字|ふりがな}入り）"}`,
      },
    ],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("JSONが取得できませんでした");

  return JSON.parse(jsonMatch[0]);
}

export async function generateDailyTopic() {
  const todayStr = new Date().toISOString().split("T")[0];

  // 既に今日のトピックがあればスキップ
  const existing = await prisma.dailyTopic.findUnique({ where: { date: todayStr } });
  if (existing) {
    console.log("きょうのなんで？はすでに生成済み");
    return;
  }

  // 今日の記事を最大5件取得してテーマのヒントにする
  const start = new Date(todayStr);
  const end = new Date(todayStr);
  end.setDate(end.getDate() + 1);
  const todayArticles = await prisma.article.findMany({
    where: { publishedAt: { gte: start, lt: end } },
    take: 5,
    select: { titleKids: true, category: true },
  });

  const context = todayArticles.length > 0
    ? `今日のニュース：\n${todayArticles.map(a => `・${a.category} ${a.titleKids}`).join("\n")}`
    : "（今日のニュースはまだありません）";

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: `ちびっこ新聞の「きょうのなんで？」コーナーです。
${context}

上記のニュースに関連した（または子どもが素朴に疑問に思いそうな）「なんで？」という質問と、幼稚園児にもわかる答えを1セット生成してください。

ルール：
- 質問は「なんで〜なの？」「どうして〜なの？」形式で20文字以内
- 答えは80文字以内、やさしい言葉で、絵文字を1〜2個使う
- 質問と答えは今日のニュースのテーマに関連させるか、子どもが日常で疑問に思うことでOK
- 答えは「なぜそうなるか」の仕組みや原因を具体的に説明する（「〜だから〜なの」という循環説明はNG）
- 例え話や身近なものに置き換えて説明するとよい（「まるで〜みたいに」など）
- 質問の言葉を答えの中で繰り返さない

悪い例：「ガソリンはちいさなつぶがいっぱいあって、火がつくとパッと燃えやすいんだよ」→ 燃えやすいから燃えると言っているだけで説明になっていない
良い例：「ガソリンのなかには、空気とまざると火花ひとつで爆発したがる成分がいっぱい入ってるんだよ💥 それがくるまのエンジンをぐるぐる動かす力になるんだ」

以下のJSON形式で返してください：
{"question": "なんで〜なの？", "answer": "〜だからだよ！🌟"}`,
      },
    ],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error("DailyTopic JSONが取得できませんでした");
    return;
  }

  const { question, answer } = JSON.parse(jsonMatch[0]);
  await prisma.dailyTopic.create({
    data: { date: todayStr, question, answer },
  });
  console.log(`きょうのなんで？生成: ${question}`);
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

function stripRuby(text: string): string {
  return text.replace(/\{([^|{}]+)\|[^|{}]+\}/g, "$1").replace(/\*\*([^*]+)\*\*/g, "$1");
}

const CATEGORY_EMOJI: Record<string, string> = {
  経済: "💰", 政治: "🏛️", 国際: "🌍", 社会: "👫", 科学: "🔬", IT: "💻",
};

export async function tweetLatestArticles(): Promise<{ status: string; title?: string; error?: string }> {
  if (!process.env.X_API_KEY || !process.env.X_API_SECRET || !process.env.X_ACCESS_TOKEN || !process.env.X_ACCESS_SECRET) {
    return { status: "skipped", error: "X APIキーが未設定" };
  }

  const client = new TwitterApi({
    appKey: process.env.X_API_KEY,
    appSecret: process.env.X_API_SECRET,
    accessToken: process.env.X_ACCESS_TOKEN,
    accessSecret: process.env.X_ACCESS_SECRET,
  });

  // 未ツイートの記事を1件取得
  const article = await prisma.article.findFirst({
    where: { tweeted: false },
    orderBy: { publishedAt: "desc" },
    select: { id: true, titleKids: true, bodyKids: true, category: true },
  });

  if (!article) {
    return { status: "no_article" };
  }

  const emoji = CATEGORY_EMOJI[article.category] ?? "📰";
  const url = `https://chibikko-shinbun.vercel.app/articles/${article.id}`;
  const text = `${emoji}【${article.category}】${stripRuby(article.titleKids)}\n\n👉 ${url}\n\n#ちびっこ新聞 #こどもニュース #${article.category}`;

  try {
    await client.v2.tweet(text);
    await prisma.article.update({ where: { id: article.id }, data: { tweeted: true } });
    return { status: "ok", title: article.titleKids };
  } catch (e) {
    return { status: "error", error: String(e) };
  }
}
