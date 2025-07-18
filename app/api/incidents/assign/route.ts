// Роут для назначения исполнителя
import { NextResponse } from "next/server";
import { assignIncidentToUser } from "@/lib/actions/incidents";

// Обработка POST-запроса на назначение исполнителя
export async function POST(req: Request) {
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