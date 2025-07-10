import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { id, userId } = await req.json();
  if (!id || !userId) {
    return NextResponse.json({ error: "Нет id или userId" }, { status: 400 });
  }
  try {
    const updated = await prisma.incident.update({
      where: { id },
      data: { assignedToId: userId },
    });
    return NextResponse.json({ success: true, incident: updated });
  } catch (e) {
    return NextResponse.json({ error: "Ошибка при назначении исполнителя", details: String(e) }, { status: 500 });
  }
} 