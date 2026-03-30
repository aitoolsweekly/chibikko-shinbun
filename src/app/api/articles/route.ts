import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 12;
  const skip = (page - 1) * limit;

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      orderBy: { publishedAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        titleKids: true,
        bodyKids: true,
        category: true,
        publishedAt: true,
      },
    }),
    prisma.article.count(),
  ]);

  return NextResponse.json({ articles, total, page, totalPages: Math.ceil(total / limit) });
}
