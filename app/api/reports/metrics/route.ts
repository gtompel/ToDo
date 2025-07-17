import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  // Инциденты
  const totalIncidents = await prisma.incident.count()
  const openIncidents = await prisma.incident.count({ where: { status: "OPEN" } })
  const closedIncidents = await prisma.incident.count({ where: { status: "CLOSED" } })

  // Среднее время решения инцидентов (в часах, вручную)
  const closed = await prisma.incident.findMany({
    where: { status: "CLOSED", resolvedAt: { not: null } },
    select: { createdAt: true, resolvedAt: true }
  })
  let avgIncidentResolution = null
  if (closed.length > 0) {
    const totalMs = closed.reduce((sum: number, i: { createdAt: Date; resolvedAt: Date }) => sum + (i.resolvedAt.getTime() - i.createdAt.getTime()), 0)
    avgIncidentResolution = (totalMs / closed.length / 1000 / 60 / 60).toFixed(2)
  }

  // Детализация по статусам и категориям
  const incidentStatus = await prisma.incident.groupBy({
    by: ["status"],
    _count: { _all: true }
  })
  const incidentCategory = await prisma.incident.groupBy({
    by: ["category"],
    _count: { _all: true }
  })

  // Заявки
  const totalRequests = await prisma.request.count()
  const openRequests = await prisma.request.count({ where: { status: "OPEN" } })
  const closedRequests = await prisma.request.count({ where: { status: "CLOSED" } })
  const requestStatus = await prisma.request.groupBy({
    by: ["status"],
    _count: { _all: true }
  })
  const requestCategory = await prisma.request.groupBy({
    by: ["category"],
    _count: { _all: true }
  })

  // Изменения
  const totalChanges = await prisma.change.count()
  const pendingChanges = await prisma.change.count({ where: { status: "PENDING_APPROVAL" } })
  const implementedChanges = await prisma.change.count({ where: { status: "IMPLEMENTED" } })
  const approvedChanges = await prisma.change.count({ where: { status: "APPROVED" } })
  const changeStatus = await prisma.change.groupBy({
    by: ["status"],
    _count: { _all: true }
  })
  const changeCategory = await prisma.change.groupBy({
    by: ["category"],
    _count: { _all: true }
  })

  // SLA (процент инцидентов, решённых за 8 часов)
  const slaIncidents = closed.filter((i: { createdAt: Date; resolvedAt: Date }) => (i.resolvedAt.getTime() - i.createdAt.getTime()) <= 8 * 60 * 60 * 1000).length
  const slaPercent = totalIncidents > 0 ? Math.round((slaIncidents / totalIncidents) * 100) : 0

  // --- Группировка по исполнителям (assignedTo) ---
  // Инциденты
  let incidentByAssignee = await prisma.incident.groupBy({
    by: ["assignedToId"],
    _count: { _all: true },
    where: { assignedToId: { not: null } },
  })
  incidentByAssignee = incidentByAssignee.sort((a: any, b: any) => b._count._all - a._count._all).slice(0, 5)
  // Заявки
  let requestByAssignee = await prisma.request.groupBy({
    by: ["assignedToId"],
    _count: { _all: true },
    where: { assignedToId: { not: null } },
  })
  requestByAssignee = requestByAssignee.sort((a: any, b: any) => b._count._all - a._count._all).slice(0, 5)
  // Изменения
  let changeByAssignee = await prisma.change.groupBy({
    by: ["assignedToId"],
    _count: { _all: true },
    where: { assignedToId: { not: null } },
  })
  changeByAssignee = changeByAssignee.sort((a: any, b: any) => b._count._all - a._count._all).slice(0, 5)
  // --- Группировка по департаментам ---
  // Удаляю блоки:
  // let incidentByDepartment = await prisma.incident.groupBy ...
  // let requestByDepartment = await prisma.request.groupBy ...
  // let changeByDepartment = await prisma.change.groupBy ...
  // и их сортировки/фильтрации

  return NextResponse.json({
    totalIncidents,
    openIncidents,
    closedIncidents,
    avgIncidentResolution,
    totalRequests,
    openRequests,
    closedRequests,
    totalChanges,
    pendingChanges,
    implementedChanges,
    approvedChanges,
    slaPercent,
    // Детализация
    incidentStatus,
    incidentCategory,
    requestStatus,
    requestCategory,
    changeStatus,
    changeCategory,
    incidentByAssignee,
    requestByAssignee,
    changeByAssignee,
    // Удаляю incidentByDepartment, requestByDepartment, changeByDepartment
  })
} 