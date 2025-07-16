import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

// Получить список статей
export async function GET(req: Request) {
  const articles = await prisma.article.findMany({
    orderBy: { updatedAt: "desc" },
    include: { author: { select: { id: true, email: true, firstName: true, lastName: true } } }
  })
  return NextResponse.json({ articles })
}

// Создать новую статью (только для авторизованных)
export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 })
  }
  const body = await req.json()
  const { title, description, category, content, tags, status } = body
  if (!title || !content) {
    return NextResponse.json({ error: "Заполните все обязательные поля" }, { status: 400 })
  }
  const article = await prisma.article.create({
    data: {
      title,
      description,
      category,
      content,
      tags,
      authorId: user.id,
      createdById: user.id,
    },
  })
  return NextResponse.json({ article })
} 