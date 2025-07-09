"use client"

import { useState, useTransition } from "react"
import { updateIncidentStatus, assignIncidentToUser, deleteIncidentById } from "@/lib/actions/incidents"
import { Button } from "@/components/ui/button"

const STATUS_OPTIONS = [
  { value: "OPEN", label: "Открыт" },
  { value: "IN_PROGRESS", label: "В работе" },
  { value: "RESOLVED", label: "Решен" },
  { value: "CLOSED", label: "Закрыт" },
]

export default function IncidentsAdminActions({ incident, assignees }: { incident: any, assignees: Array<{id: string, firstName: string, lastName: string, email: string}> }) {
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState(incident.status)
  const [assignee, setAssignee] = useState(incident.assignedToId || "")

  const handleAdminAction = async (action: string, value?: string) => {
    alert("action: " + action + " value: " + value) // для отладки
    if (action === "status") {
      setStatus(value || status)
      await updateIncidentStatus(incident.id, value || status)
      window.location.reload()
    } else if (action === "assign") {
      setAssignee(value || assignee)
      await assignIncidentToUser(incident.id, value || assignee)
      window.location.reload()
    } else if (action === "delete") {
      if (confirm("Удалить инцидент?")) {
        await deleteIncidentById(incident.id)
        window.location.reload()
      }
    }
  }

  return (
    <form className="flex flex-wrap gap-2 items-center mt-2" onSubmit={async (e) => {
      e.preventDefault()
      const form = e.currentTarget as HTMLFormElement & { elements: { [key: string]: any } }
      const action = form.elements['action'].value
      if (action === "status") {
        await handleAdminAction("status", form.elements['status'].value)
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
      <button type="submit" name="action" value="status" className="px-2 py-1 border rounded bg-blue-100 hover:bg-blue-200">Сменить</button>
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
      <button type="submit" name="action" value="assign" className="px-2 py-1 border rounded bg-green-100 hover:bg-green-200">Назначить</button>
      <button type="submit" name="action" value="delete" className="px-2 py-1 border rounded bg-red-100 hover:bg-red-200 ml-2">Удалить</button>
    </form>
  )
} 