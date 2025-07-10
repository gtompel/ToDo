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
import { CalendarIcon, ArrowLeft } from "lucide-react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"

export default function NewChangePage({ users }: { users: Array<{ id: string, firstName: string, lastName: string }> }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "",
    priority: "",
    category: "",
    requester: "",
    assignedToId: "",
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

  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSystemToggle = (system: string) => {
    setAffectedSystems((prev) => (prev.includes(system) ? prev.filter((s) => s !== system) : [...prev, system]))
  }

  const handleApproverToggle = (approver: string) => {
    setApprovers((prev) => (prev.includes(approver) ? prev.filter((a) => a !== approver) : [...prev, approver]))
  }

  const handleSubmit = async (status: string) => {
    setLoading(true)
    try {
      const res = await fetch("/api/changes/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          scheduledDate: scheduledDate ? scheduledDate.toISOString() : null,
          status,
          affectedSystems,
          approvers,
        }),
      })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error || "Ошибка создания изменения")
      toast({ title: "Изменение создано", description: "Запрос успешно сохранён" })
      router.push("/changes")
    } catch (e: any) {
      toast({ title: "Ошибка", description: e.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
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
                <Select value={formData.requester} onValueChange={(value) => handleInputChange("requester", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите инициатора" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>{user.lastName} {user.firstName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignedToId">Исполнитель</Label>
                <Select value={formData.assignedToId} onValueChange={(value) => handleInputChange("assignedToId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите исполнителя" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>{user.lastName} {user.firstName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Планируемая дата внедрения</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !scheduledDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {scheduledDate ? format(scheduledDate, "PPP", { locale: ru }) : "Выберите дату"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={scheduledDate}
                      onSelect={setScheduledDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* ... Остальные поля формы ... */}

              <div className="flex gap-2 mt-4">
                <Button type="button" onClick={() => handleSubmit("DRAFT")} disabled={loading}>
                  Сохранить как черновик
                </Button>
                <Button type="button" onClick={() => handleSubmit("PENDING_APPROVAL")} disabled={loading}>
                  Отправить на согласование
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 