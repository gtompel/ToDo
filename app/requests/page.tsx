import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import { getAssignableUsers } from "@/lib/actions/users"
import RequestsListWrapper from "./RequestsListWrapper"
import { getRequests } from "@/lib/actions/requests"

export interface RequestItem {
  id: string
  description: string
  priority: string
  status: string
  createdAt: string
  category: string
  acknowledgmentFile: string
  // дополнительные поля
  [key: string]: unknown
}

interface SearchParams {
  [key: string]: string | string[] | undefined
}

function parsePageParam(val: string | string[] | undefined, fallback: number) {
  const raw = Array.isArray(val) ? val[0] : val
  const n = raw ? Number(raw) : NaN
  return Number.isInteger(n) && n > 0 ? n : fallback
}

function normalizeRequests(items: Partial<RequestItem>[]): RequestItem[] {
  return items.map((r) => ({
    id: String(r.id ?? ""),
    description: String(r.description ?? ""),
    priority: String(r.priority ?? ""),
    status: String(r.status ?? ""),
    createdAt: String(r.createdAt ?? ""),
    category: r.category ?? "",
    acknowledgmentFile: r.acknowledgmentFile ?? "",
    ...r,
  }))
}

export default async function RequestsPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await getCurrentUser()
  const isAdmin = Boolean(user && (user.role === "ADMIN" || user.role === "MANAGER"))

  const page = parsePageParam(searchParams?.page, 1)
  const pageSize = parsePageParam(searchParams?.pageSize, 10)

  const requestsPromise = getRequests(page, pageSize)
  const assignableUsersPromise = isAdmin ? getAssignableUsers() : Promise.resolve([])

  const [{ data: requests = [], total = 0 }, assignableUsers] = await Promise.all([
    requestsPromise,
    assignableUsersPromise,
  ])

  const normalized = normalizeRequests(requests as Partial<RequestItem>[])

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

      <RequestsListWrapper
        requests={normalized}
        isAdmin={isAdmin}
        assignableUsers={assignableUsers}
        total={total}
        page={page}
        pageSize={pageSize}
      />
    </div>
  )
}
