// Роут для смены приоритета запроса
import { NextResponse } from "next/server"
import { updateRequestPriority } from "@/lib/actions/requests"

// Обработка POST-запроса на смену приоритета
export async function POST(req: Request) {
  const { id, priority } = await req.json() // Получаем id запроса и новый приоритет
  if (!id || !priority) return NextResponse.json({ error: "Нет id или приоритета" }, { status: 400 }) // Проверка наличия данных
  const result = await updateRequestPriority(id, priority) // Обновляем приоритет
  if (result?.error) return NextResponse.json({ error: result.error }, { status: 400 })
  return NextResponse.json({ success: true })
} 