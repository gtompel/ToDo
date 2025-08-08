// Роут для смены приоритета запроса
import { NextResponse } from "next/server"
import { updateRequestPriority } from "@/lib/actions/requests"
import { getCurrentUser } from "@/lib/auth"
import { isRateLimited } from "@/lib/utils"

// Обработка POST-запроса на смену приоритета
export async function POST(req: any) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 })
  // CSRF
  try {
    const origin = req.headers.get?.('origin') || req.headers['origin'] || ''
    const host = req.headers.get?.('host') || req.headers['host'] || ''
    const allowedEnv = (process.env.ALLOWED_ORIGINS || '').split(',').map((s: string) => s.trim()).filter(Boolean)
    const derived = [`http://${host}`, `https://${host}`]
    const isAllowed = origin === '' || allowedEnv.includes(origin) || derived.includes(origin)
    if (!isAllowed) return NextResponse.json({ error: 'Недопустимый источник запроса' }, { status: 403 })
  } catch {}
  // Rate-limit
  const ip = req.headers.get?.('x-forwarded-for') || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown'
  const key = `request:priority:${user.id}:${ip}`
  if (isRateLimited(key, 60, 10 * 60 * 1000)) {
    return NextResponse.json({ error: 'Слишком много операций. Попробуйте позже.' }, { status: 429 })
  }
  const { id, priority } = await req.json() // Получаем id запроса и новый приоритет
  if (!id || !priority) return NextResponse.json({ error: "Нет id или приоритета" }, { status: 400 }) // Проверка наличия данных
  const result = await updateRequestPriority(id, priority) // Обновляем приоритет
  if (result?.error) return NextResponse.json({ error: result.error }, { status: 400 })
  return NextResponse.json({ success: true })
} 