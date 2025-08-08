"use client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import ChangesAdminActions from './ChangesAdminActions';
import { useState, useMemo } from 'react'
import { Badge } from '@/components/ui/badge';
import { GitBranch, Pencil } from 'lucide-react';

function getStatusBadge(status: string) {
  switch (status) {
    case "PENDING_APPROVAL":
      return <span className="px-2 py-1 rounded bg-yellow-400 text-white text-xs font-bold">Ожидание одобрения</span>;
    case "APPROVED":
      return <span className="px-2 py-1 rounded bg-green-500 text-white text-xs font-bold">Одобрен</span>;
    case "REJECTED":
      return <span className="px-2 py-1 rounded bg-red-600 text-white text-xs font-bold">Отклонён</span>;
    case "IN_PROGRESS":
      return <span className="px-2 py-1 rounded bg-blue-400 text-white text-xs font-bold">В работе</span>;
    case "IMPLEMENTED":
      return <span className="px-2 py-1 rounded bg-blue-600 text-white text-xs font-bold">Внедрено</span>;
    case "CANCELLED":
      return <span className="px-2 py-1 rounded bg-gray-400 text-white text-xs font-bold">Отменено</span>;
    case "DRAFT":
      return <span className="px-2 py-1 rounded bg-gray-200 text-gray-700 text-xs font-bold">Черновик</span>;
    default:
      return <span className="px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs">{status}</span>;
  }
}

function getPriorityBadge(priority: string) {
  switch (priority) {
    case "CRITICAL":
      return <Badge variant="destructive">Критический</Badge>;
    case "HIGH":
      return <Badge variant="destructive">Высокий</Badge>;
    case "MEDIUM":
      return <Badge variant="secondary">Средний</Badge>;
    case "LOW":
      return <Badge variant="outline">Низкий</Badge>;
    default:
      return <Badge>{priority}</Badge>;
  }
}

function getCardClassByStatus(status: string) {
  switch (status) {
    case "PENDING":
      return "border-l-4 border-yellow-400 bg-yellow-50";
    case "APPROVED":
      return "border-l-4 border-green-500 bg-green-50";
    case "REJECTED":
      return "border-l-4 border-red-600 bg-red-50";
    case "IMPLEMENTED":
      return "border-l-4 border-blue-600 bg-blue-50";
    default:
      return "border-l-4 border-gray-200 bg-white";
  }
}

export default function ChangesListClient({ changes, isAdmin, assignees }: { changes: any[], isAdmin: boolean, assignees: any[] }) {
  const [changesState, setChangesState] = useState<any[]>(changes)
  const list = changesState
  if (!list || list.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <GitBranch className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Нет изменений</h3>
          <p className="text-gray-500 text-center mb-4">Изменения еще не созданы. Создайте первое изменение.</p>
        </CardContent>
      </Card>
    );
  }
  return (
    <div className="space-y-4">
      {list.map((change: any) => (
        <Card key={change.id} className={getCardClassByStatus(change.status) + " relative"}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{change.title}</CardTitle>
              <div className="flex gap-2">
                {getStatusBadge(change.status)}
                {getPriorityBadge(change.priority)}
              </div>
              {isAdmin && (
                <button
                  className="absolute top-2 right-2 h-7 w-7 border rounded text-xs flex items-center justify-center bg-white/70 hover:bg-white"
                  aria-label="Редактировать"
                  onClick={(e) => {
                    e.stopPropagation();
                    const ev = new CustomEvent('open-change-edit', { detail: { id: change.id } });
                    window.dispatchEvent(ev);
                  }}
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              )}
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
            {isAdmin && (
              <ChangesAdminActions
                change={change}
                assignees={assignees}
                onUpdated={(patch: any) => {
                  setChangesState(arr => arr.map(c => c.id === change.id ? { ...c, ...patch, assignedTo: patch.assignedTo ?? c.assignedTo } : c))
                }}
              />
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 