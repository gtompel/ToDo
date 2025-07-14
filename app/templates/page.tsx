"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import Link from "next/link"

const FIELD_TYPES = [
  { value: "text", label: "Текст" },
  { value: "textarea", label: "Многострочный текст" },
  { value: "select", label: "Выпадающий список" },
  { value: "checkbox", label: "Чекбокс" },
  { value: "number", label: "Число" },
  { value: "date", label: "Дата" },
  { value: "email", label: "Email" },
  { value: "password", label: "Пароль" },
  { value: "tel", label: "Телефон" },
  { value: "file", label: "Файл" },
  { value: "url", label: "URL" },
  { value: "color", label: "Цвет" },
  { value: "time", label: "Время" },
  { value: "range", label: "Слайдер" },
]

function FieldEditor({ field, onChange, onDelete }: any) {
  return (
    <div className="border rounded p-3 mb-2 bg-gray-50">
      <div className="flex gap-2 mb-2">
        <Input
          className="flex-1"
          placeholder="Имя поля (например, title)"
          value={field.name}
          onChange={e => onChange({ ...field, name: e.target.value })}
        />
        <select
          className="border rounded px-2"
          value={field.type}
          onChange={e => onChange({ ...field, type: e.target.value })}
        >
          {FIELD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <Button size="sm" variant="destructive" onClick={onDelete}>Удалить</Button>
      </div>
      <div className="flex gap-2 mb-2">
        <label className="flex items-center gap-1">
          <input type="checkbox" checked={field.required} onChange={e => onChange({ ...field, required: e.target.checked })} />
          Обязательное
        </label>
        <label className="flex items-center gap-1">
          <span>Дефолт:</span>
          <Input
            className="w-32"
            value={field.default ?? ""}
            onChange={e => onChange({ ...field, default: e.target.value })}
          />
        </label>
      </div>
      <div className="mb-2">
        <Label>Описание</Label>
        <Input
          placeholder="Пояснение для пользователя"
          value={field.description ?? ""}
          onChange={e => onChange({ ...field, description: e.target.value })}
        />
      </div>
      {field.type === "select" && (
        <div className="mb-2">
          <Label>Варианты (через запятую)</Label>
          <Input
            value={field.options?.join(",") ?? ""}
            onChange={e => onChange({ ...field, options: e.target.value.split(",").map((v: string) => v.trim()).filter(Boolean) })}
          />
        </div>
      )}
    </div>
  )
}

export default function TemplatesAdminPage() {
  const [templates, setTemplates] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string>("")
  const [form, setForm] = useState<any>({
    type: "INCIDENT",
    name: "",
    description: "",
    fields: "[]", // Changed to array of objects
    isActive: true,
  })
  const [error, setError] = useState("")
  const [userRole, setUserRole] = useState<string>("")

  // Для визуального редактора полей
  const [fieldsUI, setFieldsUI] = useState<any[]>([])
  const [wizardStep, setWizardStep] = useState(1)

  const fetchTemplates = async () => {
    setLoading(true)
    const res = await fetch("/api/templates")
    const data = await res.json()
    setTemplates(data.templates || [])
    setLoading(false)
  }

  useEffect(() => { fetchTemplates() }, [])

  useEffect(() => {
    fetch("/api/users/me").then(res => res.json()).then(data => setUserRole(data?.user?.role || ""))
  }, [])

  // При открытии формы редактирования — заполняем fieldsUI
  useEffect(() => {
    if (showForm) {
      try {
        setFieldsUI(Array.isArray(form.fields) ? form.fields : JSON.parse(form.fields))
      } catch {
        setFieldsUI([])
      }
    }
  }, [showForm])

  const handleEdit = (tpl: any) => {
    setEditId(tpl.id)
    setForm({
      type: tpl.type,
      name: tpl.name,
      description: tpl.description || "",
      fields: JSON.stringify(tpl.fields, null, 2),
      isActive: tpl.isActive,
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить шаблон?")) return
    await fetch(`/api/templates/${id}`, { method: "DELETE" })
    fetchTemplates()
  }

  const handleAddField = () => {
    setFieldsUI(f => [...f, { name: "", type: "text", required: false, default: "" }])
  }
  const handleFieldChange = (idx: number, val: any) => {
    setFieldsUI(f => f.map((fld, i) => i === idx ? val : fld))
  }
  const handleFieldDelete = (idx: number) => {
    setFieldsUI(f => f.filter((_, i) => i !== idx))
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setError("")
    // Валидация полей
    if (fieldsUI.some(f => !f.name || !f.type)) {
      setError("Заполните имя и тип для всех полей")
      return
    }
    const body = {
      type: form.type,
      name: form.name,
      description: form.description,
      fields: fieldsUI,
      isActive: form.isActive,
    }
    const method = editId ? "PUT" : "POST"
    const url = editId ? `/api/templates/${editId}` : "/api/templates"
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      setError("Ошибка при сохранении шаблона")
      return
    }
    setShowForm(false)
    setEditId("")
    setForm({ type: "INCIDENT", name: "", description: "", fields: [], isActive: true })
    setFieldsUI([])
    fetchTemplates()
  }

  if (userRole && userRole !== "ADMIN") {
    return <div className="text-center text-red-600 py-16 text-xl font-bold">Доступ запрещён (только для администратора)</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl">Шаблоны заявок и инцидентов</CardTitle>
            <CardDescription className="text-gray-600 text-sm mt-2">
              Здесь вы можете создавать и редактировать шаблоны для инцидентов и запросов. Шаблоны позволяют быстро заполнять формы пользователям и стандартизировать структуру заявок.<br/>
              <b>Только для администратора.</b>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-center gap-2 mb-6">
              <Button onClick={() => { setShowForm(true); setEditId(""); setForm({ type: "INCIDENT", name: "", description: "", fields: "[]", isActive: true }); setWizardStep(1); }}>Создать шаблон</Button>
              <Button variant="outline" onClick={() => {
                const data = JSON.stringify(templates, null, 2)
                const blob = new Blob([data], { type: "application/json" })
                const url = URL.createObjectURL(blob)
                const a = document.createElement("a")
                a.href = url
                a.download = "templates.json"
                a.click()
                URL.revokeObjectURL(url)
              }}>Экспорт</Button>
              <Button variant="outline" asChild>
                <label className="cursor-pointer">
                  Импорт
                  <input type="file" accept="application/json" hidden onChange={async e => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    const text = await file.text()
                    try {
                      const arr = JSON.parse(text)
                      for (const tpl of Array.isArray(arr) ? arr : [arr]) {
                        await fetch("/api/templates", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify(tpl),
                        })
                      }
                      fetchTemplates()
                    } catch {}
                  }} />
                </label>
              </Button>
            </div>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Загрузка...</div>
            ) : (
              <div className="overflow-x-auto rounded-lg border bg-white">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-3 font-semibold">Тип</th>
                      <th className="p-3 font-semibold">Название</th>
                      <th className="p-3 font-semibold text-center">Активен</th>
                      <th className="p-3 font-semibold">Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {templates.map(t => (
                      <tr key={t.id} className="border-t hover:bg-gray-50">
                        <td className="p-3">{t.type}</td>
                        <td className="p-3">
                          <Link href={`/templates/${t.id}`} className="text-blue-600 hover:underline">{t.name}</Link>
                        </td>
                        <td className="p-3 text-center">{t.isActive ? "Да" : "Нет"}</td>
                        <td className="p-3 flex flex-wrap gap-2">
                          <Button size="sm" variant="outline" onClick={() => { handleEdit(t); setWizardStep(1); }}>Редактировать</Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(t.id)}>Удалить</Button>
                          <Button size="sm" variant="secondary" onClick={async () => {
                            const copy = { ...t, id: undefined, name: t.name + " (копия)" }
                            await fetch("/api/templates", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify(copy),
                            })
                            fetchTemplates()
                          }}>Клонировать</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 