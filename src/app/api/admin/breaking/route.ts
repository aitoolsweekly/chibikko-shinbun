import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 号外設定：PATCH /api/admin/breaking
// body: { articleId: string, breaking: boolean }
// header: Authorization: Bearer <CRON_SECRET>
export async function PATCH(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { articleId, breaking } = await request.json();
  if (typeof articleId !== "string" || typeof breaking !== "boolean") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  // 号外は1件のみ → 設定時は他を全部解除
  if (breaking) {
    await prisma.article.updateMany({ data: { isBreaking: false } });
  }

  await prisma.article.update({
    where: { id: articleId },
    data: { isBreaking: breaking },
  });

  return NextResponse.json({ ok: true, articleId, breaking });
}
