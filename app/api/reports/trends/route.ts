import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

function getDateNDaysAgo(days: number) {
  const d = new Date()
  d.setDate(d.getDate() - days)
  d.setHours(0, 0, 0, 0)
  return d
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const days = parseInt(searchParams.get("days") || "30", 10)
  const fromDate = getDateNDaysAgo(days)

  // Инциденты: создание и решение по дням
  const incidentsCreated = await prisma.incident.findMany({
    where: { createdAt: { gte: fromDate } },
    select: { createdAt: true },
  })
  const incidentsClosed = await prisma.incident.findMany({
    where: { resolvedAt: { gte: fromDate }, status: "CLOSED" },
    select: { resolvedAt: true },
  })

  // Считаем по дням
  const countByDay = (arr: { createdAt?: Date; resolvedAt?: Date }[], field: 'createdAt' | 'resolvedAt') => {
    const map: Record<string, number> = {}
    for (let i = 0; i <= days; i++) {
      const d = getDateNDaysAgo(days - i)
      const key = d.toISOString().slice(0, 10)
      map[key] = 0
    }
    arr.forEach(item => {
      const key = (item[field] as Date).toISOString().slice(0, 10)
      if (map[key] !== undefined) map[key]++
    })
    return map
  }

  const createdTrend = countByDay(incidentsCreated, 'createdAt')
  const closedTrend = countByDay((incidentsClosed.filter(i => i.resolvedAt !== null) as { resolvedAt: Date }[]), 'resolvedAt')

  // Группировка по дате (YYYY-MM-DD)
  const incidents = await prisma.incident.findMany({
    where: { createdAt: { gte: fromDate } },
    select: { createdAt: true },
  })
  const requests = await prisma.request.findMany({
    where: { createdAt: { gte: fromDate } },
    select: { createdAt: true },
  })
  const changes = await prisma.change.findMany({
    where: { createdAt: { gte: fromDate } },
    select: { createdAt: true },
  })

  // Считаем по дням
  const countByDaySimple = (arr: { createdAt: Date }[]) => {
    const map: Record<string, number> = {}
    for (let i = 0; i <= days; i++) {
      const d = getDateNDaysAgo(days - i)
      const key = d.toISOString().slice(0, 10)
      map[key] = 0
    }
    arr.forEach(item => {
      const key = item.createdAt.toISOString().slice(0, 10)
      if (map[key] !== undefined) map[key]++
    })
    return map
  }

  const incidentTrend = countByDaySimple(incidentsCreated)
  const requestTrend = countByDaySimple(requests)
  const changeTrend = countByDaySimple(changes)

  return NextResponse.json({
    labels: Object.keys(incidentTrend),
    incidents: Object.values(incidentTrend),
    requests: Object.values(requestTrend),
    changes: Object.values(changeTrend),
    incidentsCreated: Object.values(createdTrend),
    incidentsClosed: Object.values(closedTrend),
    total: {
      incidents: incidents.length,
      requests: requests.length,
      changes: changes.length,
    }
  })
} 