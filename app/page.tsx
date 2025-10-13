import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, HelpCircle, GitBranch } from "lucide-react"
import { prisma } from "@/lib/prisma"
import type { IncidentWithUsers, RequestWithUsers } from "@/app/types/change"

export const revalidate = 60

// Главная страница (дашборд)
// Получение статистики для дашборда
async function getDashboardStats() {
  // Получаем статистику по инцидентам, запросам и изменениям
  const [totalIncidents, openIncidents, totalRequests, openRequests, totalChanges, pendingChanges] = await prisma.$transaction([
    prisma.incident.count(),
    prisma.incident.count({ where: { status: "OPEN" } }),
    prisma.request.count(),
    prisma.request.count({ where: { status: "OPEN" } }),
    prisma.change.count(),
    prisma.change.count({ where: { status: "PENDING_APPROVAL" } }),
  ])

  return {
    totalIncidents,
    openIncidents,
    totalRequests,
    openRequests,
    totalChanges,
    pendingChanges,
  }
}

// Получение последних инцидентов
async function getRecentIncidents() {
  return prisma.incident.findMany({
    take: 5,
    orderBy: {
      createdAt: "desc"
    },
    include: {
      assignedTo: true,
      createdBy: true,
    },
  })
}

// Получение последних запросов
async function getRecentRequests() {
  return prisma.request.findMany({
    take: 5,
    orderBy: {
      createdAt: "desc"
    },
    include: {
      assignedTo: true,
      createdBy: true,
    },
  })
}

// Главная страница дашборда
export default async function Dashboard() {
  const stats = await getDashboardStats()
  const recentIncidents = await getRecentIncidents()
  const recentRequests = await getRecentRequests()

  // Получение бейджа статуса
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OPEN":
        return <Badge variant="destructive">Открыт</Badge>
      case "IN_PROGRESS":
        return <Badge variant="secondary">В работе</Badge>
      case "RESOLVED":
        return <Badge variant="default">Решен</Badge>
      case "CLOSED":
        return <Badge variant="outline">Закрыт</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  // Получение бейджа приоритета
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return <Badge variant="destructive">Высокий</Badge>
      case "MEDIUM":
        return <Badge variant="secondary">Средний</Badge>
      case "LOW":
        return <Badge variant="outline">Низкий</Badge>
      default:
        return <Badge>{priority}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Добро пожаловать!</h1>
        <p className="text-gray-600">Обзор системы управления IT-услугами</p>
      </div>

      {/* Карточки статистики */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Инциденты</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalIncidents}</div>
            <p className="text-xs text-muted-foreground">{stats.openIncidents} открытых</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Запросы</CardTitle>
            <HelpCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRequests}</div>
            <p className="text-xs text-muted-foreground">{stats.openRequests} открытых</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Изменения</CardTitle>
            <GitBranch className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalChanges}</div>
            <p className="text-xs text-muted-foreground">{stats.pendingChanges} ожидают</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Последние инциденты */}
        <Card>
          <CardHeader>
            <CardTitle>Последние инциденты</CardTitle>
            <CardDescription>Недавно созданные инциденты</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentIncidents.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Нет инцидентов</p>
              ) : (
                recentIncidents.map((incident: IncidentWithUsers) => (
                  <div key={incident.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{incident.title}</h4>
                      <p className="text-sm text-gray-600">Создал: {(incident.createdBy?.firstName || "") + " " + (incident.createdBy?.lastName || "")}</p>
                      <p className="text-sm text-gray-600">Назначен: {(() => { const a = incident.assignedTo; if (!a) return "Не назначен"; const name = `${a.firstName || ""} ${a.lastName || ""}`.trim(); return name || a.email || "Не назначен"; })()}</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      {getStatusBadge(incident.status)}
                      {getPriorityBadge(incident.priority)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Последние запросы */}
        <Card>
          <CardHeader>
            <CardTitle>Последние запросы</CardTitle>
            <CardDescription>Недавно созданные запросы</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentRequests.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Нет запросов</p>
              ) : (
                recentRequests.map((request: RequestWithUsers) => (
                  <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{request.title}</h4>
                      <p className="text-sm text-gray-600">Создал: {(request.createdBy?.firstName || "") + " " + (request.createdBy?.lastName || "")}</p>
                      <p className="text-sm text-gray-600">Назначен: {(() => { const a = request.assignedTo; if (!a) return "Не назначен"; const name = `${a.firstName || ""} ${a.lastName || ""}`.trim(); return name || a.email || "Не назначен"; })()}</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      {getStatusBadge(request.status)}
                      {getPriorityBadge(request.priority)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
