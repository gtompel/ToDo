import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, HelpCircle } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

async function getRequests() {
  return prisma.request.findMany({
    include: {
      assignedTo: true,
      createdBy: true,
    },
    orderBy: { createdAt: "desc" },
  })
}

function getStatusBadge(status: string) {
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

function getPriorityBadge(priority: string) {
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

async function RequestsList() {
  const requests = await getRequests()

  if (requests.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <HelpCircle className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Нет запросов</h3>
          <p className="text-gray-500 text-center mb-4">Запросы еще не созданы. Создайте первый запрос.</p>
          <Button asChild>
            <Link href="/requests/new">
              <Plus className="mr-2 h-4 w-4" />
              Создать запрос
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {requests.map((request: any) => (
        <Card key={request.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{request.title}</CardTitle>
              <div className="flex gap-2">
                {getStatusBadge(request.status)}
                {getPriorityBadge(request.priority)}
              </div>
            </div>
            <CardDescription>
              ID: {request.id} • Создан: {new Date(request.createdAt).toLocaleDateString("ru-RU")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">{request.description}</p>
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div>
                <span className="font-medium">Создал:</span> {request.createdBy?.firstName} {request.createdBy?.lastName}
              </div>
              <div>
                <span className="font-medium">Назначен:</span> {request.assignedTo ? `${request.assignedTo.firstName} ${request.assignedTo.lastName}` : "Не назначен"}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default async function RequestsPage() {
  const user = await getCurrentUser()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Запросы</h1>
          <p className="text-gray-600">Управление запросами на обслуживание</p>
        </div>
        <Button asChild>
          <Link href="/requests/new">
            <Plus className="mr-2 h-4 w-4" />
            Создать запрос
          </Link>
        </Button>
      </div>

      <Suspense fallback={<div>Загрузка...</div>}>
        <RequestsList />
      </Suspense>
    </div>
  )
}
