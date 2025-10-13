"use client"

import React, { useEffect, useState } from "react"
import { useCurrentUser } from "@/hooks/use-user-context"
import { useConfirm } from "@/components/ui/confirm-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import type { DropResult } from "@hello-pangea/dnd"
import Link from "next/link"

// Типы
export type FieldType =
  | "text"
  | "textarea"
  | "select"
  | "checkbox"
  | "number"
  | "date"
  | "email"
  | "password"
  | "tel"
  | "file"
  | "url"
  | "color"
  | "time"
  | "range"

export interface Field {
  id: string
  name: string
  type: FieldType
  required?: boolean
  default?: string
  description?: string
  options?: string[]
}

export interface Template {
  id?: string
  type: "INCIDENT" | "REQUEST"
  name: string
  description?: string
  fields: Field[]
  isActive: boolean
}

export type NewTemplate = Omit<Template, "id">

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

// Для выпадающего списка типов шаблонов
const TEMPLATE_TYPE_OPTIONS = [
  { value: "INCIDENT", label: "Инцидент" },
  { value: "REQUEST", label: "Запрос" },
]

const genId = (): string => {
  if (
    typeof window !== "undefined" &&
    window.crypto &&
    typeof window.crypto.randomUUID === "function"
  ) {
    return window.crypto.randomUUID()
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function FieldEditor({ field, onChange, onDelete }: { field: Field; onChange: (f: Field) => void; onDelete: () => void }) {
  return (
    <div className="border rounded p-3 mb-2 bg-muted">
      <div className="flex gap-2 mb-2">
        <Input
          className="flex-1"
          placeholder="Имя поля (например, title)"
          value={field.name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...field, name: e.target.value })}
        />
        <select
          className="border rounded px-2"
          value={field.type}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange({ ...field, type: e.target.value as FieldType })}
        >
          {FIELD_TYPES.map(t => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <Button size="sm" variant="destructive" onClick={onDelete}>
          Удалить
        </Button>
      </div>
      <div className="flex gap-2 mb-2">
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={Boolean(field.required)}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...field, required: e.target.checked })}
          />
          Обязательное
        </label>
        <label className="flex items-center gap-1">
          <span>Дефолт:</span>
          <Input className="w-32" value={field.default ?? ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...field, default: e.target.value })} />
        </label>
      </div>
      <div className="mb-2">
        <Label>Описание</Label>
        <Input placeholder="Пояснение для пользователя" value={field.description ?? ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...field, description: e.target.value })} />
      </div>
      {field.type === "select" && (
        <div className="mb-2">
          <Label>Варианты (через запятую)</Label>
          <Input
            value={field.options?.join(",") ?? ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onChange({ ...field, options: e.target.value.split(",").map(v => v.trim()).filter(Boolean) })
            }
          />
        </div>
      )}
    </div>
  )
}

