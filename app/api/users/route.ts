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

export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { id, action, newPassword } = body
    if (!id || !action) return NextResponse.json({ error: 'Нет id или действия' }, { status: 400 })

    if (action === 'block') {
      await prisma.user.update({ where: { id }, data: { status: 'blocked', isActive: false } })
      return NextResponse.json({ success: true })
    }
    if (action === 'activate') {
      await prisma.user.update({ where: { id }, data: { status: 'active', isActive: true } })
      return NextResponse.json({ success: true })
    }
    if (action === 'reset-password') {
      if (!newPassword) return NextResponse.json({ error: 'Нет нового пароля' }, { status: 400 })
      const { hashPassword } = await import('@/lib/auth')
      const password = await hashPassword(newPassword)
      await prisma.user.update({ where: { id }, data: { password } })
      return NextResponse.json({ success: true })
    }
    if (action === 'update') {
      // Логируем body для отладки
      console.log('PATCH /api/users body:', body)
      // Обновляем основные поля пользователя
      const updateData: any = {}
      for (const key of [
        'email', 'firstName', 'lastName', 'middleName', 'phone', 'position', 'department', 'role', 'status', 'isActive']) {
        if (body[key] !== undefined) updateData[key] = body[key]
      }
      if (Object.keys(updateData).length === 0) {
        return NextResponse.json({ error: 'Нет данных для обновления' }, { status: 400 })
      }
      await prisma.user.update({ where: { id }, data: updateData })
      return NextResponse.json({ success: true })
    }
    return NextResponse.json({ error: 'Неизвестное действие' }, { status: 400 })
  } catch (e) {
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}
