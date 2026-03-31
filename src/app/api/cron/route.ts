import { NextResponse } from "next/server";
import { runNewsAgent, generateDailyTopic, tweetLatestArticles } from "@/lib/agent";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const saved = await runNewsAgent();
  await generateDailyTopic();
  const tweetResult = await tweetLatestArticles();
  return NextResponse.json({ ok: true, saved, tweet: tweetResult });
}
