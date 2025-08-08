import { NextResponse } from "next/server"
import { deleteIncidentById } from "@/lib/actions/incidents"
import { getCurrentUser } from "@/lib/auth"
import { isRateLimited } from "@/lib/utils"

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
  const key = `incident:delete:${user.id}:${ip}`
  if (isRateLimited(key, 30, 10 * 60 * 1000)) {
    return NextResponse.json({ error: 'Слишком много операций. Попробуйте позже.' }, { status: 429 })
  }
  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: "Нет id" }, { status: 400 })
  const result = await deleteIncidentById(id)
  if (result?.error) return NextResponse.json({ error: result.error }, { status: 400 })
  return NextResponse.json({ success: true })
} 