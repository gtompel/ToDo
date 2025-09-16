
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import { getAssignableUsers } from "@/lib/actions/users"
import RequestsListWrapper from './RequestsListWrapper'

import { getRequests } from '@/lib/actions/requests';
import { cookies } from 'next/headers';

import { useSearchParams } from 'next/navigation';

type SearchParams = { [key: string]: string | string[] | undefined };

function parseIntOrDefault(val: string | string[] | undefined, def: number) {
  const n = parseInt(Array.isArray(val) ? val[0] : val ?? '', 10);
  return isNaN(n) ? def : n;
}

export default async function RequestsPage({ searchParams }: { searchParams: SearchParams }) {
  searchParams = await searchParams;
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
