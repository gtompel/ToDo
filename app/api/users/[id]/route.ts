import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        middleName: true,
        phone: true,
        position: true,
        department: true,
        role: true,
        status: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        // Добавь другие нужные поля
      },
    })
    if (!user) return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 })
    return NextResponse.json(user)
  } catch (e) {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
} 