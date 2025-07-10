"use client"

import { useState, useTransition, useRef } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { fetchWithTimeout } from "@/lib/utils"

const STATUS_OPTIONS = [
  { value: "OPEN", label: "Открыт" },
  { value: "IN_PROGRESS", label: "В работе" },
  { value: "RESOLVED", label: "Решен" },
  { value: "CLOSED", label: "Закрыт" },
]

const PRIORITY_OPTIONS = [
  { value: "CRITICAL", label: "Критический" },
  { value: "HIGH", label: "Высокий" },
  { value: "MEDIUM", label: "Средний" },
  { value: "LOW", label: "Низкий" },
]

export default function IncidentsAdminActions({ incident, assignees }: { incident: any, assignees: Array<{id: string, firstName: string, lastName: string, email: string}> }) {
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState(incident.status)
  const [assignee, setAssignee] = useState(incident.assignedToId || "")
  const [loading, setLoading] = useState(false)
  const actionRef = useRef<HTMLInputElement>(null)
  const [priority, setPriority] = useState(incident.priority)

  const handleAdminAction = async (action: string, value?: string) => {
    setLoading(true)
    try {
      let res, data
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
        window.location.reload()
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
        window.location.reload()
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
        window.location.reload()
      } else if (action === "delete") {
        if (confirm("Удалить инцидент?")) {
          res = await fetchWithTimeout("/api/incidents/delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: incident.id }),
          })
          data = await res.json()
          if (!res.ok || data.error) throw new Error(data.error || "Ошибка удаления")
          toast({ title: "Инцидент удалён" })
          window.location.reload()
        }
      }
    } catch (e: any) {
      toast({ title: "Ошибка", description: e.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="flex flex-wrap gap-2 items-center mt-2" onSubmit={async (e) => {
      e.preventDefault()
      const form = e.currentTarget as HTMLFormElement & { elements: { [key: string]: any } }
      const action = form.elements['action'].value
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
      <label>
        Статус:
        <select name="status" defaultValue={status} className="ml-1 border rounded px-2 py-1">
          {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </label>
      <input ref={actionRef} type="hidden" name="action" value="status" />
      <button type="submit" className="px-2 py-1 border rounded bg-blue-100 hover:bg-blue-200" disabled={loading}
        onClick={() => { if (actionRef.current) actionRef.current.value = "status" }}>
        {loading ? "..." : "Сменить"}
      </button>
      <label>
        Приоритет:
        <select name="priority" defaultValue={priority} className="ml-1 border rounded px-2 py-1">
          {PRIORITY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </label>
      <button type="submit" className="px-2 py-1 border rounded bg-blue-100 hover:bg-blue-200" disabled={loading}
        onClick={() => { if (actionRef.current) actionRef.current.value = "priority" }}>
        {loading ? "..." : "Сменить"}
      </button>
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
      <button type="submit" className="px-2 py-1 border rounded bg-green-100 hover:bg-green-200" disabled={loading}
        onClick={() => { if (actionRef.current) actionRef.current.value = "assign" }}>
        {loading ? "..." : "Назначить"}
      </button>
      <button type="submit" className="px-2 py-1 border rounded bg-red-100 hover:bg-red-200 ml-2" disabled={loading}
        onClick={() => { if (actionRef.current) actionRef.current.value = "delete" }}>
        {loading ? "..." : "Удалить"}
      </button>
    </form>
  )
} 