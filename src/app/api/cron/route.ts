import { NextResponse } from "next/server";
import { runNewsAgent } from "@/lib/agent";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const saved = await runNewsAgent();
  return NextResponse.json({ ok: true, saved });
}
