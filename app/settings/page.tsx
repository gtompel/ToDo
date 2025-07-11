"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Settings, Bell, Mail, Shield, Database, Clock, Save, RefreshCw, AlertTriangle } from "lucide-react"

// Страница общих настроек системы
export default function SettingsPage() {
  // Состояния для всех настроек системы
  const [settings, setSettings] = useState({
    // Общие настройки
    systemName: "ITSM System",
    systemDescription: "Система управления IT-сервисами",
    timezone: "Europe/Moscow",
    language: "ru",

    // Уведомления
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    notificationFrequency: "immediate",

    // Безопасность
    sessionTimeout: "30",
    passwordMinLength: "8",
    requireTwoFactor: false,
    allowPasswordReset: true,

    // База данных
    backupFrequency: "daily",
    retentionPeriod: "90",
    autoCleanup: true,

    // Интеграции
    emailServer: "smtp.company.com",
    emailPort: "587",
    emailUsername: "itsm@company.com",
    emailPassword: "",

    // SLA настройки
    incidentResponseTime: "4",
    requestResponseTime: "24",
    escalationTime: "2",
  })

  // Обработчик изменения значения настройки
  const handleSettingChange = (key: string, value: string | boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  // Сохранить настройки
  const handleSave = () => {
    // Здесь будет логика сохранения настроек
    console.log("Saving settings:", settings)
  }

  // Сбросить настройки к значениям по умолчанию
  const handleReset = () => {
    // Здесь будет логика сброса к значениям по умолчанию
    console.log("Resetting settings")
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Настройки системы</h1>
          <p className="text-muted-foreground">Конфигурация и управление параметрами ITSM системы</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Сбросить
          </Button>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Сохранить
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Общие
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Уведомления
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Безопасность
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            База данных
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Интеграции
          </TabsTrigger>
          <TabsTrigger value="sla" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            SLA
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Основные настройки</CardTitle>
              <CardDescription>Базовая конфигурация системы</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="systemName">Название системы</Label>
                  <Input
                    id="systemName"
                    value={settings.systemName}
                    onChange={(e) => handleSettingChange("systemName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Часовой пояс</Label>
                  <Select value={settings.timezone} onValueChange={(value) => handleSettingChange("timezone", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Europe/Moscow">Москва (UTC+3)</SelectItem>
                      <SelectItem value="Europe/Kiev">Киев (UTC+2)</SelectItem>
                      <SelectItem value="Asia/Almaty">Алматы (UTC+6)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="systemDescription">Описание системы</Label>
                <Textarea
                  id="systemDescription"
                  value={settings.systemDescription}
                  onChange={(e) => handleSettingChange("systemDescription", e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Язык интерфейса</Label>
                <Select value={settings.language} onValueChange={(value) => handleSettingChange("language", value)}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ru">Русский</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="uk">Українська</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Настройки уведомлений</CardTitle>
              <CardDescription>Конфигурация системы уведомлений</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email уведомления</Label>
                    <p className="text-sm text-muted-foreground">Отправка уведомлений по электронной почте</p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => handleSettingChange("emailNotifications", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push уведомления</Label>
                    <p className="text-sm text-muted-foreground">Уведомления в браузере</p>
                  </div>
                  <Switch
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => handleSettingChange("pushNotifications", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS уведомления</Label>
                    <p className="text-sm text-muted-foreground">Отправка SMS для критических событий</p>
                  </div>
                  <Switch
                    checked={settings.smsNotifications}
                    onCheckedChange={(checked) => handleSettingChange("smsNotifications", checked)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Частота уведомлений</Label>
                <Select
                  value={settings.notificationFrequency}
                  onValueChange={(value) => handleSettingChange("notificationFrequency", value)}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Немедленно</SelectItem>
                    <SelectItem value="hourly">Каждый час</SelectItem>
                    <SelectItem value="daily">Ежедневно</SelectItem>
                    <SelectItem value="weekly">Еженедельно</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Настройки безопасности</CardTitle>
              <CardDescription>Конфигурация параметров безопасности системы</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Таймаут сессии (минуты)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => handleSettingChange("sessionTimeout", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passwordMinLength">Минимальная длина пароля</Label>
                  <Input
                    id="passwordMinLength"
                    type="number"
                    value={settings.passwordMinLength}
                    onChange={(e) => handleSettingChange("passwordMinLength", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Двухфакторная аутентификация</Label>
                    <p className="text-sm text-muted-foreground">Обязательная 2FA для всех пользователей</p>
                  </div>
                  <Switch
                    checked={settings.requireTwoFactor}
                    onCheckedChange={(checked) => handleSettingChange("requireTwoFactor", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Самостоятельный сброс пароля</Label>
                    <p className="text-sm text-muted-foreground">Разрешить пользователям сбрасывать пароли</p>
                  </div>
                  <Switch
                    checked={settings.allowPasswordReset}
                    onCheckedChange={(checked) => handleSettingChange("allowPasswordReset", checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Настройки базы данных</CardTitle>
              <CardDescription>Конфигурация резервного копирования и обслуживания БД</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Частота резервного копирования</Label>
                  <Select
                    value={settings.backupFrequency}
                    onValueChange={(value) => handleSettingChange("backupFrequency", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Каждый час</SelectItem>
                      <SelectItem value="daily">Ежедневно</SelectItem>
                      <SelectItem value="weekly">Еженедельно</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="retentionPeriod">Период хранения (дни)</Label>
                  <Input
                    id="retentionPeriod"
                    type="number"
                    value={settings.retentionPeriod}
                    onChange={(e) => handleSettingChange("retentionPeriod", e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Автоматическая очистка</Label>
                  <p className="text-sm text-muted-foreground">Автоматическое удаление старых записей</p>
                </div>
                <Switch
                  checked={settings.autoCleanup}
                  onCheckedChange={(checked) => handleSettingChange("autoCleanup", checked)}
                />
              </div>

              <div className="p-4 border rounded-lg bg-yellow-50">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="font-medium text-yellow-800">Статус базы данных</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Размер БД:</span>
                    <Badge variant="secondary">2.4 GB</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Последний бэкап:</span>
                    <Badge variant="secondary">2 часа назад</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Статус:</span>
                    <Badge className="bg-green-100 text-green-800">Здоровая</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Настройки интеграций</CardTitle>
              <CardDescription>Конфигурация внешних сервисов и интеграций</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Email сервер (SMTP)</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emailServer">Сервер</Label>
                    <Input
                      id="emailServer"
                      value={settings.emailServer}
                      onChange={(e) => handleSettingChange("emailServer", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emailPort">Порт</Label>
                    <Input
                      id="emailPort"
                      value={settings.emailPort}
                      onChange={(e) => handleSettingChange("emailPort", e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emailUsername">Имя пользователя</Label>
                    <Input
                      id="emailUsername"
                      value={settings.emailUsername}
                      onChange={(e) => handleSettingChange("emailUsername", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emailPassword">Пароль</Label>
                    <Input
                      id="emailPassword"
                      type="password"
                      value={settings.emailPassword}
                      onChange={(e) => handleSettingChange("emailPassword", e.target.value)}
                    />
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Проверить подключение
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sla" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Настройки SLA</CardTitle>
              <CardDescription>Конфигурация соглашений об уровне обслуживания</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="incidentResponseTime">Время реакции на инциденты (часы)</Label>
                  <Input
                    id="incidentResponseTime"
                    type="number"
                    value={settings.incidentResponseTime}
                    onChange={(e) => handleSettingChange("incidentResponseTime", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="requestResponseTime">Время реакции на запросы (часы)</Label>
                  <Input
                    id="requestResponseTime"
                    type="number"
                    value={settings.requestResponseTime}
                    onChange={(e) => handleSettingChange("requestResponseTime", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="escalationTime">Время эскалации (часы)</Label>
                  <Input
                    id="escalationTime"
                    type="number"
                    value={settings.escalationTime}
                    onChange={(e) => handleSettingChange("escalationTime", e.target.value)}
                  />
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-3">Матрица приоритетов</h4>
                <div className="grid grid-cols-4 gap-2 text-sm">
                  <div className="font-medium">Приоритет</div>
                  <div className="font-medium">Время реакции</div>
                  <div className="font-medium">Время решения</div>
                  <div className="font-medium">Эскалация</div>

                  <div>Критический</div>
                  <div>15 мин</div>
                  <div>4 часа</div>
                  <div>1 час</div>

                  <div>Высокий</div>
                  <div>1 час</div>
                  <div>8 часов</div>
                  <div>2 часа</div>

                  <div>Средний</div>
                  <div>4 часа</div>
                  <div>24 часа</div>
                  <div>8 часов</div>

                  <div>Низкий</div>
                  <div>8 часов</div>
                  <div>72 часа</div>
                  <div>24 часа</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
