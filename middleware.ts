import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
// В middleware избегаем любых Node- и БД-зависимостей

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Никогда не обрабатываем /login и /register (исключаем любые сюрпризы)
  if (pathname === '/login' || pathname === '/register') {
    return NextResponse.next()
  }

  // Публичные префиксы и статические ассеты (не должны перехватываться)
  const publicPrefixes = [
    '/_next',
    '/__nextjs', // в т.ч. __nextjs_font
    '/favicon.ico',
  ]
  const staticExts = ['.png', '.jpg', '.jpeg', '.svg', '.ico', '.webp', '.gif', '.css', '.js', '.woff', '.woff2']
  const isStaticAsset = staticExts.some(ext => pathname.endsWith(ext))

  if (publicPrefixes.some(p => pathname.startsWith(p)) || isStaticAsset) {
    return NextResponse.next()
  }

  // CSRF в middleware: для небезопасных методов (кроме OPTIONS) проверяем Origin против Host/ALLOWED_ORIGINS
  const method = (req.method || 'GET').toUpperCase()
  const unsafe = method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE'
  if (unsafe) {
    const origin = req.headers.get('origin') || ''
    const host = req.headers.get('host') || ''
    const allowedEnv = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean)
    const derived = [`http://${host}`, `https://${host}`]
    const isAllowed = origin === '' || allowedEnv.includes(origin) || derived.includes(origin)
    if (!isAllowed) {
      // Для API отдадим 403 JSON, для страниц — обычный 403
      const isApi = pathname.startsWith('/api')
      return new NextResponse(isApi ? JSON.stringify({ error: 'Недопустимый источник запроса' }) : 'Forbidden', {
        status: 403,
        headers: isApi ? { 'content-type': 'application/json' } : undefined,
      })
    }
  }

  // Лёгкая проверка авторизации по наличию куки (без похода в БД)
  const hasToken = req.cookies.get('auth-token')?.value

  // Редирект неавторизованных на /login
  if (!hasToken) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    // Передаем исходный URL, чтобы показать ошибку/вернуть обратно после входа
    url.searchParams.set('from', req.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  // Полностью исключаем служебные пути Next (включая HMR и __nextjs_font)
  matcher: ['/((?!api|_next|__nextjs|favicon.ico).*)'],
}
