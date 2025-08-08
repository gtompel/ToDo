import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 })
  if (user.role !== "ADMIN") return NextResponse.json({ error: "Требуются права администратора" }, { status: 403 })

  const body = await req.json().catch(() => ({} as any))
  const { id, title, description, status, priority, category, scheduledAt, assignedToId, implementationPlan, backoutPlan } = body || {}
  if (!id) return NextResponse.json({ error: "Не передан id" }, { status: 400 })
  try {
    const updated = await prisma.change.update({
      where: { id },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(status !== undefined ? { status } : {}),
        ...(priority !== undefined ? { priority } : {}),
        ...(category !== undefined ? { category } : {}),
        ...(scheduledAt !== undefined ? { scheduledAt: scheduledAt ? new Date(scheduledAt) : null } : {}),
        ...(assignedToId !== undefined ? { assignedToId: assignedToId || null } : {}),
        ...(implementationPlan !== undefined ? { implementationPlan } : {}),
        ...(backoutPlan !== undefined ? { backoutPlan } : {}),
      },
      include: {
        assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    })
    return NextResponse.json({ success: true, change: updated })
  } catch (e: any) {
    return NextResponse.json({ error: "Ошибка при обновлении изменения", details: String(e) }, { status: 500 })
  }
}


