"use client"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function EditUserPage() {
  const params = useParams<{ id: string }>()
  const id = params.id
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<any>({})

  useEffect(() => {
    async function loadUser() {
      setLoading(true)
      setError("")
      try {
        const res = await fetch(`/api/users/${id}`)
        if (!res.ok) throw new Error("Ошибка загрузки пользователя")
        const data = await res.json()
        setUser(data)
        setForm(data)
      } catch (e: any) {
        setError(e.message || "Ошибка")
      } finally {
        setLoading(false)
      }
    }
    loadUser()
  }, [id])

  const handleChange = (field: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")
    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, id, action: "update" }),
      })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error || "Ошибка сохранения")
      router.push(`/users/${id}`)
    } catch (e: any) {
      setError(e.message || "Ошибка сохранения")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-8 text-center text-muted-foreground">Загрузка...</div>
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>
  if (!user) return <div className="p-8 text-center text-muted-foreground">Пользователь не найден</div>

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Редактирование пользователя</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Email</Label>
                <Input value={form.email || ""} onChange={e => handleChange("email", e.target.value)} required />
              </div>
              <div>
                <Label>Имя</Label>
                <Input value={form.firstName || ""} onChange={e => handleChange("firstName", e.target.value)} required />
              </div>
              <div>
                <Label>Фамилия</Label>
                <Input value={form.lastName || ""} onChange={e => handleChange("lastName", e.target.value)} required />
              </div>
              <div>
                <Label>Отчество</Label>
                <Input value={form.middleName || ""} onChange={e => handleChange("middleName", e.target.value)} />
              </div>
              <div>
                <Label>Телефон</Label>
                <Input value={form.phone || ""} onChange={e => handleChange("phone", e.target.value)} />
              </div>
              <div>
                <Label>Должность</Label>
                <Input value={form.position || ""} onChange={e => handleChange("position", e.target.value)} />
              </div>
              <div>
                <Label>Отдел</Label>
                <Input value={form.department || ""} onChange={e => handleChange("department", e.target.value)} />
              </div>
              <div>
                <Label>Роль</Label>
                <Select value={form.role || "USER"} onValueChange={v => handleChange("role", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">Пользователь</SelectItem>
                    <SelectItem value="TECHNICIAN">Техник</SelectItem>
                    <SelectItem value="MANAGER">Менеджер</SelectItem>
                    <SelectItem value="ADMIN">Администратор</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Статус</Label>
                <Select value={form.status || "active"} onValueChange={v => handleChange("status", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Активен</SelectItem>
                    <SelectItem value="inactive">Неактивен</SelectItem>
                    <SelectItem value="blocked">Заблокирован</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input type="checkbox" checked={!!form.isActive} onChange={e => handleChange("isActive", e.target.checked)} id="isActive" />
                <Label htmlFor="isActive">Активен</Label>
              </div>
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <div className="flex gap-4 mt-6">
              <Button type="submit" disabled={saving}>{saving ? "Сохранение..." : "Сохранить"}</Button>
              <Button type="button" variant="outline" onClick={() => router.push(`/users/${id}`)}>Отмена</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 