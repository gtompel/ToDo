import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

// Получить статью по id
export async function GET(req: Request, context: { params: { id: string } }) {
  const { id } = context?.params || {}
  const article = await prisma.article.findUnique({
    where: { id },
    include: { author: { select: { id: true, email: true, firstName: true, lastName: true } } }
  })
  if (!article) return NextResponse.json({ error: "Статья не найдена" }, { status: 404 })
  return NextResponse.json({ article })
}

// Получить связанные статьи по тегам
// GET_related вынесен в app/api/articles/[id]/related/route.ts

// PATCH: обновить статью или оценку полезности
export async function PATCH(req: Request, context: { params: { id: string } }) {
  const { id } = context?.params || {}
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
export async function DELETE(req: Request, context: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 })
  const { id } = context?.params || {}
  const article = await prisma.article.findUnique({ where: { id } })
  if (!article) return NextResponse.json({ error: "Статья не найдена" }, { status: 404 })
  if (article.authorId !== user.id && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Нет прав на удаление" }, { status: 403 })
  }
  await prisma.article.delete({ where: { id } })
  return NextResponse.json({ success: true })
} 