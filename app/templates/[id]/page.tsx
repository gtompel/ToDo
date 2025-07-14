"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"

export default function TemplateViewPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  const [template, setTemplate] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [userRole, setUserRole] = useState<string>("")

  useEffect(() => {
    if (!id) return
    fetch(`/api/templates/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) setError(data.error)
        else setTemplate(data.template)
        setLoading(false)
      })
    fetch("/api/users/me").then(res => res.json()).then(data => setUserRole(data?.user?.role || ""))
  }, [id])

  const handleDelete = async () => {
    if (!confirm("Удалить шаблон?")) return
    await fetch(`/api/templates/${id}`, { method: "DELETE" })
    router.push("/templates")
  }

  if (loading) return <div className="p-8">Загрузка...</div>
  if (error) return <div className="p-8 text-red-600">{error}</div>
  if (!template) return <div className="p-8 text-gray-500">Шаблон не найден</div>

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Шаблон: {template?.name}</h1>
      <div className="mb-4 text-gray-600">{template?.description}</div>
      <Card>
        <CardHeader>
          <CardTitle>Шаблон: {template.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 text-gray-600 text-sm">
            <b>Тип:</b> {template.type} <br/>
            <b>Описание:</b> {template.description || <span className="text-gray-400">Нет</span>}<br/>
            <b>Активен:</b> {template.isActive ? "Да" : "Нет"}
          </div>
          <div className="mb-4">
            <b>Структура полей:</b>
            <ul className="mt-2 space-y-2">
              {template.fields.map((field: any, idx: number) => (
                <li key={idx} className="border rounded p-2 bg-gray-50">
                  <b>{field.name}</b> <span className="text-xs text-gray-500">({field.type})</span>
                  {field.required && <span className="text-red-500 ml-2">*</span>}
                  {field.description && <div className="text-xs text-gray-500 mt-1">{field.description}</div>}
                  {field.type === "select" && field.options && (
                    <div className="text-xs text-gray-500 mt-1">Варианты: {field.options.join(", ")}</div>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div className="mb-4">
            <b>Превью формы:</b>
            <div className="border rounded p-4 bg-gray-50 mt-2">
              {template.fields.length === 0 && <div className="text-gray-400">Нет полей</div>}
              {template.fields.map((field: any, idx: number) => (
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
          </div>
          <div className="flex gap-4 mt-4">
            <Button type="button" onClick={() => router.push(`/templates`)}>Назад</Button>
            {userRole === "ADMIN" && (
              <Link href={`/templates/${id}/edit`}>
                <Button type="button" variant="outline">Редактировать</Button>
              </Link>
            )}
            <Button type="button" variant="destructive" onClick={handleDelete}>Удалить</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 