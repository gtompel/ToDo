import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const paths = url.pathname.split("/")
  const userId = paths[paths.indexOf("users") + 1]
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })
  const logs = await prisma.activityLog.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 20,
  })
  return NextResponse.json({ logs })
}
