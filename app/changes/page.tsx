// Импортируем необходимые компоненты и функции
import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, GitBranch, ChevronDown } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import ChangesAdminActions from "./ChangesAdminActions"
import { getAssignableUsers } from "@/lib/actions/users"

// Получение всех изменений из базы данных
async function getChanges() {
  return prisma.change.findMany({
    include: {
      assignedTo: true,
      createdBy: true,
    },
    orderBy: { createdAt: "desc" },
  })
}

// Получение бейджа статуса для отображения
function getStatusBadge(status: string) {
  switch (status) {
    case "PENDING":
      return <span className="px-2 py-1 rounded bg-yellow-400 text-white text-xs font-bold">Ожидает</span>
    case "APPROVED":
      return <span className="px-2 py-1 rounded bg-green-500 text-white text-xs font-bold">Одобрен</span>
    case "REJECTED":
      return <span className="px-2 py-1 rounded bg-red-600 text-white text-xs font-bold">Отклонен</span>
    case "IMPLEMENTED":
      return <span className="px-2 py-1 rounded bg-blue-600 text-white text-xs font-bold">Внедрен</span>
    default:
      return <span className="px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs">{status}</span>
  }
}

// Получение бейджа риска (используется для приоритета)
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

function getCardClassByStatus(status: string) {
  switch (status) {
    case "PENDING":
      return "border-l-4 border-yellow-400 bg-yellow-50"
    case "APPROVED":
      return "border-l-4 border-green-500 bg-green-50"
    case "REJECTED":
      return "border-l-4 border-red-600 bg-red-50"
    case "IMPLEMENTED":
      return "border-l-4 border-blue-600 bg-blue-50"
    default:
      return "border-l-4 border-gray-200 bg-white"
  }
}

// Компонент списка изменений
async function ChangesList({ isAdmin, assignees }: { isAdmin: boolean, assignees: any[] }) {
  const changes = await getChanges()

  // Если изменений нет, показываем заглушку
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

  // Отображаем список изменений
  return (
    <div className="space-y-4">
      {changes.map((change: any) => (
        <Card key={change.id} className={getCardClassByStatus(change.status)}>
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
            {/* Административные действия доступны только админу */}
            {isAdmin && <ChangesAdminActions change={change} assignees={assignees} />}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Главная страница управления изменениями
export default async function ChangesPage() {
  const user = await getCurrentUser() // Получаем текущего пользователя
  const isAdmin = user?.role === "ADMIN" // Проверяем, админ ли пользователь
  const assignees = await getAssignableUsers() // Получаем список пользователей для назначения

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

      {/* Список изменений с поддержкой Suspense */}
      <Suspense fallback={<div>Загрузка...</div>}>
        <ChangesList isAdmin={isAdmin} assignees={assignees} />
      </Suspense>
    </div>
  )
}
