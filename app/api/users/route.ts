import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { userPatchSchema } from "@/lib/validation/user";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const role = searchParams.get("role") || "TECHNICIAN"
  const roles = role.split(",") // поддержка нескольких ролей через запятую

  // Приводим roles к типу Role[]
  const rolesTyped = roles as unknown as ("USER")[]

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
      // Валидация через zod
      const parsed = userPatchSchema.safeParse(body)
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
      }
      // Обновляем основные поля пользователя
      const updateData: any = {}
      const fields = parsed.data
      if (fields.email !== undefined) updateData.email = fields.email
      if (fields.firstName !== undefined) updateData.firstName = fields.firstName
      if (fields.lastName !== undefined) updateData.lastName = fields.lastName
      if (fields.middleName !== undefined) updateData.middleName = fields.middleName
      if (fields.phone !== undefined) updateData.phone = fields.phone
      if (fields.position !== undefined) updateData.position = fields.position
      if (fields.department !== undefined) updateData.department = fields.department
      if (fields.password !== undefined) updateData.password = fields.password
      // Проверяем роль пользователя
      const currentUser = await getCurrentUser();
      if (currentUser?.role === "ADMIN") {
        if (fields.status !== undefined) updateData.status = fields.status
        if (fields.isActive !== undefined) updateData.isActive = fields.isActive
        if (fields.role !== undefined) updateData.role = fields.role
        // role менять только админ
      }
      if (Object.keys(updateData).length === 0) {
        return NextResponse.json({ error: 'Нет данных для обновления' }, { status: 400 })
      }
      const updated = await prisma.user.update({
        where: { id },
        data: updateData,
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
      })
      return NextResponse.json(updated)
    }
    return NextResponse.json({ error: 'Неизвестное действие' }, { status: 400 })
  } catch (e) {
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}
