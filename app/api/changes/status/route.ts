// Роут для смены статуса изменения
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Допустимые значения статуса
const ALLOWED_STATUS = ["DRAFT", "PENDING_APPROVAL", "APPROVED", "IN_PROGRESS", "IMPLEMENTED", "CANCELLED"];

// Обработка POST-запроса на смену статуса
export async function POST(req: Request) {
  const { id, status } = await req.json(); // Получаем id изменения и новый статус
  if (!id || !status) {
    // Проверка наличия необходимых данных
    return NextResponse.json({ error: "Нет id или статуса" }, { status: 400 });
  }
  if (!ALLOWED_STATUS.includes(status)) {
    // Проверка корректности значения статуса
    return NextResponse.json({ error: "Некорректный статус" }, { status: 400 });
  }
  try {
    const updated = await prisma.change.update({
      where: { id },
      data: { status },
    }); // Обновляем статус
    return NextResponse.json({ success: true, change: updated });
  } catch (e) {
    // Обработка ошибок
    return NextResponse.json({ error: "Ошибка при смене статуса", details: String(e) }, { status: 500 });
  }
} 