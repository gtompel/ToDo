import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ALLOWED_PRIORITY = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export async function POST(req: Request) {
  const { id, priority } = await req.json();
  if (!id || !priority) {
    return NextResponse.json({ error: "Нет id или приоритета" }, { status: 400 });
  }
  if (!ALLOWED_PRIORITY.includes(priority)) {
    return NextResponse.json({ error: "Некорректный приоритет" }, { status: 400 });
  }
  try {
    const updated = await prisma.incident.update({
      where: { id },
      data: { priority },
    });
    return NextResponse.json({ success: true, incident: updated });
  } catch (e) {
    return NextResponse.json({ error: "Ошибка при смене приоритета", details: String(e) }, { status: 500 });
  }
} 