"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { CalendarIcon, ArrowLeft, Save, Send } from "lucide-react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function NewChangePage() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "",
    priority: "",
    category: "",
    requester: "",
    businessJustification: "",
    implementationPlan: "",
    backoutPlan: "",
    testPlan: "",
    risk: "",
    impact: "",
    urgency: "",
  })

  const [scheduledDate, setScheduledDate] = useState<Date>()
  const [affectedSystems, setAffectedSystems] = useState<string[]>([])
  const [approvers, setApprovers] = useState<string[]>([])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSystemToggle = (system: string) => {
    setAffectedSystems((prev) => (prev.includes(system) ? prev.filter((s) => s !== system) : [...prev, system]))
  }

  const handleApproverToggle = (approver: string) => {
    setApprovers((prev) => (prev.includes(approver) ? prev.filter((a) => a !== approver) : [...prev, approver]))
  }

  const systems = [
    "Сервер базы данных",
    "Веб-сервер",
    "Почтовый сервер",
    "Файловый сервер",
    "Сервер приложений",
    "Сетевое оборудование",
  ]

  const potentialApprovers = [
    "Руководитель IT",
    "Менеджер по изменениям",
    "Архитектор системы",
    "Специалист по безопасности",
    "Бизнес-аналитик",
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/changes">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Новое изменение</h1>
          <p className="text-muted-foreground">Создание запроса на изменение в IT-инфраструктуре</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Основная информация */}
          <Card>
            <CardHeader>
              <CardTitle>Основная информация</CardTitle>
              <CardDescription>Базовые данные об изменении</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Название изменения *</Label>
                <Input
                  id="title"
                  placeholder="Краткое описание изменения"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Подробное описание *</Label>
                <Textarea
                  id="description"
                  placeholder="Детальное описание изменения и его целей"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Тип изменения *</Label>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите тип" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Стандартное</SelectItem>
                      <SelectItem value="normal">Обычное</SelectItem>
                      <SelectItem value="emergency">Экстренное</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Категория</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите категорию" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hardware">Оборудование</SelectItem>
                      <SelectItem value="software">Программное обеспечение</SelectItem>
                      <SelectItem value="network">Сеть</SelectItem>
                      <SelectItem value="security">Безопасность</SelectItem>
                      <SelectItem value="database">База данных</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="requester">Инициатор запроса *</Label>
                <Input
                  id="requester"
                  placeholder="ФИО инициатора"
                  value={formData.requester}
                  onChange={(e) => handleInputChange("requester", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Планируемая дата внедрения</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !scheduledDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {scheduledDate ? format(scheduledDate, "PPP", { locale: ru }) : "Выберите дату"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={scheduledDate} onSelect={setScheduledDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
            </CardContent>
          </Card>

          {/* Оценка рисков */}
          <Card>
            <CardHeader>
              <CardTitle>Оценка рисков и воздействия</CardTitle>
              <CardDescription>Анализ потенциальных рисков и влияния на бизнес</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Приоритет *</Label>
                  <Select value={formData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Низкий</SelectItem>
                      <SelectItem value="medium">Средний</SelectItem>
                      <SelectItem value="high">Высокий</SelectItem>
                      <SelectItem value="critical">Критический</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Риск *</Label>
                  <Select value={formData.risk} onValueChange={(value) => handleInputChange("risk", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Низкий</SelectItem>
                      <SelectItem value="medium">Средний</SelectItem>
                      <SelectItem value="high">Высокий</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Влияние *</Label>
                  <Select value={formData.impact} onValueChange={(value) => handleInputChange("impact", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Низкое</SelectItem>
                      <SelectItem value="medium">Среднее</SelectItem>
                      <SelectItem value="high">Высокое</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessJustification">Бизнес-обоснование</Label>
                <Textarea
                  id="businessJustification"
                  placeholder="Обоснование необходимости изменения с точки зрения бизнеса"
                  rows={3}
                  value={formData.businessJustification}
                  onChange={(e) => handleInputChange("businessJustification", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Планы выполнения */}
          <Card>
            <CardHeader>
              <CardTitle>Планы выполнения</CardTitle>
              <CardDescription>Детальные планы внедрения, тестирования и отката</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="implementationPlan">План внедрения *</Label>
                <Textarea
                  id="implementationPlan"
                  placeholder="Пошаговый план выполнения изменения"
                  rows={4}
                  value={formData.implementationPlan}
                  onChange={(e) => handleInputChange("implementationPlan", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="testPlan">План тестирования</Label>
                <Textarea
                  id="testPlan"
                  placeholder="План проверки корректности внедрения"
                  rows={3}
                  value={formData.testPlan}
                  onChange={(e) => handleInputChange("testPlan", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="backoutPlan">План отката *</Label>
                <Textarea
                  id="backoutPlan"
                  placeholder="План действий в случае неудачного внедрения"
                  rows={3}
                  value={formData.backoutPlan}
                  onChange={(e) => handleInputChange("backoutPlan", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Затрагиваемые системы */}
          <Card>
            <CardHeader>
              <CardTitle>Затрагиваемые системы</CardTitle>
              <CardDescription>Выберите системы, которые будут затронуты изменением</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {systems.map((system) => (
                <div key={system} className="flex items-center space-x-2">
                  <Checkbox
                    id={system}
                    checked={affectedSystems.includes(system)}
                    onCheckedChange={() => handleSystemToggle(system)}
                  />
                  <Label htmlFor={system} className="text-sm font-normal">
                    {system}
                  </Label>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Утверждающие */}
          <Card>
            <CardHeader>
              <CardTitle>Утверждающие</CardTitle>
              <CardDescription>Выберите лиц, которые должны утвердить изменение</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {potentialApprovers.map((approver) => (
                <div key={approver} className="flex items-center space-x-2">
                  <Checkbox
                    id={approver}
                    checked={approvers.includes(approver)}
                    onCheckedChange={() => handleApproverToggle(approver)}
                  />
                  <Label htmlFor={approver} className="text-sm font-normal">
                    {approver}
                  </Label>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Действия */}
          <Card>
            <CardHeader>
              <CardTitle>Действия</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full">
                <Save className="mr-2 h-4 w-4" />
                Сохранить как черновик
              </Button>
              <Button className="w-full" variant="default">
                <Send className="mr-2 h-4 w-4" />
                Отправить на утверждение
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
