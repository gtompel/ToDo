import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Users, Edit, MoreHorizontal, Phone, BadgeIcon as IdCard } from "lucide-react";
import { useState } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string | null;
  phone?: string | null;
  position?: string | null;
  department?: string | null;
  role: string;
  status?: string;
  isActive: boolean;
  lastLogin?: Date | null;
  createdAt: Date;
}

function getRoleBadge(role: string) {
  switch (role) {
    case "ADMIN":
      return <span className="inline-block px-3 py-1 rounded-full bg-primary text-primary-foreground font-semibold text-xs">Администратор</span>;
    case "MANAGER":
      return <span className="inline-block px-3 py-1 rounded-full bg-purple-600 text-white font-semibold text-xs">Менеджер</span>;
    case "TECHNICIAN":
      return <span className="inline-block px-3 py-1 rounded-full bg-yellow-400 text-black font-semibold text-xs">Техник</span>;
    case "USER":
    default:
      return <span className="inline-block px-3 py-1 rounded-full bg-muted text-muted-foreground font-semibold text-xs">Пользователь</span>;
  }
}

const ROLES = [
  { value: 'USER', label: 'Пользователь' },
  { value: 'TECHNICIAN', label: 'Техник' },
  { value: 'MANAGER', label: 'Менеджер' },
  { value: 'ADMIN', label: 'Администратор' },
];

export default function UsersTableClient({ users }: { users: User[] }) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const pageCount = Math.ceil(users.length / pageSize);
  const pagedUsers = users.slice((page - 1) * pageSize, page * pageSize);

  // Состояния для модала изменения роли
  const [roleModalUser, setRoleModalUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState('USER');
  const [savingRole, setSavingRole] = useState(false);

  const handleOpenRoleModal = (user: User) => {
    setRoleModalUser(user);
    setNewRole(user.role);
  };
  const handleCloseRoleModal = () => {
    setRoleModalUser(null);
  };
  const handleSaveRole = async () => {
    if (!roleModalUser) return;
    setSavingRole(true);
    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: roleModalUser.id, role: newRole, action: 'update' }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Ошибка обновления роли');
      toast({ title: 'Роль обновлена', description: `Роль пользователя изменена на ${ROLES.find(r => r.value === newRole)?.label}` });
      setRoleModalUser(null);
      // Можно добавить обновление данных через SWR или refetch
      window.location.reload();
    } catch (e: any) {
      toast({ title: 'Ошибка', description: e.message, variant: 'destructive' });
    } finally {
      setSavingRole(false);
    }
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted">
            <TableHead className="w-12 text-center">№</TableHead>
            <TableHead>ФИО</TableHead>
            <TableHead className="text-center">Табельный номер</TableHead>
            <TableHead className="text-center">Телефон</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="text-center">Роли</TableHead>
            <TableHead className="text-center">Отдел</TableHead>
            <TableHead className="text-center">Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pagedUsers.map((user, index) => (
            <TableRow key={user.id} className="hover:bg-muted">
              <TableCell className="text-center font-medium">{(page - 1) * pageSize + index + 1}</TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <div>
                    <div className="font-medium">
                      {user.lastName} {user.firstName} {user.middleName}
                    </div>
                    <div className="text-sm text-muted-foreground">{user.position}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <IdCard className="w-4 h-4 text-muted-foreground" />
                  <span>1001</span>
                </div>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{user.phone || "—"}</span>
                </div>
              </TableCell>
              <TableCell>
                <Link
                  href={`mailto:${user.email}`}
                  className="text-primary hover:text-primary/80 flex items-center gap-1"
                >
                  {user.email}
                </Link>
              </TableCell>
              <TableCell className="text-center">
                {getRoleBadge(user.role)}
              </TableCell>
              <TableCell className="text-center">{user.department || "—"}</TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-400 hover:text-blue-600"
                    asChild
                  >
                    <Link href={`/users/${user.id}`}>
                      <Edit className="w-4 h-4" />
                    </Link>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleOpenRoleModal(user)}>
                        Изменить роль
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {/* Pagination UI */}
      <div className="flex items-center justify-between px-6 py-4 border-t bg-muted">
        <div className="text-sm text-muted-foreground">
          {users.length === 0 ? 'Нет записей' : `${(page - 1) * pageSize + 1}-${Math.min(page * pageSize, users.length)} из ${users.length} записей`}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setPage(1)} disabled={page === 1} className="px-2 py-1 border rounded disabled:opacity-50">«</button>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-2 py-1 border rounded disabled:opacity-50">‹</button>
          <span className="text-sm">{page} / {pageCount}</span>
          <button onClick={() => setPage(p => Math.min(pageCount, p + 1))} disabled={page === pageCount} className="px-2 py-1 border rounded disabled:opacity-50">›</button>
          <button onClick={() => setPage(pageCount)} disabled={page === pageCount} className="px-2 py-1 border rounded disabled:opacity-50">»</button>
          <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }} className="ml-2 px-2 py-1 border rounded">
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span className="text-sm text-muted-foreground">/ стр.</span>
        </div>
      </div>
      {/* Модал изменения роли */}
      <Dialog open={!!roleModalUser} onOpenChange={open => !open && handleCloseRoleModal()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Изменить роль пользователя</DialogTitle>
            <DialogDescription>Выберите новую роль для пользователя и нажмите "Сохранить".</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block mb-1 text-sm">Роль</label>
              <select
                className="border rounded px-2 py-1 w-full"
                value={newRole}
                onChange={e => setNewRole(e.target.value)}
                disabled={savingRole}
              >
                {ROLES.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveRole} disabled={savingRole}>
              {savingRole ? 'Сохранение...' : 'Сохранить'}
            </Button>
            <Button variant="ghost" onClick={handleCloseRoleModal} disabled={savingRole}>Отмена</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 