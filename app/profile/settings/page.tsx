"use client"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ProfileSettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [form, setForm] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState("")
  const [password, setPassword] = useState("")
  const [password2, setPassword2] = useState("")

  useEffect(() => {
    async function loadUser() {
      setLoading(true)
      setError("")
      try {
        const res = await fetch("/api/users/me")
        if (!res.ok) throw new Error("Ошибка загрузки профиля")
        const data = await res.json()
        setUser(data)
        setForm({ email: data.email, firstName: data.firstName, lastName: data.lastName })
      } catch (e: any) {
        setError(e.message || "Ошибка")
      } finally {
        setLoading(false)
      }
    }
    loadUser()
  }, [])

  const handleChange = (field: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")
    setSuccess("")
    if (password && password !== password2) {
      setError("Пароли не совпадают")
      setSaving(false)
      return
    }
    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, password: password || undefined }),
      })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error || "Ошибка сохранения")
      setSuccess("Изменения сохранены")
      setPassword("")
      setPassword2("")
    } catch (e: any) {
      setError(e.message || "Ошибка сохранения")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-8 text-center text-muted-foreground">Загрузка...</div>
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>

  return (
    <div className="max-w-xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Настройки профиля</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <Label>Новый пароль</Label>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <div>
              <Label>Повторите пароль</Label>
              <Input type="password" value={password2} onChange={e => setPassword2(e.target.value)} />
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            {success && <div className="text-green-600 text-sm">{success}</div>}
            <div className="flex gap-4 mt-6">
              <Button type="submit" disabled={saving}>{saving ? "Сохранение..." : "Сохранить"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 