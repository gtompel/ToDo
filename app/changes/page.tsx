import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, GitBranch } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

async function getChanges() {
  return prisma.change.findMany({
    include: {
      assignedTo: true,
      createdBy: true,
    },
    orderBy: { createdAt: "desc" },
  })
}

function getStatusBadge(status: string) {
  switch (status) {
    case "PENDING":
      return <Badge variant="secondary">Ожидает</Badge>
    case "APPROVED":
      return <Badge variant="default">Одобрен</Badge>
    case "REJECTED":
      return <Badge variant="destructive">Отклонен</Badge>
    case "IMPLEMENTED":
      return <Badge variant="outline">Внедрен</Badge>
    default:
      return <Badge>{status}</Badge>
  }
}

function getRiskBadge(risk: string) {
  switch (risk) {
    case "HIGH":
      return <Badge variant="destructive">Высокий</Badge>
    case "MEDIUM":
      return <Badge variant="secondary">Средний</Badge>
    case "LOW":
      return <Badge variant="outline">Низкий</Badge>
    default:
      return <Badge>{risk}</Badge>
  }
}

async function ChangesList() {
  const changes = await getChanges()

  if (changes.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <GitBranch className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Нет изменений</h3>
          <p className="text-gray-500 text-center mb-4">Изменения еще не созданы. Создайте первое изменение.</p>
          <Button asChild>
            <Link href="/changes/new">
              <Plus className="mr-2 h-4 w-4" />
              Создать изменение
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {changes.map((change: any) => (
        <Card key={change.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{change.title}</CardTitle>
              <div className="flex gap-2">
                {getStatusBadge(change.status)}
                {getRiskBadge(change.priority)}
              </div>
            </div>
            <CardDescription>
              ID: {change.id} • Создан: {new Date(change.createdAt).toLocaleDateString("ru-RU")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">{change.description}</p>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Создал:</span> {change.createdBy?.firstName} {change.createdBy?.lastName}
              </div>
              <div>
                <span className="font-medium">Назначен:</span> {change.assignedTo ? `${change.assignedTo.firstName} ${change.assignedTo.lastName}` : "Не назначен"}
              </div>
              <div>
                <span className="font-medium">Плановая дата:</span>{" "}
                {change.scheduledAt ? new Date(change.scheduledAt).toLocaleDateString("ru-RU") : "Не указана"}
              </div>
              <div>
                <span className="font-medium">Тип:</span> {change.category || "-"}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default async function ChangesPage() {
  const user = await getCurrentUser()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Управление изменениями</h1>
          <p className="text-gray-600">Планирование и контроль изменений в IT-инфраструктуре</p>
        </div>
        <Button asChild>
          <Link href="/changes/new">
            <Plus className="mr-2 h-4 w-4" />
            Создать изменение
          </Link>
        </Button>
      </div>

      <Suspense fallback={<div>Загрузка...</div>}>
        <ChangesList />
      </Suspense>
    </div>
  )
}
