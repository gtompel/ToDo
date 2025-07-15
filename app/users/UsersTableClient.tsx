import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Users, Edit, MoreHorizontal, Phone, BadgeIcon as IdCard } from "lucide-react";
import { useState } from 'react';

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

function getRoleLabel(role: string) {
  switch (role) {
    case "ADMIN": return "Администратор";
    case "MANAGER": return "Менеджер";
    case "TECHNICIAN": return "Техник";
    case "USER": return "Пользователь";
    default: return role;
  }
}

export default function UsersTableClient({ users }: { users: User[] }) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const pageCount = Math.ceil(users.length / pageSize);
  const pagedUsers = users.slice((page - 1) * pageSize, page * pageSize);
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
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
            <TableRow key={user.id} className="hover:bg-gray-50">
              <TableCell className="text-center font-medium">{(page - 1) * pageSize + index + 1}</TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-gray-400" />
                  <div>
                    <div className="font-medium">
                      {user.lastName} {user.firstName} {user.middleName}
                    </div>
                    <div className="text-sm text-gray-500">{user.position}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <IdCard className="w-4 h-4 text-gray-400" />
                  <span>1001</span>
                </div>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{user.phone || "—"}</span>
                </div>
              </TableCell>
              <TableCell>
                <Link
                  href={`mailto:${user.email}`}
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  {user.email}
                </Link>
              </TableCell>
              <TableCell className="text-center">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {getRoleLabel(user.role)}
                </Badge>
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
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {/* Pagination UI */}
      <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
        <div className="text-sm text-gray-600">
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
          <span className="text-sm text-gray-600">/ стр.</span>
        </div>
      </div>
    </div>
  );
} 