// app/changes/page.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { getAssignableUsers } from '@/lib/actions/users';
import ChangesListWrapper from './ChangesListWrapper';
import type { User } from '@/app/types/change';

export default async function ChangesPage() {
  const user = await getCurrentUser();
  const isAdmin = user?.role === 'ADMIN';
  const assignees: User[] = await getAssignableUsers();

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

      <ChangesListWrapper isAdmin={!!isAdmin} assignees={assignees} />
    </div>
  );
}
