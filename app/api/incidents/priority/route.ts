// Роут для смены приоритета инцидента
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Допустимые значения приоритета
const ALLOWED_PRIORITY = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

// Обработка POST-запроса на смену приоритета
export async function POST(req: Request) {
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