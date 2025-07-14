import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const resources = await prisma.iTResource.findMany({ orderBy: { createdAt: "desc" } })
  return NextResponse.json({ resources })
}

export async function POST(req: NextRequest) {
  const data = await req.json()
  const resource = await prisma.iTResource.create({
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