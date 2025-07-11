import { NextResponse } from "next/server";
import { assignChangeToUser } from "@/lib/actions/changes";

export async function POST(req: Request) {
  const { id, userId } = await req.json();
  if (!id || !userId) {
    return NextResponse.json({ error: "Нет id или userId" }, { status: 400 });
  }
  try {
    const result = await assignChangeToUser(id, userId);
    if (result?.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Ошибка при назначении исполнителя", details: String(e) }, { status: 500 });
  }
} 