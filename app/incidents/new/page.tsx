"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { prisma } from "@/lib/prisma"

// Страница создания нового инцидента
export default function NewIncidentPage() {
  const router = useRouter()
  // Состояния формы, загрузки и списка исполнителей
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "",
    category: "",
    assignee: "",
    reporter: "",
    preActions: "",
    expectedResult: "",
    attachments: [] as File[],
  })
  const [loading, setLoading] = useState(false)
  const [assignees, setAssignees] = useState<{id: string, name: string, position: string, email: string}[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  // Состояния ошибок
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [formError, setFormError] = useState("")

  // Загрузка списка исполнителей при монтировании
  useEffect(() => {
    fetch("/api/users?role=TECHNICIAN,ADMIN")
      .then(res => res.json())
      .then(data => setAssignees(data.users || []))
  }, [])

  // Обработчик изменения поля формы
  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Обработчик выбора файлов
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      setFormData((prev) => ({
        ...prev,
        attachments: Array.from(files),
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError("")
    setErrors({})
    // Клиентская валидация обязательных полей
    const newErrors: {[key: string]: string} = {}
    if (!formData.title.trim()) newErrors.title = "Заполните краткое описание проблемы"
    if (!formData.description.trim()) newErrors.description = "Заполните подробное описание"
    if (!formData.priority) newErrors.priority = "Выберите приоритет"
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setFormError("Пожалуйста, заполните все обязательные поля")
      return
    }
    setLoading(true)

    const data = new FormData()
    data.append("title", formData.title)
    data.append("description", formData.description)
    data.append("priority", formData.priority)
    data.append("category", formData.category)
    data.append("assigneeId", formData.assignee)
    data.append("preActions", formData.preActions)
    data.append("expectedResult", formData.expectedResult)
    formData.attachments.forEach((file) => data.append("attachments", file))

    const res = await fetch("/api/incidents", {
      method: "POST",
      body: data,
    })

    setLoading(false)
    if (res.ok) {
      setFormData({
        title: "",
        description: "",
        priority: "",
        category: "",
        assignee: "",
        reporter: "",
        preActions: "",
        expectedResult: "",
        attachments: [],
      })
      if (fileInputRef.current) fileInputRef.current.value = ""
      router.push("/incidents")
    } else {
      let msg = "Ошибка при создании инцидента"
      try {
        const data = await res.json()
        if (data?.error) msg = data.error
      } catch {}
      setFormError(msg)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/incidents">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Создание нового инцидента</h1>
          <p className="text-muted-foreground">Заполните информацию об инциденте</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {formError && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded border border-red-300">
            {formError}
          </div>
        )}
        <Card>
          <CardHeader>
            <CardTitle>Основная информация</CardTitle>
            <CardDescription>Опишите суть проблемы</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Краткое описание проблемы *</Label>
              <Input
                id="title"
                placeholder="Например: Недоступность почтового сервера"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                required
                className={errors.title ? "border-red-500 focus:border-red-500" : ""}
              />
              {errors.title && <div className="text-red-500 text-xs mt-1">{errors.title}</div>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Подробное описание *</Label>
              <Textarea
                id="description"
                placeholder="Опишите проблему детально, укажите шаги для воспроизведения, влияние на бизнес..."
                rows={4}
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className={errors.description ? "border-red-500 focus:border-red-500" : ""}
              />
              {errors.description && <div className="text-red-500 text-xs mt-1">{errors.description}</div>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Приоритет *</Label>
                <Select value={formData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
                  <SelectTrigger className={errors.priority ? "border-red-500 focus:border-red-500" : ""}>
                    <SelectValue placeholder="Выберите приоритет" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CRITICAL">Критический - Полная остановка работы</SelectItem>
                    <SelectItem value="HIGH">Высокий - Серьезное влияние на работу</SelectItem>
                    <SelectItem value="MEDIUM">Средний - Умеренное влияние</SelectItem>
                    <SelectItem value="LOW">Низкий - Минимальное влияние</SelectItem>
                  </SelectContent>
                </Select>
                {errors.priority && <div className="text-red-500 text-xs mt-1">{errors.priority}</div>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Категория</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите категорию" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Инфраструктура">Инфраструктура</SelectItem>
                    <SelectItem value="Сеть">Сеть</SelectItem>
                    <SelectItem value="Приложения">Приложения</SelectItem>
                    <SelectItem value="Оборудование">Оборудование</SelectItem>
                    <SelectItem value="Безопасность">Безопасность</SelectItem>
                    <SelectItem value="Другое">Другое</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Назначение</CardTitle>
            <CardDescription>Кто будет работать над инцидентом</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="assignee">Исполнитель</Label>
              <Select value={formData.assignee} onValueChange={(value) => handleInputChange("assignee", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите исполнителя" />
                </SelectTrigger>
                <SelectContent>
                  {assignees.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} — {user.position} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reporter">Заявитель</Label>
              <Input
                id="reporter"
                value={formData.reporter}
                onChange={(e) => handleInputChange("reporter", e.target.value)}
                disabled
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Дополнительная информация</CardTitle>
            <CardDescription>Уточните детали для ускорения решения</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="preActions">Действия, предпринятые до обращения</Label>
              <Textarea
                id="preActions"
                placeholder="Опишите, что уже пробовали сделать"
                rows={2}
                value={formData.preActions}
                onChange={(e) => handleInputChange("preActions", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expectedResult">Ожидаемый результат</Label>
              <Textarea
                id="expectedResult"
                placeholder="Что вы ожидаете получить в результате решения?"
                rows={2}
                value={formData.expectedResult}
                onChange={(e) => handleInputChange("expectedResult", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="attachments">Скриншоты и логи</Label>
              <Input
                id="attachments"
                type="file"
                multiple
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*,.log,.txt"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" className="flex-1 md:flex-none" disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? "Создание..." : "Создать инцидент"}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/incidents">Отмена</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}
