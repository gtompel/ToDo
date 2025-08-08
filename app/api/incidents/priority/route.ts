// Роут для смены приоритета инцидента
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { isRateLimited } from "@/lib/utils";

// Допустимые значения приоритета
const ALLOWED_PRIORITY = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

// Обработка POST-запроса на смену приоритета
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
  const key = `incident:priority:${user.id}:${ip}`
  if (isRateLimited(key, 60, 10 * 60 * 1000)) {
    return NextResponse.json({ error: 'Слишком много операций. Попробуйте позже.' }, { status: 429 })
  }
  const { id, priority } = await req.json(); // Получаем id инцидента и новый приоритет
  if (!id || !priority) {
    // Проверка наличия необходимых данных
    return NextResponse.json({ error: "Нет id или приоритета" }, { status: 400 });
  }
  if (!ALLOWED_PRIORITY.includes(priority)) {
    // Проверка корректности значения приоритета
    return NextResponse.json({ error: "Некорректный приоритет" }, { status: 400 });
  }
  try {
    const updated = await prisma.incident.update({
      where: { id },
      data: { priority },
    }); // Обновляем приоритет
    return NextResponse.json({ success: true, incident: updated });
  } catch (e) {
    // Обработка ошибок
    return NextResponse.json({ error: "Ошибка при смене приоритета", details: String(e) }, { status: 500 });
  }
} 