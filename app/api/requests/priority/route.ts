import { NextResponse } from "next/server"
import { updateRequestPriority } from "@/lib/actions/requests"

export async function POST(req: Request) {
  const { id, priority } = await req.json()
  if (!id || !priority) return NextResponse.json({ error: "Нет id или приоритета" }, { status: 400 })
  const result = await updateRequestPriority(id, priority)
  if (result?.error) return NextResponse.json({ error: result.error }, { status: 400 })
  return NextResponse.json({ success: true })
} 