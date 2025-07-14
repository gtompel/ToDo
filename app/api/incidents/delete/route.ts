import { NextResponse } from "next/server"
import { deleteIncidentById } from "@/lib/actions/incidents"

export async function POST(req: Request) {
  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: "Нет id" }, { status: 400 })
  const result = await deleteIncidentById(id)
  if (result?.error) return NextResponse.json({ error: result.error }, { status: 400 })
  return NextResponse.json({ success: true })
} 