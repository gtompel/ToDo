// Роут для смены статуса запроса
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Допустимые значения статуса
const ALLOWED_STATUS = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];

// Обработка POST-запроса на смену статуса
export async function POST(req: Request) {
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