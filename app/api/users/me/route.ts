import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser, hashPassword } from "@/lib/auth"
import { userPatchSchema } from "@/lib/validation/user";

const userSelect = {
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
}

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 })
  const fullUser = await prisma.user.findUnique({ where: { id: user.id }, select: userSelect })
  return NextResponse.json(fullUser)
}

export async function PATCH(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 })
  try {
    const body = await req.json()
    const parsed = userPatchSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }
    const data: any = {}
    const fields = parsed.data
    // Только админ может менять статус, isActive
    if (fields.email) data.email = fields.email
    if (fields.firstName) data.firstName = fields.firstName
    if (fields.lastName) data.lastName = fields.lastName
    if (fields.middleName !== undefined) data.middleName = fields.middleName
    if (fields.phone !== undefined) data.phone = fields.phone
    if (fields.position !== undefined) data.position = fields.position
    if (fields.department !== undefined) data.department = fields.department
    if (fields.password) {
      data.password = await hashPassword(fields.password)
    }
    if (user.role === "ADMIN") {
      if (fields.status !== undefined) data.status = fields.status
      if (fields.isActive !== undefined) data.isActive = fields.isActive
    }
    if (Object.keys(data).length === 0) return NextResponse.json({ error: "Нет данных для обновления" }, { status: 400 })
    const updated = await prisma.user.update({
      where: { id: user.id },
      data,
      select: userSelect,
    })
    return NextResponse.json(updated)
  } catch (e) {
    return NextResponse.json({ error: "Ошибка сохранения" }, { status: 500 })
  }
} 