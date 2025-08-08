// Роут для смены статуса запроса
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { isRateLimited } from "@/lib/utils";

// Допустимые значения статуса
const ALLOWED_STATUS = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];

// Обработка POST-запроса на смену статуса
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
  const key = `request:status:${user.id}:${ip}`
  if (isRateLimited(key, 60, 10 * 60 * 1000)) {
    return NextResponse.json({ error: 'Слишком много операций. Попробуйте позже.' }, { status: 429 })
  }
  const { id, status } = await req.json(); // Получаем id запроса и новый статус
  if (!id || !status) {
    // Проверка наличия необходимых данных
    return NextResponse.json({ error: "Нет id или статуса" }, { status: 400 });
  }
  if (!ALLOWED_STATUS.includes(status)) {
    // Проверка корректности значения статуса
    return NextResponse.json({ error: "Некорректный статус" }, { status: 400 });
  }
  try {
    const updated = await prisma.request.update({
      where: { id },
      data: { status },
    }); // Обновляем статус
    return NextResponse.json({ success: true, request: updated });
  } catch (e) {
    // Обработка ошибок
    return NextResponse.json({ error: "Ошибка при смене статуса", details: String(e) }, { status: 500 });
  }
} 