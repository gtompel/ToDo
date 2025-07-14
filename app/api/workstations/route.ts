import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const workstations = await prisma.workstation.findMany({ orderBy: { createdAt: "desc" }, include: { user: true } })
  return NextResponse.json({ workstations })
}

export async function POST(req: NextRequest) {
  const data = await req.json()
  const workstation = await prisma.workstation.create({
    data: {
      name: data.name,
      description: data.description,
      userId: data.userId || null,
      ip: data.ip || null,
      status: data.status || "active",
    },
  })
  return NextResponse.json({ workstation })
} 