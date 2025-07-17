import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

// Получить статью по id
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { id } = await params
  const article = await prisma.article.findUnique({
    where: { id },
    include: { author: { select: { id: true, email: true, firstName: true, lastName: true } } }
  })
  if (!article) return NextResponse.json({ error: "Статья не найдена" }, { status: 404 })
  return NextResponse.json({ article })
}

// Получить связанные статьи по тегам
export async function GET_related(req: Request, { params }: { params: { id: string } }) {
  const { id } = await params
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
    take: 5,
    select: {
      id: true,
      title: true,
      description: true,
      tags: true,
    },
  })
  return NextResponse.json({ articles: related })
}

// PATCH: обновить статью или оценку полезности
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  // Оценка полезности
  if (typeof body.helpful === "boolean") {
    // Обновляем счетчики полезности
    const field = body.helpful ? "helpful" : "notHelpful"
    const article = await prisma.article.update({
      where: { id },
      data: { [field]: { increment: 1 } },
    })
    return NextResponse.json({ article })
  }
  // Инкремент просмотров
  if (body.view === true) {
    const article = await prisma.article.update({
      where: { id },
      data: { views: { increment: 1 } },
    })
    return NextResponse.json({ article })
  }
  // Редактировать статью (только автор/админ)
  const article = await prisma.article.findUnique({ where: { id } })
  if (!article) return NextResponse.json({ error: "Статья не найдена" }, { status: 404 })
  if (article.authorId !== user.id && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Нет прав на редактирование" }, { status: 403 })
  }
  const { title, description, category, content, tags, status } = body
  const updated = await prisma.article.update({
    where: { id },
    data: { title, description, category, content, tags, status },
  })
  return NextResponse.json({ article: updated })
}

// Удалить статью (только автор/админ)
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 })
  const { id } = await params
  const article = await prisma.article.findUnique({ where: { id } })
  if (!article) return NextResponse.json({ error: "Статья не найдена" }, { status: 404 })
  if (article.authorId !== user.id && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Нет прав на удаление" }, { status: 403 })
  }
  await prisma.article.delete({ where: { id } })
  return NextResponse.json({ success: true })
} 