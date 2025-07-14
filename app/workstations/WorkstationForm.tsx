"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default function WorkstationForm({ initial, onSuccess }: { initial?: any, onSuccess: () => void }) {
  const [form, setForm] = useState({
    name: initial?.name || "",
    description: initial?.description || "",
    userId: initial?.userId || "",
    ip: initial?.ip || "",
    status: initial?.status || "active",
  })
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/users").then(res => res.json()).then(data => setUsers(data.users || []))
  }, [])

  const handleChange = (e: any) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const method = initial ? "PUT" : "POST"
      const url = initial ? `/api/workstations/${initial.id}` : "/api/workstations"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error("Ошибка сохранения")
      onSuccess()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="block text-sm mb-1 font-medium">Название <span className="text-red-500">*</span></label>
        <Input name="name" value={form.name} onChange={handleChange} required />
      </div>
      <div>
        <label className="block text-sm mb-1 font-medium">Описание <span className="text-red-500">*</span></label>
        <Textarea name="description" value={form.description} onChange={handleChange} required />
      </div>
      <div>
        <label className="block text-sm mb-1 font-medium">Пользователь</label>
        <select name="userId" value={form.userId} onChange={handleChange} className="w-full border rounded px-2 py-1">
          <option value="">Не назначено</option>
          {users.map(u => <option key={u.id} value={u.id}>{u.lastName} {u.firstName} ({u.email})</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm mb-1 font-medium">IP-адрес</label>
        <Input name="ip" value={form.ip} onChange={handleChange} />
      </div>
      <div>
        <label className="block text-sm mb-1 font-medium">Статус</label>
        <select name="status" value={form.status} onChange={handleChange} className="w-full border rounded px-2 py-1">
          <option value="active">Активна</option>
          <option value="inactive">Неактивна</option>
        </select>
      </div>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <Button type="submit" disabled={loading}>{loading ? "Сохранение..." : "Сохранить"}</Button>
    </form>
  )
} 