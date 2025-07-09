import { NextResponse } from "next/server"
import { assignRequestToUser } from "@/lib/actions/requests"

export async function POST(req: Request) {
  const { id, userId } = await req.json()
  if (!id || !userId) return NextResponse.json({ error: "Нет id или userId" }, { status: 400 })
  const result = await assignRequestToUser(id, userId)
  if (result?.error) return NextResponse.json({ error: result.error }, { status: 400 })
  return NextResponse.json({ success: true })
} 