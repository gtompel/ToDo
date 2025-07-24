
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
import RequestsListWrapper from './RequestsListWrapper';

import { getStatusBadge, getPriorityBadge, renderRequestDetails, formatRequestId, STATUS_OPTIONS, PRIORITY_OPTIONS } from "./RequestsListHelpers"
// Удаляю обычный импорт RequestsListClient
// const RequestsListClient = dynamic(() => import('./RequestsListClient'), { loading: () => <div>Загрузка таблицы заявок...</div>, ssr: false });
// Удаляю все упоминания dynamic, RequestsListClient и ssr: false

import { getRequests } from '@/lib/actions/requests';
import { cookies } from 'next/headers';

import { useSearchParams } from 'next/navigation';

function parseIntOrDefault(val: any, def: number) {
  const n = parseInt(val, 10);
  return isNaN(n) ? def : n;
}

export default async function RequestsPage({ searchParams }: { searchParams: any }) {
  const user = await getCurrentUser()
  const isAdmin = user && (user.role === "ADMIN" || user.role === "MANAGER")

  const page = parseIntOrDefault(searchParams?.page, 1);
  const pageSize = parseIntOrDefault(searchParams?.pageSize, 10);

  const { data: requests, total } = await getRequests(page, pageSize);
  const assignableUsers = isAdmin ? await getAssignableUsers() : [];

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
        requests={requests} 
        isAdmin={isAdmin} 
        assignableUsers={assignableUsers} 
        total={total}
        page={page}
        pageSize={pageSize}
      />
    </div>
  )
}
