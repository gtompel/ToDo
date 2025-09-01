"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Save, User, Shield, Building, Mail, Phone, BadgeIcon as IdCard } from "lucide-react"
import Link from "next/link"
import { createUser } from "@/lib/actions/users"

export default function NewUserPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    setError("")

    const result = await createUser(formData)
    if (result?.error) {
      setError(result.error)
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/users">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Добавить пользователя</h1>
            <p className="text-sm text-gray-600">Создание нового пользователя системы</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <form action={handleSubmit} className="max-w-4xl mx-auto space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Личная информация */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="w-5 h-5 text-blue-600" />
                  Личная информация
                </CardTitle>
                <CardDescription>Основные данные пользователя</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="lastName">Фамилия *</Label>
                  <Input id="lastName" name="lastName" placeholder="Иванов" required className="h-10" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="firstName">Имя *</Label>
                  <Input id="firstName" name="firstName" placeholder="Иван" required className="h-10" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="middleName">Отчество</Label>
                  <Input id="middleName" name="middleName" placeholder="Иванович" className="h-10" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="i.ivanov@company.com"
                      required
                      className="pl-10 h-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Телефон</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input id="phone" name="phone" placeholder="+7 (999) 123-45-67" className="pl-10 h-10" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Пароль *</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Введите пароль"
                    required
                    className="h-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Организационная информация */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building className="w-5 h-5 text-blue-600" />
                  Организационная информация
                </CardTitle>
                <CardDescription>Должность и подразделение</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="position">Должность *</Label>
                  <Input
                    id="position"
                    name="position"
                    placeholder="Системный администратор"
                    required
                    className="h-10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Отдел *</Label>
                  <Select name="department" required>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Выберите отдел" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IT отдел">IT отдел</SelectItem>
                      <SelectItem value="Бухгалтерия">Бухгалтерия</SelectItem>
                      <SelectItem value="HR отдел">HR отдел</SelectItem>
                      <SelectItem value="Юридический отдел">Юридический отдел</SelectItem>
                      <SelectItem value="Служба поддержки">Служба поддержки</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tabNumber">Табельный номер</Label>
                  <div className="relative">
                    <IdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input id="tabNumber" name="tabNumber" placeholder="1001" className="pl-10 h-10" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Роль *</Label>
                  <Select name="role" required>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Выберите роль" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USER">Пользователь</SelectItem>
                      <SelectItem value="TECHNICIAN">Техник</SelectItem>
                      <SelectItem value="MANAGER">Менеджер</SelectItem>
                      <SelectItem value="ADMIN">Администратор</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Статус</Label>
                  <Select name="status" defaultValue="active">
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Активен</SelectItem>
                      <SelectItem value="inactive">Неактивен</SelectItem>
                      <SelectItem value="blocked">Заблокирован</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Настройки безопасности */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="w-5 h-5 text-blue-600" />
                Настройки безопасности
              </CardTitle>
              <CardDescription>Параметры доступа и безопасности</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="sendWelcomeEmail" name="sendWelcomeEmail" defaultChecked />
                    <Label htmlFor="sendWelcomeEmail" className="text-sm">
                      Отправить приветственное письмо
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox id="requirePasswordChange" name="requirePasswordChange" defaultChecked />
                    <Label htmlFor="requirePasswordChange" className="text-sm">
                      Требовать смену пароля при первом входе
                    </Label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="enableTwoFactor" name="enableTwoFactor" />
                    <Label htmlFor="enableTwoFactor" className="text-sm">
                      Включить двухфакторную аутентификацию
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox id="isActive" name="isActive" defaultChecked />
                    <Label htmlFor="isActive" className="text-sm">
                      Активировать пользователя
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white px-6">
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? "Создание..." : "Создать пользователя"}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href="/users">Отмена</Link>
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
