"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"

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

function FieldEditor({ field, onChange, onDelete }: { field: any, onChange: (val: any) => void, onDelete: () => void }) {
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

export default function TemplateEditPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [form, setForm] = useState<any>({
    type: "INCIDENT",
    name: "",
    description: "",
    fields: [],
    isActive: true,
  })
  const [fieldsUI, setFieldsUI] = useState<any[]>([])
  const [wizardStep, setWizardStep] = useState(1)

  useEffect(() => {
    if (!id) return
    fetch(`/api/templates/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) setError(data.error)
        else {
          setForm({
            type: data.template.type,
            name: data.template.name,
            description: data.template.description,
            fields: data.template.fields,
            isActive: data.template.isActive,
          })
          setFieldsUI(data.template.fields)
        }
        setLoading(false)
      })
  }, [id])

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
    const res = await fetch(`/api/templates/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      setError("Ошибка при сохранении шаблона")
      return
    }
    router.push(`/templates/${id}`)
  }

  if (loading) return <div className="p-8">Загрузка...</div>
  if (error) return <div className="p-8 text-red-600">{error}</div>

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Редактирование шаблона</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
                  <Button type="button" variant="outline" onClick={() => router.push(`/templates/${id}`)}>Отмена</Button>
                  <Button type="button" onClick={() => setWizardStep(2)}>Далее</Button>
                </div>
              </>
            )}
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
                                    onChange={val => handleFieldChange(idx, val)}
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
        </CardContent>
      </Card>
    </div>
  )
} 