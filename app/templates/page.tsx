"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
    <div className="max-w-3xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Шаблоны заявок и инцидентов</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex justify-between items-center">
            <div className="flex gap-2">
              <Button onClick={() => { setShowForm(true); setEditId(""); setForm({ type: "INCIDENT", name: "", description: "", fields: "[]", isActive: true }); setWizardStep(1); }}>Создать шаблон</Button>
              <Button variant="outline" onClick={() => {
                // Экспорт всех шаблонов (можно сделать экспорт одного — по аналогии)
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
                <label>
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
          </div>
          <div className="mb-6 text-gray-600 text-sm">
            Здесь вы можете создавать и редактировать шаблоны для инцидентов и запросов. Шаблоны позволяют быстро заполнять формы пользователям и стандартизировать структуру заявок.<br/>
            <b>Только для администратора.</b>
          </div>
          {loading ? (
            <div>Загрузка...</div>
          ) : (
            <table className="w-full border text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">Тип</th>
                  <th className="p-2 border">Название</th>
                  <th className="p-2 border">Активен</th>
                  <th className="p-2 border">Действия</th>
                </tr>
              </thead>
              <tbody>
                {templates.map(t => (
                  <tr key={t.id}>
                    <td className="p-2 border">{t.type}</td>
                    <td className="p-2 border">
                      <Link href={`/templates/${t.id}`} className="text-blue-600 hover:underline">{t.name}</Link>
                    </td>
                    <td className="p-2 border text-center">{t.isActive ? "Да" : "Нет"}</td>
                    <td className="p-2 border flex gap-2">
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
          )}
        </CardContent>
      </Card>

      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-0 w-full max-w-lg max-h-[90vh] flex flex-col">
            <h2 className="text-xl font-bold mb-4 p-6 pb-0">{editId ? "Редактировать шаблон" : "Создать шаблон"}</h2>
            {error && <div className="text-red-600 mb-2 px-6">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-y-auto px-6 pb-4" style={{minHeight: 0}}>
              {/* Wizard step 1: Инфо */}
              {wizardStep === 1 && (
                <>
                  <div>
                    <Label>Тип</Label>
                    <select className="w-full border rounded px-3 py-2" value={form.type} onChange={e => setForm((f: any) => ({ ...f, type: e.target.value }))}>
                      <option value="INCIDENT">Инцидент</option>
                      <option value="REQUEST">Запрос</option>
                    </select>
                  </div>
                  <div>
                    <Label>Название</Label>
                    <Input value={form.name} onChange={e => setForm((f: any) => ({ ...f, name: e.target.value }))} required />
                  </div>
                  <div>
                    <Label>Описание</Label>
                    <Textarea value={form.description} onChange={e => setForm((f: any) => ({ ...f, description: e.target.value }))} />
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={form.isActive} onChange={e => setForm((f: any) => ({ ...f, isActive: e.target.checked }))} id="isActive" />
                    <Label htmlFor="isActive">Активен</Label>
                  </div>
                  <div className="flex gap-4 mt-4">
                    <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditId(""); setFieldsUI([]) }}>Отмена</Button>
                    <Button type="button" onClick={() => setWizardStep(2)}>Далее</Button>
                  </div>
                </>
              )}
              {/* Wizard step 2: Структура полей + превью */}
              {wizardStep === 2 && (
                <>
                  <div>
                    <Label>Структура полей</Label>
                    <DragDropContext onDragEnd={result => {
                      if (!result.destination) return
                      const items = Array.from(fieldsUI)
                      const [removed] = items.splice(result.source.index, 1)
                      items.splice(result.destination.index, 0, removed)
                      setFieldsUI(items)
                    }}>
                      <Droppable droppableId="fields-list">
                        {provided => (
                          <div ref={provided.innerRef} {...provided.droppableProps}>
                            {fieldsUI.map((field, idx) => (
                              <Draggable key={idx} draggableId={String(idx)} index={idx}>
                                {prov => (
                                  <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps}>
                                    <FieldEditor
                                      field={field}
                                      onChange={(val: any) => handleFieldChange(idx, val)}
                                      onDelete={() => handleFieldDelete(idx)}
                                    />
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                    <Button type="button" variant="outline" onClick={handleAddField}>Добавить поле</Button>
                  </div>
                  <div className="mt-6 mb-2 text-gray-600 text-sm">Превью формы по шаблону:</div>
                  <div className="border rounded p-4 bg-gray-50 mb-4">
                    {fieldsUI.length === 0 && <div className="text-gray-400">Нет полей</div>}
                    {fieldsUI.map((field, idx) => (
                      <div key={idx} className="mb-3">
                        <Label className="block font-semibold mb-1">{field.name}{field.required && <span className="text-red-500">*</span>}</Label>
                        {field.type === "text" && <Input disabled placeholder={field.description} />}
                        {field.type === "number" && <Input type="number" disabled placeholder={field.description} />}
                        {field.type === "date" && <Input type="date" disabled />}
                        {field.type === "email" && <Input type="email" disabled placeholder={field.description} />}
                        {field.type === "password" && <Input type="password" disabled placeholder={field.description} />}
                        {field.type === "tel" && <Input type="tel" disabled placeholder={field.description} />}
                        {field.type === "file" && <Input type="file" disabled />}
                        {field.type === "url" && <Input type="url" disabled placeholder={field.description} />}
                        {field.type === "color" && <Input type="color" disabled />}
                        {field.type === "time" && <Input type="time" disabled />}
                        {field.type === "range" && <Input type="range" disabled />}
                        {field.type === "textarea" && <Textarea disabled placeholder={field.description} />}
                        {field.type === "select" && <select disabled className="border rounded px-2 py-1 w-full"><option>Выберите вариант</option>{field.options?.map((opt: string) => <option key={opt}>{opt}</option>)}</select>}
                        {field.type === "checkbox" && <input type="checkbox" disabled className="ml-2" />}
                        {field.description && <div className="text-xs text-gray-500 mt-1">{field.description}</div>}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-4 mt-4">
                    <Button type="button" variant="outline" onClick={() => setWizardStep(1)}>Назад</Button>
                    <Button type="submit">Сохранить</Button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  )
} 