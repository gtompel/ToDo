"use client"

import { useState, useMemo } from "react"
import { ChevronDown, ChevronRight, HelpCircle, Plus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getStatusBadge, getPriorityBadge, renderRequestDetails, formatRequestId, STATUS_OPTIONS, PRIORITY_OPTIONS } from "./RequestsListHelpers"
import { fetchWithTimeout } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"

function getCardClassByStatus(status: string) {
  switch (status) {
    case "OPEN":
      return "border-red-400 bg-red-50"
    case "IN_PROGRESS":
      return "border-yellow-400 bg-yellow-50"
    case "RESOLVED":
      return "border-green-400 bg-green-50"
    case "CLOSED":
      return "border-gray-300 bg-gray-50"
    default:
      return "border-gray-200 bg-white"
  }
}

// Компонент для отображения и управления списком запросов
export default function RequestsListClient({ requests, isAdmin, assignableUsers }: any) {
  // Состояние для отслеживания загрузки по id запроса и действию
  const [open, setOpen] = useState<string[]>([])
  const [filter, setFilter] = useState({ department: "", lastName: "" })
  const [loadingId, setLoadingId] = useState<string | null>(null)

  // Фильтрация
  const filtered = useMemo(() => {
    return requests.filter((r: any) => {
      const dep = r.createdBy?.department || r.assignedTo?.department || ""
      const lastName = (r.createdBy?.lastName || "") + " " + (r.assignedTo?.lastName || "")
      return (
        (!filter.department || dep === filter.department) &&
        (!filter.lastName || lastName.toLowerCase().includes(filter.lastName.toLowerCase()))
      )
    })
  }, [requests, filter])

  const toggle = (id: string) => setOpen(open => open.includes(id) ? open.filter(i => i !== id) : [...open, id])

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

  if (filtered.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <HelpCircle className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Нет запросов</h3>
          <p className="text-gray-500 text-center mb-4">Запросы еще не созданы. Создайте первый запрос.</p>
          <Button asChild>
            <Link href="/requests/new">
              <Plus className="mr-2 h-4 w-4" />
              Создать запрос
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Обработчик административных действий (смена статуса, приоритета, назначение, удаление)
  const handleAdminAction = async (action: string, id: string, value?: string) => {
    setLoadingId(id + action)
    let url = ""
    let body: any = { id }
    // Определяем url и тело запроса в зависимости от действия
    if (action === "status") {
      url = "/api/requests/status"
      body.status = value
    } else if (action === "priority") {
      url = "/api/requests/priority"
      body.priority = value
    } else if (action === "assign") {
      url = "/api/requests/assign"
      body.userId = value
    } else if (action === "delete") {
      url = "/api/requests/delete"
    }
    if (!url) return
    try {
      // Выполняем запрос к API
      const res = await fetchWithTimeout(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error || "Ошибка операции")
      toast({ title: "Успех", description: "Изменения сохранены" })
      window.location.reload()
    } catch (e: any) {
      // Показываем ошибку через toast
      toast({ title: "Ошибка", description: e.message, variant: "destructive" })
    } finally {
      setLoadingId(null)
    }
  }

  // Вынести рендер одной карточки заявки в отдельную функцию RequestCard
  function RequestCard({ request, isOpen, toggle, isAdmin, assignableUsers, handleAdminAction }: any) {
    return (
      <Card key={request.id} className={getCardClassByStatus(request.status) + " transition-colors duration-200 mb-4"}>
        <CardHeader className="cursor-pointer select-none" onClick={() => toggle(request.id)}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <span>{isOpen ? <ChevronDown className="inline w-4 h-4" /> : <ChevronRight className="inline w-4 h-4" />}</span>
              {request.title} <span className="text-xs text-gray-400 ml-2">{formatRequestId(request.id)}</span>
            </CardTitle>
            <div className="flex gap-2">
              {getStatusBadge(request.status)}
              {getPriorityBadge(request.priority)}
            </div>
          </div>
          <CardDescription>
            ID: {formatRequestId(request.id)} • Создан: {new Date(request.createdAt).toLocaleDateString("ru-RU")}
          </CardDescription>
        </CardHeader>
        {isOpen && (
          <CardContent>
            {renderRequestDetails(request.description)}
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <div>
                <span className="font-medium">Создал:</span> {request.createdBy?.firstName} {request.createdBy?.lastName}
              </div>
              <div>
                <span className="font-medium">Назначен:</span> {request.assignedTo ? `${request.assignedTo.firstName} ${request.assignedTo.lastName}` : "—"}
              </div>
            </div>
            {isAdmin && (
              <form className="flex flex-wrap gap-2 items-center mt-2" onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget as HTMLFormElement & { elements: { [key: string]: any } };
                const action = form.elements['action'].value;
                if (action === "status") {
                  await handleAdminAction("status", request.id, form.elements['status'].value);
                } else if (action === "priority") {
                  await handleAdminAction("priority", request.id, form.elements['priority'].value);
                } else if (action === "assign") {
                  await handleAdminAction("assign", request.id, form.elements['userId'].value);
                } else if (action === "delete") {
                  await handleAdminAction("delete", request.id);
                }
              }}>
                <label>
                  Статус:
                  <select name="status" defaultValue={request.status} className="ml-1 border rounded px-2 py-1">
                    {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </label>
                <input type="hidden" name="action" value="status" />
                <button type="submit" className="px-2 py-1 border rounded bg-blue-100 hover:bg-blue-200"
                  onClick={e => { (e.currentTarget.form as any).elements['action'].value = "status" }}>
                  Сменить
                </button>
                <label>
                  Приоритет:
                  <select name="priority" defaultValue={request.priority} className="ml-1 border rounded px-2 py-1">
                    {PRIORITY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </label>
                <button type="submit" className="px-2 py-1 border rounded bg-blue-100 hover:bg-blue-200"
                  onClick={e => { (e.currentTarget.form as any).elements['action'].value = "priority" }}>
                  Сменить
                </button>
                <label>
                  Назначить:
                  <select name="userId" defaultValue={request.assignedToId || ""} className="ml-1 border rounded px-2 py-1">
                    <option value="">Выбрать...</option>
                    {assignableUsers && assignableUsers.length > 0 ? (
                      assignableUsers.map((user: any) => (
                        <option key={user.id} value={user.id}>{user.lastName} {user.firstName} ({user.email})</option>
                      ))
                    ) : (
                      <option value="" disabled>Нет доступных исполнителей</option>
                    )}
                  </select>
                </label>
                <button type="submit" className="px-2 py-1 border rounded bg-green-100 hover:bg-green-200"
                  onClick={e => { (e.currentTarget.form as any).elements['action'].value = "assign" }}>
                  Назначить
                </button>
                <button type="submit" className="px-2 py-1 border rounded bg-red-100 hover:bg-red-200 ml-2"
                  onClick={e => { (e.currentTarget.form as any).elements['action'].value = "delete" }}>
                  Удалить
                </button>
              </form>
            )}
          </CardContent>
        )}
      </Card>
    );
  }

  // Получаем уникальные отделы
  const departments = useMemo(() => {
    const set = new Set<string>()
    requests.forEach((r: any) => {
      const dep = r.createdBy?.department || r.assignedTo?.department
      if (dep) set.add(dep)
    })
    return Array.from(set)
  }, [requests])

  return (
    <>
      <RequestsFilterPanel departments={departments} filter={filter} setFilter={setFilter} />
      <div className="space-y-4">
        {filtered.map((request: any) => (
          <RequestCard
            key={request.id}
            request={request}
            isOpen={open.includes(request.id)}
            toggle={toggle}
            isAdmin={isAdmin}
            assignableUsers={assignableUsers}
            handleAdminAction={handleAdminAction}
          />
        ))}
      </div>
    </>
  )
} 