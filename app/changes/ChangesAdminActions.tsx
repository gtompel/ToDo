"use client"

import { useState, useTransition, useRef } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { fetchWithTimeout } from "@/lib/utils"

// Варианты статусов для изменений
const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Черновик" },
  { value: "PENDING_APPROVAL", label: "Ожидание одобрения" },
  { value: "APPROVED", label: "Одобрено" },
  { value: "IN_PROGRESS", label: "В работе" },
  { value: "IMPLEMENTED", label: "Внедрено" },
  { value: "CANCELLED", label: "Отменено" },
]

// Варианты приоритетов для изменений
const PRIORITY_OPTIONS = [
  { value: "CRITICAL", label: "Критический" },
  { value: "HIGH", label: "Высокий" },
  { value: "MEDIUM", label: "Средний" },
  { value: "LOW", label: "Низкий" },
]

// Компонент для административных действий над изменением
export default function ChangesAdminActions({ change, assignees }: { change: any, assignees: Array<{id: string, firstName: string, lastName: string, email: string}> }) {
  // Состояния для управления формой
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState(change.status) // Текущий статус
  const [assignee, setAssignee] = useState(change.assignedToId || "") // Текущий исполнитель
  const [loading, setLoading] = useState(false) // Флаг загрузки
  const actionRef = useRef<HTMLInputElement>(null) // Ссылка на скрытое поле action
  const [priority, setPriority] = useState(change.priority) // Текущий приоритет

  // Обработка административных действий (смена статуса, приоритета, назначение)
  const handleAdminAction = async (action: string, value?: string) => {
    setLoading(true)
    try {
      let res, data
      // Смена статуса
      if (action === "status") {
        setStatus(value || status)
        res = await fetchWithTimeout("/api/changes/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: change.id, status: value || status }),
        })
        data = await res.json()
        if (!res.ok || data.error) throw new Error(data.error || "Ошибка смены статуса")
        toast({ title: "Статус изменён", description: "Изменение обновлено" })
        window.location.reload()
      // Смена приоритета
      } else if (action === "priority") {
        setPriority(value || priority)
        res = await fetchWithTimeout("/api/changes/priority", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: change.id, priority: value || priority }),
        })
        data = await res.json()
        if (!res.ok || data.error) throw new Error(data.error || "Ошибка смены приоритета")
        toast({ title: "Приоритет изменён", description: "Изменение обновлено" })
        window.location.reload()
      // Назначение исполнителя
      } else if (action === "assign") {
        setAssignee(value || assignee)
        res = await fetchWithTimeout("/api/changes/assign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: change.id, userId: value || assignee }),
        })
        data = await res.json()
        if (!res.ok || data.error) throw new Error(data.error || "Ошибка назначения")
        toast({ title: "Исполнитель назначен" })
        window.location.reload()
      }
    } catch (e: any) {
      // Показываем ошибку через toast
      toast({ title: "Ошибка", description: e.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  // Форма для управления изменением (статус, приоритет, назначение)
  return (
    <form
      className="flex flex-wrap gap-2 items-center mt-2"
      onSubmit={async (e) => {
        e.preventDefault()
        const form = e.currentTarget as HTMLFormElement & { elements: { [key: string]: any } }
        const action = form.elements['action'].value
        // В зависимости от выбранного действия вызываем обработчик
        if (action === "status") {
          await handleAdminAction("status", form.elements['status'].value)
        } else if (action === "priority") {
          await handleAdminAction("priority", form.elements['priority'].value)
        } else if (action === "assign") {
          await handleAdminAction("assign", form.elements['userId'].value)
        }
      }}
    >
      {/* Смена статуса */}
      <label>
        Статус:
        <select name="status" defaultValue={status} className="ml-1 border rounded px-2 py-1">
          {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </label>
      {/* Скрытое поле для передачи типа действия */}
      <input ref={actionRef} type="hidden" name="action" value="status" />
      <button
        type="submit"
        className="px-2 py-1 border rounded bg-blue-100 hover:bg-blue-200"
        disabled={loading}
        onClick={() => { if (actionRef.current) actionRef.current.value = "status" }}
      >
        {loading ? "..." : "Сменить"}
      </button>
      {/* Смена приоритета */}
      <label>
        Приоритет:
        <select name="priority" defaultValue={priority} className="ml-1 border rounded px-2 py-1">
          {PRIORITY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </label>
      <button
        type="submit"
        className="px-2 py-1 border rounded bg-blue-100 hover:bg-blue-200"
        disabled={loading}
        onClick={() => { if (actionRef.current) actionRef.current.value = "priority" }}
      >
        {loading ? "..." : "Сменить"}
      </button>
      {/* Назначение исполнителя */}
      <label>
        Назначить:
        <select name="userId" defaultValue={assignee} className="ml-1 border rounded px-2 py-1">
          <option value="">Выбрать...</option>
          {assignees && assignees.length > 0 ? (
            assignees.map((user) => (
              <option key={user.id} value={user.id}>{user.lastName} {user.firstName} ({user.email})</option>
            ))
          ) : (
            <option value="" disabled>Нет доступных исполнителей</option>
          )}
        </select>
      </label>
      <button
        type="submit"
        className="px-2 py-1 border rounded bg-green-100 hover:bg-green-200"
        disabled={loading}
        onClick={() => { if (actionRef.current) actionRef.current.value = "assign" }}
      >
        {loading ? "..." : "Назначить"}
      </button>
    </form>
  )
} 