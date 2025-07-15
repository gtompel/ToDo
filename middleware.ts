import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function middleware(req: any) {
  // Не обновлять lastActivity для публичных и auth роутов
  const publicPaths = ['/login', '/register', '/api/auth/ldap-login', '/_next', '/favicon.ico', '/public']
  if (publicPaths.some(path => req.nextUrl.pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Получаем текущего пользователя
  const user = await getCurrentUser()
  if (user && user.id) {
    // Обновляем lastActivity
    await prisma.user.update({ where: { id: user.id }, data: { lastActivity: new Date() } })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
