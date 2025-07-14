import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"

export async function POST() {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value
  if (token) {
    try {
      await prisma.session.deleteMany({ where: { token } })
    } catch (error) {
      // Логируем ошибку, но не прерываем процесс
    }
  }
  cookieStore.set({ name: "auth-token", value: "", path: "/", expires: new Date(0) })
  return NextResponse.json({ success: true })
} 