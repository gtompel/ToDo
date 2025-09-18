"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { fetchWithTimeout } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

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

type UserLite = { id: string; firstName: string; lastName: string; email: string }

type Change = {
  id: string
  title: string
  description: string
  status: string
  priority: string
  category: string | null
  assignedToId?: string | null
}

type ChangesAdminActionsProps = {
  change: Change
  assignees: UserLite[]
  onUpdated?: (patch: Partial<Change> & { assignedTo?: UserLite }) => void
}

// Компонент для административных действий над изменением
export default function ChangesAdminActions({ change, assignees, onUpdated }: ChangesAdminActionsProps) {
  // Состояния для управления формой
  const [status, setStatus] = useState(change.status) // Текущий статус
  const [assignee, setAssignee] = useState(change.assignedToId || "") // Текущий исполнитель
  const [loading, setLoading] = useState(false) // Флаг загрузки
  const actionRef = useRef<HTMLInputElement>(null) // Ссылка на скрытое поле action
  const [priority, setPriority] = useState(change.priority) // Текущий приоритет
  const [editOpen, setEditOpen] = useState(false)
  const [editTitle, setEditTitle] = useState(change.title || "")
  const [editDescription, setEditDescription] = useState(change.description || "")
  const [editCategory, setEditCategory] = useState(change.category || "")

  // Обработка административных действий (смена статуса, приоритета, назначение)
  const handleAdminAction = async (action: "status" | "priority" | "assign", value?: string) => {
    setLoading(true)
    try {
      let res: Response, data: unknown
      // Смена статуса
      if (action === "status") {
        setStatus(value || status)
        res = await fetchWithTimeout("/api/changes/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: change.id, status: value || status }),
        })
        data = await res.json()
        if (!res.ok || (data as { error?: string }).error) throw new Error((data as { error?: string }).error || "Ошибка смены статуса")
        toast({ title: "Успешно", description: "Статус изменён" })
        onUpdated?.({ status: value || status })
      // Смена приоритета
      } else if (action === "priority") {
        setPriority(value || priority)
        res = await fetchWithTimeout("/api/changes/priority", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: change.id, priority: value || priority }),
        })
        data = await res.json()
        if (!res.ok || (data as { error?: string }).error) throw new Error((data as { error?: string }).error || "Ошибка смены приоритета")
        toast({ title: "Успешно", description: "Приоритет изменён" })
        onUpdated?.({ priority: value || priority })
      // Назначение исполнителя
      } else if (action === "assign") {
        setAssignee(value || assignee)
        res = await fetchWithTimeout("/api/changes/assign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: change.id, userId: value || assignee }),
        })
        data = await res.json()
        if (!res.ok || (data as { error?: string }).error) throw new Error((data as { error?: string }).error || "Ошибка назначения")
        toast({ title: "Успешно", description: "Исполнитель назначен" })
        const userId = value || assignee
        const user = assignees.find(u => u.id === userId)
        if (user) onUpdated?.({ assignedToId: userId, assignedTo: user })
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e)
      toast({ title: "Ошибка", description: message, variant: "destructive" })
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
        const form = e.currentTarget as HTMLFormElement & { elements: Record<string, HTMLInputElement | HTMLSelectElement> }
        const action = (form.elements['action'] as HTMLInputElement).value
        // В зависимости от выбранного действия вызываем обработчик
        if (action === "status") {
          await handleAdminAction("status", (form.elements['status'] as HTMLSelectElement).value)
        } else if (action === "priority") {
          await handleAdminAction("priority", (form.elements['priority'] as HTMLSelectElement).value)
        } else if (action === "assign") {
          await handleAdminAction("assign", (form.elements['userId'] as HTMLSelectElement).value)
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
      <Button type="button" variant="outline" onClick={() => setEditOpen(true)}>Редактировать</Button>
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
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать изменение</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="block text-xs mb-1">Заголовок</label>
              <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs mb-1">Описание</label>
              <Textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs mb-1">Категория</label>
              <Input value={editCategory} onChange={e => setEditCategory(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Отмена</Button>
            <Button onClick={async () => {
              try {
                const res = await fetchWithTimeout('/api/changes/update', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ id: change.id, title: editTitle, description: editDescription, category: editCategory, status, priority, assignedToId: assignee || null }),
                })
                const data = await res.json()
                if (!res.ok || (data as { error?: string }).error) throw new Error((data as { error?: string }).error || 'Ошибка обновления')
                toast({ title: 'Успешно', description: 'Изменение обновлено' })
                onUpdated?.({ title: editTitle, description: editDescription, category: editCategory })
                setEditOpen(false)
              } catch (e) {
                const message = e instanceof Error ? e.message : String(e)
                toast({ title: 'Ошибка', description: message, variant: 'destructive' })
              }
            }}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  )
} 