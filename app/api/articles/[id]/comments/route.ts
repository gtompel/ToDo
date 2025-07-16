import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

function isPromise(obj: any) {
  return !!obj && typeof obj.then === 'function';
}

async function getParams(context: any) {
  if (context?.params) return context.params;
  if (typeof context === 'function' || typeof context.then === 'function') {
    const ctx = await context;
    return ctx.params;
  }
  throw new Error('No params in context');
}

// Получить все комментарии к статье
export async function GET(req: any, context: any) {
  const params = await getParams(context);
  const { id } = params;
  const comments = await prisma.comment.findMany({
    where: { articleId: id },
    orderBy: { createdAt: "asc" },
    include: { user: { select: { id: true, email: true, firstName: true, lastName: true } } }
  })
  return NextResponse.json({ comments })
}

// Добавить комментарий
export async function POST(req: any, context: any) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 })
  const params = await getParams(context);
  const { id } = params;
  const { content } = await req.json()
  if (!content || !content.trim()) return NextResponse.json({ error: "Комментарий не может быть пустым" }, { status: 400 })
  const comment = await prisma.comment.create({
    data: {
      content,
      articleId: id,
      userId: user.id,
    },
    include: { user: { select: { id: true, email: true, firstName: true, lastName: true } } }
  })
  return NextResponse.json({ comment })
}

// Удалить комментарий (только админ)
export async function DELETE(req: any, context: any) {
  const user = await getCurrentUser()
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Нет прав" }, { status: 403 })
  const params = await getParams(context);
  const { id } = params;
  const { commentId } = await req.json()
  if (!commentId) return NextResponse.json({ error: "Не указан id комментария" }, { status: 400 })
  await prisma.comment.delete({ where: { id: commentId } })
  return NextResponse.json({ success: true })
} 