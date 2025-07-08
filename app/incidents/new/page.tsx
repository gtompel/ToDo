"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function NewIncidentPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "",
    category: "",
    assignee: "",
    reporter: "Текущий пользователь",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Здесь будет логика сохранения инцидента
    console.log("Создание инцидента:", formData)
    router.push("/incidents")
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
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
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Подробное описание</Label>
              <Textarea
                id="description"
                placeholder="Опишите проблему детально, укажите шаги для воспроизведения, влияние на бизнес..."
                rows={4}
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Приоритет *</Label>
                <Select value={formData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите приоритет" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Критический">Критический - Полная остановка работы</SelectItem>
                    <SelectItem value="Высокий">Высокий - Серьезное влияние на работу</SelectItem>
                    <SelectItem value="Средний">Средний - Умеренное влияние</SelectItem>
                    <SelectItem value="Низкий">Низкий - Минимальное влияние</SelectItem>
                  </SelectContent>
                </Select>
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
                  <SelectValue placeholder="Выберите исполнителя или оставьте пустым для автоназначения" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Иванов И.И.">Иванов И.И. - Системный администратор</SelectItem>
                  <SelectItem value="Петров П.П.">Петров П.П. - Сетевой администратор</SelectItem>
                  <SelectItem value="Сидоров С.С.">Сидоров С.С. - Администратор БД</SelectItem>
                  <SelectItem value="Волков В.В.">Волков В.В. - Техническая поддержка</SelectItem>
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

        <div className="flex gap-4">
          <Button type="submit" className="flex-1 md:flex-none">
            <Save className="w-4 h-4 mr-2" />
            Создать инцидент
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/incidents">Отмена</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}
