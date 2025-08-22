import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request, context: any) {
  const { id } = context?.params || {}
  // Получаем текущую статью
  const article = await prisma.article.findUnique({ where: { id } })
  if (!article) return NextResponse.json({ articles: [] })
  if (!article.tags || article.tags.length === 0) return NextResponse.json({ articles: [] })
  // Ищем другие статьи с любым из этих тегов, кроме текущей, только опубликованные
  const related = await prisma.article.findMany({
    where: {
      id: { not: id },
      tags: { hasSome: article.tags },
      status: "published",
    },
    select: {
      id: true,
      title: true,
      description: true,
      tags: true,
    },
  })
  return NextResponse.json({ articles: related })
} 