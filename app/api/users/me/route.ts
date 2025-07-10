import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser, hashPassword } from "@/lib/auth"

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
    const data: any = {}
    if (body.email) data.email = body.email
    if (body.firstName) data.firstName = body.firstName
    if (body.lastName) data.lastName = body.lastName
    if (body.middleName !== undefined) data.middleName = body.middleName
    if (body.phone !== undefined) data.phone = body.phone
    if (body.position !== undefined) data.position = body.position
    if (body.department !== undefined) data.department = body.department
    if (body.status !== undefined) data.status = body.status
    if (body.isActive !== undefined) data.isActive = body.isActive
    if (body.lastActivity !== undefined) data.lastActivity = new Date(body.lastActivity)
    if (body.password) {
      data.password = await hashPassword(body.password)
      data.passwordLastChanged = new Date()
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