import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

// Получить шаблон по id
export async function GET(req: Request, ctx: { params: { id: string } }) {
  const { id } = ctx?.params || {}
  const template = await prisma.template.findUnique({ where: { id } })
  if (!template) return NextResponse.json({ error: "Шаблон не найден" }, { status: 404 })
  return NextResponse.json({ template })
}

// Обновить шаблон по id (только для админа)
export async function PUT(req: Request, ctx: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 })
  }
  const { id } = ctx?.params || {}
  const body = await req.json()
  const { type, name, description, fields, isActive } = body
  const template = await prisma.template.update({
    where: { id },
    data: { type, name, description, fields, isActive },
  })
  return NextResponse.json({ template })
}

// Удалить шаблон по id (только для админа)
export async function DELETE(req: Request, ctx: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 })
  }
  const { id } = ctx?.params || {}
  await prisma.template.delete({ where: { id } })
  return NextResponse.json({ success: true })
} 