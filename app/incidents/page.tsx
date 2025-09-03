
import Link from "next/link"
import { Button } from "@/components/ui/button"
//
import { Plus } from "lucide-react"

import { getCurrentUser } from "@/lib/auth"
import { getAssignableUsers } from "@/lib/actions/users"
import IncidentsListWrapper from "./IncidentsListWrapper";


export default async function IncidentsPage() {
  const user = await getCurrentUser();
  const isAdmin = user && user.role === "ADMIN";
  const assignableUsersRaw = isAdmin ? await getAssignableUsers() : [];
  const assignableUsers = assignableUsersRaw.map((user: { id: string; firstName: string; lastName: string; email?: string }) => ({
    id: user.id,
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    email: user.email || "",
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