export default function TemplatesAdminPage(): JSX.Element {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [showForm, setShowForm] = useState<boolean>(false)
  const [editId, setEditId] = useState<string>("")
  const [form, setForm] = useState<NewTemplate>({ type: "INCIDENT", name: "", description: "", fields: [], isActive: true })
  const [error, setError] = useState<string>("")
  const user = useCurrentUser() as { role?: string } | null
  const { confirm, dialog } = useConfirm()
  const userRole = user?.role || ""

  // Для визуального редактора полей
  const [fieldsUI, setFieldsUI] = useState<Field[]>([])
  const [wizardStep, setWizardStep] = useState<number>(1)

  const fetchTemplates = async (): Promise<void> => {
    setLoading(true)
    try {
      const res = await fetch("/api/templates")
      if (!res.ok) throw new Error("Ошибка при загрузке шаблонов")
      const data = (await res.json()) as { templates?: Template[] }
      setTemplates(data.templates ?? [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchTemplates()
  }, [])

  // При открытии формы редактирования — заполняем fieldsUI
  useEffect(() => {
    if (showForm) {
      setFieldsUI(Array.isArray(form.fields) ? form.fields.map(f => ({ ...f, id: f.id ?? genId() })) : [])
    }
  }, [showForm, form.fields])

  const handleEdit = (tpl: Template): void => {
    setEditId(tpl.id ?? "")
    setForm({
      type: tpl.type,
      name: tpl.name,
      description: tpl.description ?? "",
      fields: tpl.fields.map(f => ({ ...f, id: f.id ?? genId() })),
      isActive: tpl.isActive,
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string | undefined): Promise<void> => {
    if (!id) return
    const ok = await confirm({ title: "Удалить шаблон?" })
    if (!ok) return
    await fetch(`/api/templates/${id}`, { method: "DELETE" })
    await fetchTemplates()
  }

  const handleAddField = (): void => {
    setFieldsUI(prev => [...prev, { id: genId(), name: "", type: "text", required: false }])
  }
  const handleFieldChange = (idx: number, val: Field): void => {
    setFieldsUI(prev => prev.map((fld, i) => (i === idx ? { ...val, id: val.id ?? fld.id } : fld)))
  }
  const handleFieldDelete = (idx: number): void => {
    setFieldsUI(prev => prev.filter((_, i) => i !== idx))
  }

  const isTemplate = (obj: unknown): obj is NewTemplate => {
    if (!obj || typeof obj !== "object") return false
    const maybe = obj as Record<string, unknown>
    return typeof maybe.name === "string" && (maybe.type === "INCIDENT" || maybe.type === "REQUEST") && Array.isArray(maybe.fields)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    setError("")
    // Валидация полей
    if (fieldsUI.some(f => !f.name || !f.type)) {
      setError("Заполните имя и тип для всех полей")
      return
    }
    const body: NewTemplate = {
      type: form.type,
      name: form.name,
      description: form.description,
      fields: fieldsUI,
      isActive: form.isActive,
    }
    const method = editId ? "PUT" : "POST"
    const url = editId ? `/api/templates/${editId}` : "/api/templates"
    try {
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
      await fetchTemplates()
    } catch (e) {
      setError("Ошибка при сохранении шаблона")
    }
  }

  if (userRole && userRole !== "ADMIN") {
    return <div className="text-center text-red-600 py-16 text-xl font-bold">Доступ запрещён (только для администратора)</div>
  }

  return (
    <div className="space-y-6">
      {dialog}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 relative overflow-y-auto max-h-[90vh]">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl" onClick={() => {
              setShowForm(false)
              setWizardStep(1)
            }}>
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4">{editId ? "Редактировать шаблон" : "Создать шаблон"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {wizardStep === 1 && (
                <>
                  <div>
                    <Label>Тип</Label>
                    <select className="w-full border rounded px-3 py-2" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as NewTemplate['type'] }))}>
                      {TEMPLATE_TYPE_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>Название</Label>
                    <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                  </div>
                  <div>
                    <Label>Описание</Label>
                    <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} id="isActive" />
                    <Label htmlFor="isActive">Активен</Label>
                  </div>
                  <div className="flex gap-4 mt-4">
                    <Button type="button" variant="outline" onClick={() => {
                      setShowForm(false)
                      setWizardStep(1)
                    }}>Отмена</Button>
                    <Button type="button" onClick={() => setWizardStep(2)}>Далее</Button>
                  </div>
                </>
              )}

              {wizardStep === 2 && (
                <>
                  <div>
                    <Label>Структура полей</Label>
                    <DragDropContext onDragEnd={(result: DropResult) => {
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
                              <Draggable key={field.id} draggableId={field.id} index={idx}>
                                {prov => (
                                  <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps}>
                                    <FieldEditor field={field} onChange={val => handleFieldChange(idx, val)} onDelete={() => handleFieldDelete(idx)} />
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
                  <div className="border rounded p-4 bg-muted mb-4">
                    {fieldsUI.length === 0 && <div className="text-muted-foreground">Нет полей</div>}
                    {fieldsUI.map((field) => (
                      <div key={field.id} className="mb-3">
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
                        {field.type === "select" && (
                          <select disabled className="border rounded px-2 py-1 w-full">
                            <option>Выберите вариант</option>
                            {field.options?.map(opt => (
                              <option key={opt}>{opt}</option>
                            ))}
                          </select>
                        )}
                        {field.type === "checkbox" && <input type="checkbox" disabled className="ml-2" />}
                        {field.description && <div className="text-xs text-muted-foreground mt-1">{field.description}</div>}
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-4 mt-4">
                    <Button type="button" variant="outline" onClick={() => setWizardStep(1)}>Назад</Button>
                    <Button type="submit">Сохранить</Button>
                  </div>
                </>
              )}

              {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
            </form>
          </div>
        </div>
      )}

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl">Шаблоны заявок и инцидентов</CardTitle>
          <CardDescription className="text-gray-600 text-sm mt-2">
            Здесь вы можете создавать и редактировать шаблоны для инцидентов и запросов. Шаблоны позволяют быстро заполнять формы пользователям и стандартизировать структуру заявок.<br />
            <b>Только для администратора.</b>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-center gap-2 mb-6">
            <Button onClick={() => {
              setShowForm(true)
              setEditId("")
              setForm({ type: "INCIDENT", name: "", description: "", fields: [], isActive: true })
              setWizardStep(1)
            }}>Создать шаблон</Button>

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
                <input
                  type="file"
                  accept="application/json"
                  hidden
                  onChange={async e => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    const text = await file.text()
                    try {
                      const parsed = JSON.parse(text) as unknown
                      const items = Array.isArray(parsed) ? parsed : [parsed]
                      for (const it of items) {
                        if (!isTemplate(it)) continue
                        await fetch("/api/templates", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify(it),
                        })
                      }
                      await fetchTemplates()
                    } catch (e) {
                      console.error(e)
                    }
                  }}
                />
              </label>
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-500">Загрузка...</div>
          ) : (
            <div className="overflow-x-auto rounded-lg border bg-background">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted border-b">
                  <tr>
                    <th className="p-3 font-semibold text-foreground">Тип</th>
                    <th className="p-3 font-semibold text-foreground">Название</th>
                    <th className="p-3 font-semibold text-center text-foreground">Активен</th>
                    <th className="p-3 font-semibold text-foreground">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {templates.map(t => (
                    <tr key={t.id ?? t.name} className="border-t hover:bg-muted/50">
                      <td className="p-3 text-foreground">{TEMPLATE_TYPE_OPTIONS.find(opt => opt.value === t.type)?.label || t.type}</td>
                      <td className="p-3 text-foreground">
                        <Link href={`/templates/${t.id}`}>{t.name}</Link>
                      </td>
                      <td className="p-3 text-center text-foreground">{t.isActive ? "Да" : "Нет"}</td>
                      <td className="p-3 flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" onClick={() => { handleEdit(t); setWizardStep(1) }}>Редактировать</Button>
                        <Button size="sm" variant="destructive" onClick={() => void handleDelete(t.id)}>Удалить</Button>
                        <Button size="sm" variant="secondary" onClick={async () => {
                          const copy: NewTemplate = { ...t, id: undefined, name: `${t.name} (копия)` } as unknown as NewTemplate
                          await fetch("/api/templates", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(copy),
                          })
                          await fetchTemplates()
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
  )
}
