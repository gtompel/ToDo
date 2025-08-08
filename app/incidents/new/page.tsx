"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { toast } from "@/components/ui/use-toast"

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
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({})
  const [formError, setFormError] = useState("")
  // Состояния для шаблонов
  const [templates, setTemplates] = useState<any[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("")
  const [step, setStep] = useState<"select"|"form">("select")

  // Загрузка списка исполнителей при монтировании
  useEffect(() => {
    fetch("/api/users?role=TECHNICIAN,ADMIN")
      .then(res => res.json())
      .then(data => setAssignees(data.users || []))
  }, [])

  // Загрузка шаблонов при монтировании
  useEffect(() => {
    fetch("/api/templates?type=INCIDENT")
      .then(res => res.json())
      .then(data => setTemplates(data.templates || []))
  }, [])

  // Автозаполнение при выборе шаблона
  useEffect(() => {
    if (!selectedTemplateId) return
    const template = templates.find(t => t.id === selectedTemplateId)
    if (!template) return
    const fields = template.fields || {}
    setFormData(prev => ({
      ...prev,
      ...fields,
    }))
  }, [selectedTemplateId])

  // Ключ для localStorage (по типу и шаблону)
  const draftKey = `incident_draft_${selectedTemplateId || 'default'}`

  // Восстановление черновика при открытии формы/шаблона
  useEffect(() => {
    if (typeof window === 'undefined') return
    const draft = localStorage.getItem(draftKey)
    if (draft) {
      try {
        setFormData(JSON.parse(draft))
      } catch {}
    }
  }, [selectedTemplateId])

  // Автосохранение черновика при изменении формы
  useEffect(() => {
    if (typeof window === 'undefined') return
    localStorage.setItem(draftKey, JSON.stringify(formData))
  }, [formData, draftKey])

  // Очистка черновика
  const clearDraft = () => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(draftKey)
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
  }

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
    // Приоритет для USER ставим на сервере как LOW, поэтому на клиенте не требуем
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setFormError("Пожалуйста, заполните все обязательные поля")
      return
    }
    setLoading(true)

    const data = new FormData()
    data.append("title", formData.title)
    data.append("description", formData.description)
    data.append("priority", formData.priority || "")
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
      toast({ title: "Инцидент создан", description: "Запись успешно добавлена" })
      setTimeout(() => router.push("/incidents"), 1500)
    } else {
      let msg = "Ошибка при создании инцидента"
      try {
        const data = await res.json()
        if (data?.error) msg = data.error
      } catch {}
      setFormError(msg)
      toast({ title: "Ошибка", description: msg, variant: "destructive" })
    }
  }

  // Получить выбранный шаблон
  const selectedTemplate = templates.find(t => t.id === selectedTemplateId)

  // Динамический рендеринг формы по шаблону
  const renderTemplateForm = () => {
    if (!selectedTemplate) return null
    return (
      <form
        onSubmit={e => {
          e.preventDefault()
          setFormError("")
          setFormErrors({})
          // Валидация
          const errors: {[key: string]: string} = {}
          for (const field of selectedTemplate.fields) {
            if (field.required && !(formData as Record<string, any>)[field.name]) {
              errors[field.name] = "Обязательное поле"
            }
          }
          if (Object.keys(errors).length > 0) {
            setFormErrors(errors)
            setFormError("Пожалуйста, заполните все обязательные поля")
            return
          }
          handleSubmit(e)
        }}
        className="space-y-6"
      >
        <Button type="button" variant="outline" onClick={() => setStep("select")}>Назад к выбору шаблона</Button>
        <Button type="button" variant="ghost" onClick={clearDraft}>Очистить черновик</Button>
        {formError && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded border border-red-300">
            {formError}
          </div>
        )}
        <Card>
          <CardHeader>
            <CardTitle>Данные инцидента</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedTemplate.fields.map((field: any) => (
              <div className="space-y-1" key={field.name}>
                <Label htmlFor={field.name} className="font-semibold">
                  {field.name}{field.required && <span className="text-red-500">*</span>}
                </Label>
                {field.type === "text" && (
                  <Input
                    id={field.name}
                    value={(formData as Record<string, any>)[field.name] ?? ""}
                    onChange={e => handleInputChange(field.name, e.target.value)}
                    required={field.required}
                    placeholder={field.description}
                    className={formErrors[field.name] ? "border-red-500" : ""}
                  />
                )}
                {field.type === "number" && (
                  <Input
                    id={field.name}
                    type="number"
                    value={(formData as Record<string, any>)[field.name] ?? ""}
                    onChange={e => handleInputChange(field.name, e.target.value)}
                    required={field.required}
                    placeholder={field.description}
                    className={formErrors[field.name] ? "border-red-500" : ""}
                  />
                )}
                {field.type === "date" && (
                  <Input
                    id={field.name}
                    type="date"
                    value={(formData as Record<string, any>)[field.name] ?? ""}
                    onChange={e => handleInputChange(field.name, e.target.value)}
                    required={field.required}
                    className={formErrors[field.name] ? "border-red-500" : ""}
                  />
                )}
                {field.type === "email" && (
                  <Input
                    id={field.name}
                    type="email"
                    value={(formData as Record<string, any>)[field.name] ?? ""}
                    onChange={e => handleInputChange(field.name, e.target.value)}
                    required={field.required}
                    placeholder={field.description}
                    className={formErrors[field.name] ? "border-red-500" : ""}
                  />
                )}
                {field.type === "password" && (
                  <Input
                    id={field.name}
                    type="password"
                    value={(formData as Record<string, any>)[field.name] ?? ""}
                    onChange={e => handleInputChange(field.name, e.target.value)}
                    required={field.required}
                    placeholder={field.description}
                    className={formErrors[field.name] ? "border-red-500" : ""}
                  />
                )}
                {field.type === "tel" && (
                  <Input
                    id={field.name}
                    type="tel"
                    value={(formData as Record<string, any>)[field.name] ?? ""}
                    onChange={e => handleInputChange(field.name, e.target.value)}
                    required={field.required}
                    placeholder={field.description}
                    className={formErrors[field.name] ? "border-red-500" : ""}
                  />
                )}
                {field.type === "file" && (
                  <Input
                    id={field.name}
                    type="file"
                    onChange={e => handleInputChange(field.name, e.target.files?.[0] || null)}
                    required={field.required}
                    className={formErrors[field.name] ? "border-red-500" : ""}
                  />
                )}
                {field.type === "url" && (
                  <Input
                    id={field.name}
                    type="url"
                    value={(formData as Record<string, any>)[field.name] ?? ""}
                    onChange={e => handleInputChange(field.name, e.target.value)}
                    required={field.required}
                    placeholder={field.description}
                    className={formErrors[field.name] ? "border-red-500" : ""}
                  />
                )}
                {field.type === "color" && (
                  <Input
                    id={field.name}
                    type="color"
                    value={(formData as Record<string, any>)[field.name] ?? "#000000"}
                    onChange={e => handleInputChange(field.name, e.target.value)}
                    required={field.required}
                    className={formErrors[field.name] ? "border-red-500" : ""}
                  />
                )}
                {field.type === "time" && (
                  <Input
                    id={field.name}
                    type="time"
                    value={(formData as Record<string, any>)[field.name] ?? ""}
                    onChange={e => handleInputChange(field.name, e.target.value)}
                    required={field.required}
                    className={formErrors[field.name] ? "border-red-500" : ""}
                  />
                )}
                {field.type === "range" && (
                  <Input
                    id={field.name}
                    type="range"
                    min={field.min ?? 0}
                    max={field.max ?? 100}
                    step={field.step ?? 1}
                    value={(formData as Record<string, any>)[field.name] ?? field.default ?? 0}
                    onChange={e => handleInputChange(field.name, e.target.value)}
                    required={field.required}
                    className={formErrors[field.name] ? "border-red-500" : ""}
                  />
                )}
                {field.type === "textarea" && (
                  <Textarea
                    id={field.name}
                    value={(formData as Record<string, any>)[field.name] ?? ""}
                    onChange={e => handleInputChange(field.name, e.target.value)}
                    required={field.required}
                    placeholder={field.description}
                    className={formErrors[field.name] ? "border-red-500" : ""}
                  />
                )}
                {field.type === "select" && (
                  <Select value={(formData as Record<string, any>)[field.name] ?? ""} onValueChange={val => handleInputChange(field.name, val)}>
                    <SelectTrigger className={formErrors[field.name] ? "border-red-500" : ""}>
                      <SelectValue placeholder={field.description || "Выберите вариант"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="" disabled>Выберите вариант</SelectItem>
                      {field.options?.map((opt: string) => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {field.type === "checkbox" && (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={field.name}
                      checked={!!(formData as Record<string, any>)[field.name]}
                      onCheckedChange={val => handleInputChange(field.name, !!val)}
                    />
                    <Label htmlFor={field.name}>{field.description}</Label>
                  </div>
                )}
                {field.description && <div className="text-xs text-gray-500 mt-1">{field.description}</div>}
                {formErrors[field.name] && <div className="text-red-500 text-xs mt-1">{formErrors[field.name]}</div>}
              </div>
            ))}
          </CardContent>
        </Card>
        <div className="flex gap-4">
          <Button type="submit" className="flex-1 md:flex-none">
            <Save className="w-4 h-4 mr-2" />
            Создать инцидент
          </Button>
        </div>
      </form>
    )
  }

  if (step === "select") {
    return (
      <div className="max-w-xl mx-auto py-12">
        <h1 className="text-2xl font-bold mb-6">Выберите шаблон инцидента</h1>
        <div className="space-y-3 mb-8">
          <button
            className={`w-full border rounded p-3 text-left hover:bg-gray-50 ${selectedTemplateId === "" ? "border-blue-500" : ""}`}
            onClick={() => { setSelectedTemplateId(""); setStep("form") }}
          >
            Без шаблона (пустая форма)
          </button>
          {templates.map(t => (
            <button
              key={t.id}
              className={`w-full border rounded p-3 text-left hover:bg-gray-50 ${selectedTemplateId === t.id ? "border-blue-500" : ""}`}
              onClick={() => { setSelectedTemplateId(t.id); setStep("form") }}
            >
              <div className="font-semibold">{t.name}</div>
              <div className="text-sm text-gray-500">{t.description}</div>
            </button>
          ))}
        </div>
      </div>
    )
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

      {selectedTemplate ? renderTemplateForm() : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Button type="button" variant="outline" onClick={() => setStep("select")}>Назад к выбору шаблона</Button>
          {/* Выбор шаблона (скрыт, т.к. теперь wizard) */}
          {/* <div className="space-y-2">
          <Label htmlFor="template">Шаблон</Label>
          <select
            id="template"
            className="w-full border rounded px-3 py-2"
            value={selectedTemplateId}
            onChange={e => setSelectedTemplateId(e.target.value)}
          >
            <option value="">Без шаблона</option>
            {templates.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div> */}
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
                  <Label htmlFor="priority">Приоритет</Label>
                  <Select value={formData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="(будет установлен администратором)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CRITICAL">Критический - Полная остановка работы</SelectItem>
                      <SelectItem value="HIGH">Высокий - Серьезное влияние на работу</SelectItem>
                      <SelectItem value="MEDIUM">Средний - Умеренное влияние</SelectItem>
                      <SelectItem value="LOW">Низкий - Минимальное влияние</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="text-xs text-gray-500">Если вы — пользователь, система установит Низкий; администратор поменяет при необходимости.</div>
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
                      <SelectValue placeholder="(назначит администратор)" />
                    </SelectTrigger>
                    <SelectContent>
                      {assignees.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} — {user.position} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="text-xs text-gray-500">Администратор назначит исполнителя после создания.</div>
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
      )}
    </div>
  )
}
