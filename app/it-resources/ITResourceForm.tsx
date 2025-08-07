"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"

export default function ITResourceForm({ initial, onSuccess, onCancel }: { initial?: any, onSuccess: () => void, onCancel?: () => void }) {
  const [form, setForm] = useState({
    name: initial?.name || "",
    description: initial?.description || "",
    owner: initial?.owner || "",
    source: initial?.source || "",
    roles: initial?.roles?.join(", ") || "",
    note: initial?.note || "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [touched, setTouched] = useState<{[k: string]: boolean}>({})
  const { toast } = useToast()

  const requiredFields = ["name", "description", "owner", "source"]

  const handleChange = (e: any) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setTouched(t => ({ ...t, [e.target.name]: true }))
  }

  const validate = () => {
    for (const field of requiredFields) {
      if (!(form as Record<string, any>)[field]) return false
    }
    return true
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setTouched(t => ({ ...t, name: true, description: true, owner: true, source: true }))
    if (!validate()) {
      setError("Пожалуйста, заполните все обязательные поля")
      return
    }
    setLoading(true)
    setError("")
    try {
      const method = initial ? "PUT" : "POST"
      const url = initial ? `/api/it-resources/${initial.id}` : "/api/it-resources"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          roles: form.roles.split(",").map((r: string) => r.trim()).filter(Boolean),
        }),
      })
      if (!res.ok) throw new Error("Ошибка сохранения")
      toast({ title: initial ? "Ресурс обновлён" : "Ресурс создан", description: form.name, })
      onSuccess()
    } catch (e: any) {
      setError(e.message)
      toast({ title: "Ошибка", description: e.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="block text-sm mb-1 font-medium" htmlFor="name">Название <span className="text-red-500">*</span></label>
        <Input name="name" id="name" value={form.name} onChange={handleChange} required aria-required className={touched.name && !form.name ? "border-red-500" : ""} />
        {touched.name && !form.name && <div className="text-red-600 text-xs mt-1">Обязательное поле</div>}
      </div>
      <div>
        <label className="block text-sm mb-1 font-medium" htmlFor="description">Описание <span className="text-red-500">*</span></label>
        <Textarea name="description" id="description" value={form.description} onChange={handleChange} required aria-required className={touched.description && !form.description ? "border-red-500" : ""} />
        {touched.description && !form.description && <div className="text-red-600 text-xs mt-1">Обязательное поле</div>}
      </div>
      <div>
        <label className="block text-sm mb-1 font-medium" htmlFor="owner">Владелец <span className="text-red-500">*</span></label>
        <Input name="owner" id="owner" value={form.owner} onChange={handleChange} required aria-required className={touched.owner && !form.owner ? "border-red-500" : ""} />
        {touched.owner && !form.owner && <div className="text-red-600 text-xs mt-1">Обязательное поле</div>}
      </div>
      <div>
        <label className="block text-sm mb-1 font-medium" htmlFor="source">Источник (ссылка) <span className="text-red-500">*</span></label>
        <Input name="source" id="source" value={form.source} onChange={handleChange} required aria-required className={touched.source && !form.source ? "border-red-500" : ""} />
        {touched.source && !form.source && <div className="text-red-600 text-xs mt-1">Обязательное поле</div>}
      </div>
      <div>
        <label className="block text-sm mb-1 font-medium" htmlFor="roles">Роли (через запятую)</label>
        <Input name="roles" id="roles" value={form.roles} onChange={handleChange} placeholder="Администратор, Менеджер" />
      </div>
      <div>
        <label className="block text-sm mb-1 font-medium" htmlFor="note">Примечание</label>
        <Textarea name="note" id="note" value={form.note} onChange={handleChange} />
      </div>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <div className="flex gap-2 mt-4">
        <Button type="submit" disabled={loading}>{loading ? "Сохранение..." : "Сохранить"}</Button>
        {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Отмена</Button>}
      </div>
    </form>
  )
} 