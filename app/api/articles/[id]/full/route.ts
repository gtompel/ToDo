import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

async function getParams(context: any) {
  if (context?.params) return context.params;
  if (typeof context === 'function' || typeof context.then === 'function') {
    const ctx = await context;
    return ctx.params;
  }
  throw new Error('No params in context');
}

export async function GET(req: any, context: any) {
  const params = await getParams(context);
  const { id } = params;
  if (!id) return NextResponse.json({ error: "Не указан id" }, { status: 400 })

  const article = await prisma.article.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, email: true, firstName: true, lastName: true } },
    },
  })
  if (!article) return NextResponse.json({ error: "Статья не найдена" }, { status: 404 })

  const comments = await prisma.comment.findMany({
    where: { articleId: id },
    orderBy: { createdAt: "asc" },
    include: { user: { select: { id: true, email: true, firstName: true, lastName: true } } }
  })

  return NextResponse.json({ article, comments })
} 