import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

// Получить список шаблонов
export async function GET(req: Request) {
  // Можно всем
  const { searchParams } = new URL(req.url)
  const type = searchParams.get("type")
  const where = type ? { type } : undefined
  const templates = await prisma.template.findMany({ where, orderBy: { createdAt: "desc" } })
  return NextResponse.json({ templates })
}

// Создать новый шаблон (только для админа)
export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 })
  }
  const body = await req.json()
  const { type, name, description, fields, isActive } = body
  if (!type || !name || !fields) {
    return NextResponse.json({ error: "type, name, fields обязательны" }, { status: 400 })
  }
  const template = await prisma.template.create({
    data: { type, name, description, fields, isActive: isActive ?? true },
  })
  return NextResponse.json({ template })
} 