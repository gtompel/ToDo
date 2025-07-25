import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { jwtVerify } from 'jose'

export const runtime = 'nodejs';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret')

export async function GET(req: NextRequest) {
  const token = req.cookies.get('auth-token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const user = await prisma.user.findUnique({ where: { id: payload.userId as string } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    return NextResponse.json({
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      middleName: user.middleName,
      phone: user.phone,
      position: user.position,
      department: user.department,
      status: user.status,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
    })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
} 