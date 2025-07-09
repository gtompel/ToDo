import { NextResponse } from "next/server"
import { updateRequestStatus } from "@/lib/actions/requests"

export async function POST(req: Request) {
  const { id, status } = await req.json()
  if (!id || !status) return NextResponse.json({ error: "Нет id или статуса" }, { status: 400 })
  const result = await updateRequestStatus(id, status)
  if (result?.error) return NextResponse.json({ error: result.error }, { status: 400 })
  return NextResponse.json({ success: true })
} 