// Роут для назначения исполнителя
import { NextResponse } from "next/server"
import { assignRequestToUser } from "@/lib/actions/requests"

// Обработка POST-запроса на назначение исполнителя
export async function POST(req: Request) {
  const { id, userId } = await req.json() // Получаем id запроса и id пользователя
  if (!id || !userId) return NextResponse.json({ error: "Нет id или userId" }, { status: 400 }) // Проверка наличия данных
  const result = await assignRequestToUser(id, userId) // Назначаем исполнителя
  if (result?.error) return NextResponse.json({ error: result.error }, { status: 400 })
  return NextResponse.json({ success: true })
} 