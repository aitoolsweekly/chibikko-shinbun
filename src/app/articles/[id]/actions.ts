"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function postComment(articleId: string, formData: FormData) {
  const body = (formData.get("body") as string)?.trim();
  if (!body || body.length > 200) return;

  await prisma.comment.create({
    data: { articleId, body },
  });

  revalidatePath(`/articles/${articleId}`);
}
