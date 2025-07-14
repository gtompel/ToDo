import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest, params: any) {
  const { id } = await params
  const resource = await prisma.iTResource.findUnique({ where: { id } })
  if (!resource) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ resource })
}

export async function PUT(req: NextRequest, params: any) {
  const { id } = await params
  const data = await req.json()
  const resource = await prisma.iTResource.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      owner: data.owner,
      source: data.source,
      roles: data.roles,
      note: data.note || null,
    },
  })
  return NextResponse.json({ resource })
}

export async function DELETE(req: NextRequest, params: any) {
  const { id } = await params
  await prisma.iTResource.delete({ where: { id } })
  return NextResponse.json({ ok: true })
} 