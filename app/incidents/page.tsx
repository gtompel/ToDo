
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, AlertTriangle } from "lucide-react"

import { getCurrentUser } from "@/lib/auth"
import { getAssignableUsers } from "@/lib/actions/users"
import IncidentsListWrapper from "./IncidentsListWrapper";


function parseIntOrDefault(val: any, def: number) {
  const n = parseInt(val, 10);
  return isNaN(n) ? def : n;
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

export default async function IncidentsPage() {
  const user = await getCurrentUser();
  const isAdmin = user && user.role === "ADMIN";
  const assignableUsersRaw = isAdmin ? await getAssignableUsers() : [];
  const assignableUsers = assignableUsersRaw.map((user: { id: string; firstName: string; lastName: string }) => ({
    id: user.id,
    name: `${user.firstName} ${user.lastName}`,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Инциденты</h1>
          <p className="text-gray-600">Управление инцидентами и их решение</p>
        </div>
        <Button asChild>
          <Link href="/incidents/new">
            <Plus className="mr-2 h-4 w-4" />
            Создать инцидент
          </Link>
        </Button>
      </div>
      <IncidentsListWrapper 
        isAdmin={isAdmin}
        assignableUsers={assignableUsers}
      />
    </div>
  );
}
