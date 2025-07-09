import { NextResponse } from "next/server"
import { updateRequestStatus } from "@/lib/actions/requests"

export async function POST(req: Request) {
  const { id, status } = await req.json()
  const result = await updateRequestStatus(id, status)
  if (result?.success) return Response.json({ success: true })
  return Response.json({ error: result?.error || "Ошибка" }, { status: 400 })
} 