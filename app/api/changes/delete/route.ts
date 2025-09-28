// Роут для удаления изменения
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { isRateLimited } from "@/lib/utils";

// Обработка POST-запроса на удаление изменения
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  if (user.role !== "ADMIN") return NextResponse.json({ error: "Требуются права администратора" }, { status: 403 });

  // CSRF
  try {
    const origin = req.headers.get?.('origin') || ''
    const host = req.headers.get?.('host') || ''
    const allowedEnv = (process.env.ALLOWED_ORIGINS || '').split(',').map((s: string) => s.trim()).filter(Boolean)
    const derived = [`http://${host}`, `https://${host}`]
    const isAllowed = origin === '' || allowedEnv.includes(origin) || derived.includes(origin)
    if (!isAllowed) return NextResponse.json({ error: 'Недопустимый источник запроса' }, { status: 403 })
  } catch {}

  // Rate-limit
    const ip = req.headers.get?.('x-forwarded-for')?.split(',')[0] || req.headers.get?.('x-real-ip') || 'unknown'
  const key = `change:delete:${user.id}:${ip}`
  if (isRateLimited(key, 60, 10 * 60 * 1000)) {
    return NextResponse.json({ error: 'Слишком много операций. Попробуйте позже.' }, { status: 429 })
  }

  const { id } = await req.json(); // Получаем id изменения
  if (!id) {
    return NextResponse.json({ error: "Нет id" }, { status: 400 });
  }

  try {
    // Проверяем, существует ли изменение
    const existingChange = await prisma.change.findUnique({
      where: { id }
    });

    if (!existingChange) {
      return NextResponse.json({ error: "Изменение не найдено" }, { status: 404 });
    }

    // Удаляем изменение
    await prisma.change.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Ошибка при удалении изменения", details: String(e) }, { status: 500 });
  }
}
