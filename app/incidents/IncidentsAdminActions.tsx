"use client"

import { useState, useTransition, useRef } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { useConfirm } from "@/components/ui/confirm-dialog"
import { fetchWithTimeout } from "@/lib/utils"
// Редактирование выполняется из кнопки-карандаша в списке; здесь не нужен отдельный диалог

// Варианты статусов для инцидентов
const STATUS_OPTIONS = [
  { value: "OPEN", label: "Открыт" },
  { value: "IN_PROGRESS", label: "В работе" },
  { value: "RESOLVED", label: "Решен" },
  { value: "CLOSED", label: "Закрыт" },
]

// Варианты приоритетов для инцидентов
const PRIORITY_OPTIONS = [
  { value: "CRITICAL", label: "Критический" },
  { value: "HIGH", label: "Высокий" },
  { value: "MEDIUM", label: "Средний" },
  { value: "LOW", label: "Низкий" },
]

// Компонент для административных действий над инцидентом
export default function IncidentsAdminActions({ incident, assignees, onUpdated, onDeleted }: { incident: any, assignees: Array<{id: string, firstName: string, lastName: string, email: string}>, onUpdated?: (patch: any) => void, onDeleted?: () => void }) {
  // Состояния для управления формой
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState(incident.status) // Текущий статус
  const [assignee, setAssignee] = useState(incident.assignedToId || "") // Текущий исполнитель
  const [loading, setLoading] = useState(false) // Флаг загрузки
  const actionRef = useRef<HTMLInputElement>(null) // Ссылка на скрытое поле action
  const [priority, setPriority] = useState(incident.priority) // Текущий приоритет
  const { confirm, dialog } = useConfirm()
  // Диалог редактирования убран, чтобы не дублировать кнопку редактирования

  // Обработка административных действий (смена статуса, приоритета, назначение, удаление)
  const handleAdminAction = async (action: string, value?: string) => {
    setLoading(true)
    try {
      let res, data
      // Смена статуса
      if (action === "status") {
        setStatus(value || status)
        res = await fetchWithTimeout("/api/incidents/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: incident.id, status: value || status }),
        })
        data = await res.json()
        if (!res.ok || data.error) throw new Error(data.error || "Ошибка смены статуса")
        toast({ title: "Статус изменён", description: "Инцидент обновлён" })
        onUpdated?.({ status: value || status })
      // Смена приоритета
      } else if (action === "priority") {
        setPriority(value || priority)
        res = await fetchWithTimeout("/api/incidents/priority", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: incident.id, priority: value || priority }),
        })
        data = await res.json()
        if (!res.ok || data.error) throw new Error(data.error || "Ошибка смены приоритета")
        toast({ title: "Приоритет изменён", description: "Инцидент обновлён" })
        onUpdated?.({ priority: value || priority })
      // Назначение исполнителя
      } else if (action === "assign") {
        setAssignee(value || assignee)
        res = await fetchWithTimeout("/api/incidents/assign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: incident.id, userId: value || assignee }),
        })
        data = await res.json()
        if (!res.ok || data.error) throw new Error(data.error || "Ошибка назначения")
        toast({ title: "Исполнитель назначен" })
        const userId = value || assignee
        const user = assignees.find(u => u.id === userId)
        onUpdated?.({ assignedToId: userId, assignedTo: user ? { firstName: user.firstName, lastName: user.lastName, email: user.email, id: user.id } : undefined })
      // Удаление инцидента
      } else if (action === "delete") {
        const ok = await confirm({ title: "Удалить инцидент?" })
        if (ok) {
          res = await fetchWithTimeout("/api/incidents/delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: incident.id }),
          })
          data = await res.json()
          if (!res.ok || data.error) throw new Error(data.error || "Ошибка удаления")
          toast({ title: "Инцидент удалён" })
          onDeleted?.()
        }
      }
    } catch (e: any) {
      // Показываем ошибку через toast
      toast({ title: "Ошибка", description: e.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  // Форма для управления инцидентом (статус, приоритет, назначение, удаление)
  return (
    <form className="flex flex-wrap gap-2 items-center mt-2" onSubmit={async (e) => {
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
      } else if (action === "delete") {
        await handleAdminAction("delete")
      }
    }}>
      {dialog}
      {/* Кнопка редактирования перенесена в заголовок карточки (иконка карандаша) */}
      {/* Смена статуса */}
      <label>
        Статус:
        <select name="status" defaultValue={status} className="ml-1 border rounded px-2 py-1" onClick={e => e.stopPropagation()}>
          {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </label>
      {/* Скрытое поле для передачи типа действия */}
      <input ref={actionRef} type="hidden" name="action" value="status" />
      <button type="submit" className="px-2 py-1 border rounded bg-blue-100 hover:bg-blue-200" disabled={loading}
        onClick={e => { e.stopPropagation(); if (actionRef.current) actionRef.current.value = "status" }}>
        {loading ? "..." : "Сменить"}
      </button>
      {/* Смена приоритета */}
      <label>
        Приоритет:
        <select name="priority" defaultValue={priority} className="ml-1 border rounded px-2 py-1" onClick={e => e.stopPropagation()}>
          {PRIORITY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </label>
      <button type="submit" className="px-2 py-1 border rounded bg-blue-100 hover:bg-blue-200" disabled={loading}
        onClick={e => { e.stopPropagation(); if (actionRef.current) actionRef.current.value = "priority" }}>
        {loading ? "..." : "Сменить"}
      </button>
      {/* Назначение исполнителя */}
      <label>
        Назначить:
        <select name="userId" defaultValue={assignee} className="ml-1 border rounded px-2 py-1" onClick={e => e.stopPropagation()}>
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
      <button type="submit" className="px-2 py-1 border rounded bg-green-100 hover:bg-green-200" disabled={loading}
        onClick={e => { e.stopPropagation(); if (actionRef.current) actionRef.current.value = "assign" }}>
        {loading ? "..." : "Назначить"}
      </button>
      {/* Кнопка удаления инцидента */}
      <button type="submit" className="px-2 py-1 border rounded bg-red-100 hover:bg-red-200 ml-2" disabled={loading}
        onClick={e => { e.stopPropagation(); if (actionRef.current) actionRef.current.value = "delete" }}>
        {loading ? "..." : "Удалить"}
      </button>
    </form>
  )
} 