"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Save, Eye, Code, Mail, Smartphone, Bell } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function NotificationTemplatesPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("email")
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    subject: "",
    emailBody: "",
    pushTitle: "",
    pushBody: "",
    variables: [] as string[],
    conditions: "",
    active: true,
  })

  const [previewMode, setPreviewMode] = useState(false)

  const categories = ["Инциденты", "Запросы", "Изменения", "SLA", "База знаний", "Пользователи", "Система"]

  const availableVariables = [
    { name: "{{user.name}}", description: "Имя пользователя" },
    { name: "{{user.email}}", description: "Email пользователя" },
    { name: "{{incident.id}}", description: "Номер инцидента" },
    { name: "{{incident.title}}", description: "Заголовок инцидента" },
    { name: "{{incident.priority}}", description: "Приоритет инцидента" },
    { name: "{{request.id}}", description: "Номер запроса" },
    { name: "{{request.title}}", description: "Заголовок запроса" },
    { name: "{{change.id}}", description: "Номер изменения" },
    { name: "{{change.title}}", description: "Заголовок изменения" },
    { name: "{{assignee.name}}", description: "Имя исполнителя" },
    { name: "{{manager.name}}", description: "Имя руководителя" },
    { name: "{{date.now}}", description: "Текущая дата" },
    { name: "{{time.now}}", description: "Текущее время" },
    { name: "{{company.name}}", description: "Название компании" },
    { name: "{{system.url}}", description: "URL системы" },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Создание шаблона:", formData)
    router.push("/notifications")
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const insertVariable = (variable: string) => {
    const field = activeTab === "email" ? "emailBody" : "pushBody"
    const currentValue = formData[field as keyof typeof formData] as string
    handleInputChange(field, currentValue + variable)
  }

  const previewData = {
    "{{user.name}}": "Иванов Иван Иванович",
    "{{user.email}}": "i.ivanov@company.com",
    "{{incident.id}}": "INC-045",
    "{{incident.title}}": "Недоступность почтового сервера",
    "{{incident.priority}}": "Критический",
    "{{request.id}}": "REQ-023",
    "{{request.title}}": "Установка дополнительного ПО",
    "{{change.id}}": "CHG-015",
    "{{change.title}}": "Обновление сетевого оборудования",
    "{{assignee.name}}": "Петров Петр Петрович",
    "{{manager.name}}": "Сидорова Анна Сергеевна",
    "{{date.now}}": new Date().toLocaleDateString("ru-RU"),
    "{{time.now}}": new Date().toLocaleTimeString("ru-RU"),
    "{{company.name}}": "ООО 'Компания'",
    "{{system.url}}": "https://itsm.company.com",
  }

  const renderPreview = (text: string) => {
    let preview = text
    Object.entries(previewData).forEach(([variable, value]) => {
      preview = preview.replace(new RegExp(variable.replace(/[{}]/g, "\\$&"), "g"), value)
    })
    return preview
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/notifications">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Создание шаблона уведомлений</h1>
          <p className="text-muted-foreground">Настройка шаблона для автоматических уведомлений</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Основная информация */}
            <Card>
              <CardHeader>
                <CardTitle>Основная информация</CardTitle>
                <CardDescription>Название и описание шаблона</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Название шаблона *</Label>
                  <Input
                    id="name"
                    placeholder="Например: Назначение инцидента"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Описание</Label>
                  <Textarea
                    id="description"
                    placeholder="Краткое описание назначения шаблона"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Категория *</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите категорию" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="conditions">Условия срабатывания</Label>
                    <Input
                      id="conditions"
                      placeholder="Например: priority = 'Критический'"
                      value={formData.conditions}
                      onChange={(e) => handleInputChange("conditions", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Содержание уведомлений */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Содержание уведомлений</CardTitle>
                    <CardDescription>Настройка текста для разных каналов</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={previewMode ? "outline" : "secondary"}
                      size="sm"
                      onClick={() => setPreviewMode(false)}
                    >
                      <Code className="w-4 h-4 mr-2" />
                      Редактор
                    </Button>
                    <Button
                      type="button"
                      variant={previewMode ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => setPreviewMode(true)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Предпросмотр
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="email" className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </TabsTrigger>
                    <TabsTrigger value="push" className="flex items-center gap-2">
                      <Bell className="w-4 h-4" />
                      Push
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="email" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="subject">Тема письма *</Label>
                      {!previewMode ? (
                        <Input
                          id="subject"
                          placeholder="Например: Вам назначен инцидент {{incident.id}}"
                          value={formData.subject}
                          onChange={(e) => handleInputChange("subject", e.target.value)}
                          required
                        />
                      ) : (
                        <div className="p-3 border rounded-md bg-muted">
                          <p className="font-medium">{renderPreview(formData.subject)}</p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="emailBody">Содержание письма *</Label>
                      {!previewMode ? (
                        <Textarea
                          id="emailBody"
                          placeholder="Введите текст письма. Используйте переменные для динамического содержания."
                          rows={8}
                          value={formData.emailBody}
                          onChange={(e) => handleInputChange("emailBody", e.target.value)}
                          required
                        />
                      ) : (
                        <div className="p-4 border rounded-md bg-muted min-h-32">
                          <div className="whitespace-pre-wrap">{renderPreview(formData.emailBody)}</div>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="push" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="pushTitle">Заголовок push-уведомления</Label>
                      {!previewMode ? (
                        <Input
                          id="pushTitle"
                          placeholder="Краткий заголовок"
                          value={formData.pushTitle}
                          onChange={(e) => handleInputChange("pushTitle", e.target.value)}
                        />
                      ) : (
                        <div className="p-3 border rounded-md bg-muted">
                          <p className="font-medium">{renderPreview(formData.pushTitle)}</p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pushBody">Текст push-уведомления</Label>
                      {!previewMode ? (
                        <Textarea
                          id="pushBody"
                          placeholder="Основной текст уведомления"
                          rows={4}
                          value={formData.pushBody}
                          onChange={(e) => handleInputChange("pushBody", e.target.value)}
                        />
                      ) : (
                        <div className="p-3 border rounded-md bg-muted">
                          <p>{renderPreview(formData.pushBody)}</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Переменные и настройки */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Доступные переменные</CardTitle>
                <CardDescription>Нажмите для вставки в текст</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {availableVariables.map((variable, index) => (
                    <div
                      key={index}
                      className="p-2 border rounded cursor-pointer hover:bg-muted transition-colors"
                      onClick={() => insertVariable(variable.name)}
                    >
                      <div className="font-mono text-sm text-blue-600">{variable.name}</div>
                      <div className="text-xs text-muted-foreground">{variable.description}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Настройки шаблона</CardTitle>
                <CardDescription>Дополнительные параметры</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Активный шаблон</Label>
                    <p className="text-sm text-muted-foreground">Использовать для автоматических уведомлений</p>
                  </div>
                  <Switch
                    checked={formData.active}
                    onCheckedChange={(checked) => handleInputChange("active", checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Предпросмотр уведомления</CardTitle>
                <CardDescription>Как будет выглядеть уведомление</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg bg-blue-50 border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Bell className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-sm">
                        {renderPreview(formData.pushTitle) || "Заголовок уведомления"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {renderPreview(formData.pushBody) || "Текст уведомления"}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">* Предпросмотр с тестовыми данными</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex gap-4">
          <Button type="submit" className="flex-1 md:flex-none">
            <Save className="w-4 h-4 mr-2" />
            Сохранить шаблон
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/notifications">Отмена</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}
