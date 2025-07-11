import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ALLOWED_STATUS = ["DRAFT", "PENDING_APPROVAL", "APPROVED", "IN_PROGRESS", "IMPLEMENTED", "CANCELLED"];

export async function POST(req: Request) {
  const { id, status } = await req.json();
  if (!id || !status) {
    return NextResponse.json({ error: "Нет id или статуса" }, { status: 400 });
  }
  if (!ALLOWED_STATUS.includes(status)) {
    return NextResponse.json({ error: "Некорректный статус" }, { status: 400 });
  }
  try {
    const updated = await prisma.change.update({
      where: { id },
      data: { status },
    });
    return NextResponse.json({ success: true, change: updated });
  } catch (e) {
    return NextResponse.json({ error: "Ошибка при смене статуса", details: String(e) }, { status: 500 });
  }
} 