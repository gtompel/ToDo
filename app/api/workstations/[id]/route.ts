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
  let updateData = { ...data }
  if (Object.prototype.hasOwnProperty.call(updateData, 'userId')) {
    if (updateData.userId) {
      updateData.user = { connect: { id: updateData.userId } }
    } else {
      updateData.user = { disconnect: true }
    }
    delete updateData.userId
  }
  const workstation = await prisma.workstation.update({
    where: { id },
    data: updateData,
    include: { user: true }
  })
  return NextResponse.json({ workstation })
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  await prisma.workstation.delete({ where: { id } })
  return NextResponse.json({ ok: true })
} 