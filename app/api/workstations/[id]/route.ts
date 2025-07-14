import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const workstation = await prisma.workstation.findUnique({ where: { id }, include: { user: true } })
  if (!workstation) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ workstation })
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const data = await req.json()
  const workstation = await prisma.workstation.update({
    where: { id },
    data,
    include: { user: true }
  })
  return NextResponse.json({ workstation })
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  await prisma.workstation.delete({ where: { id } })
  return NextResponse.json({ ok: true })
} 