// Роут для назначения исполнителя
import { NextResponse } from "next/server";
import { assignIncidentToUser } from "@/lib/actions/incidents";
import { getCurrentUser } from "@/lib/auth";
import { isRateLimited } from "@/lib/utils";

// Обработка POST-запроса на назначение исполнителя
export async function POST(req: any) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
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
  const key = `incident:assign:${user.id}:${ip}`
  if (isRateLimited(key, 60, 10 * 60 * 1000)) {
    return NextResponse.json({ error: 'Слишком много операций. Попробуйте позже.' }, { status: 429 })
  }
  const { id, userId } = await req.json(); // Получаем id инцидента и id пользователя
  if (!id || !userId) {
    // Проверка наличия необходимых данных
    return NextResponse.json({ error: "Нет id или userId" }, { status: 400 });
  }
  try {
    const result = await assignIncidentToUser(id, userId); // Назначаем исполнителя
    if (result?.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    // Обработка ошибок
    return NextResponse.json({ error: "Ошибка при назначении исполнителя", details: String(e) }, { status: 500 });
  }
} 