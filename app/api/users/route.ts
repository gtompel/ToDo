import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const role = searchParams.get("role") || "TECHNICIAN"
  const roles = role.split(",") // поддержка нескольких ролей через запятую

  // Приводим roles к типу Role[]
  const rolesTyped = roles as unknown as ("TECHNICIAN" | "ADMIN" | "MANAGER")[]

  // Используем rolesTyped для корректного типа в запросе
  const users = await prisma.user.findMany({
    where: { role: { in: rolesTyped }, isActive: true },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      position: true,
      email: true,
    },
    orderBy: { lastName: "asc" }
  })
  // Собираем ФИО
  const formatted = users.map(u => ({
    id: u.id,
    name: `${u.lastName} ${u.firstName}`,
    position: u.position,
    email: u.email,
  }))
  return NextResponse.json({ users: formatted })
}
