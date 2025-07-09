
import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, HelpCircle } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { updateRequestStatus, updateRequestPriority, deleteRequestById, assignRequestToUser } from "@/lib/actions/requests"
import { useTransition } from "react"
import { getAssignableUsers } from "@/lib/actions/users"
import { ChevronDown, ChevronRight } from "lucide-react"

import { getStatusBadge, getPriorityBadge, renderRequestDetails, formatRequestId, STATUS_OPTIONS, PRIORITY_OPTIONS } from "./RequestsListHelpers"
import RequestsListClient from "./RequestsListClient"
export { updateRequestStatus, updateRequestPriority, deleteRequestById, assignRequestToUser } from "@/lib/actions/requests"

async function getRequests() {
  return prisma.request.findMany({
    include: {
      assignedTo: true,
      createdBy: true,
    },
    orderBy: { createdAt: "desc" },
  })
}

function RequestsFilterPanel({ departments, filter, setFilter }: any) {
  return (
    <div className="flex flex-wrap gap-4 mb-4 items-end">
      <div>
        <label className="block text-xs mb-1">Отдел</label>
        <select
          className="border rounded px-2 py-1"
          value={filter.department}
          onChange={e => setFilter((f: any) => ({ ...f, department: e.target.value }))}
        >
          <option value="">Все</option>
          {departments.map((d: string) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs mb-1">Поиск по фамилии</label>
        <input
          className="border rounded px-2 py-1"
          type="text"
          placeholder="Фамилия..."
          value={filter.lastName}
          onChange={e => setFilter((f: any) => ({ ...f, lastName: e.target.value }))}
        />
      </div>
    </div>
  )
}

async function RequestsList({ isAdmin }: { isAdmin: boolean }) {
  const requests = await getRequests()
  const assignableUsers = isAdmin ? await getAssignableUsers() : []
  return <RequestsListClient requests={requests} isAdmin={isAdmin} assignableUsers={assignableUsers} />
}

export default async function RequestsPage() {
  const user = await getCurrentUser()
  const isAdmin = user && (user.role === "ADMIN" || user.role === "MANAGER")

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
        <RequestsList isAdmin={isAdmin} />
      </Suspense>
    </div>
  )
}
