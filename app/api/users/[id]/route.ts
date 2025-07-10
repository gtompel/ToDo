import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id },
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
      },
    });
    if (!user) return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
    return NextResponse.json(user);
  } catch (e) {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
} 