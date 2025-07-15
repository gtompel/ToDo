"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Bell,
  Mail,
  Smartphone,
  Settings,
  Clock,
  AlertTriangle,
  CheckCircle,
  Users,
  Search,
  Send,
  Edit,
  Trash2,
  Plus,
} from "lucide-react"
import { useNotificationsSWR, Notification } from '@/hooks/use-notifications-swr';

export default function NotificationsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")

  const { notifications, isLoading, isError } = useNotificationsSWR();

  const notificationSettings = {
    incidents: {
      browser: true,
      email: true,
      sms: false,
      push: true,
    },
    requests: {
      browser: true,
      email: true,
      sms: false,
      push: false,
    },
    changes: {
      browser: true,
      email: false,
      sms: false,
      push: false,
    },
    sla: {
      browser: true,
      email: true,
      sms: true,
      push: true,
    },
    knowledge: {
      browser: false,
      email: true,
      sms: false,
      push: false,
    },
  }

  const emailTemplates = [
    {
      id: "incident_assigned",
      name: "Назначение инцидента",
      subject: "Вам назначен инцидент {{incident.id}}",
      description: "Уведомление о назначении нового инцидента",
      category: "Инциденты",
      active: true,
    },
    {
      id: "request_approval",
      name: "Запрос на утверждение",
      subject: "Требуется утверждение запроса {{request.id}}",
      description: "Уведомление о необходимости утверждения запроса",
      category: "Запросы",
      active: true,
    },
    {
      id: "sla_breach",
      name: "Нарушение SLA",
      subject: "КРИТИЧНО: Нарушение SLA по {{item.type}} {{item.id}}",
      description: "Уведомление о нарушении соглашения об уровне обслуживания",
      category: "SLA",
      active: true,
    },
    {
      id: "change_approved",
      name: "Изменение утверждено",
      subject: "Изменение {{change.id}} утверждено",
      description: "Уведомление об утверждении изменения",
      category: "Изменения",
      active: false,
    },
  ]

  const escalationRules = [
    {
      id: "rule_001",
      name: "Эскалация критических инцидентов",
      condition: "Инцидент с приоритетом 'Критический' не решен в течение 1 часа",
      action: "Уведомить руководителя службы",
      active: true,
      channels: ["email", "sms"],
    },
    {
      id: "rule_002",
      name: "Эскалация запросов на утверждение",
      condition: "Запрос не утвержден в течение 24 часов",
      action: "Уведомить вышестоящего руководителя",
      active: true,
      channels: ["email"],
    },
    {
      id: "rule_003",
      name: "Эскалация изменений",
      condition: "Изменение не рассмотрено в течение 48 часов",
      action: "Уведомить комитет по изменениям",
      active: false,
      channels: ["email", "push"],
    },
  ]

  const getTypeColor = (type: string) => {
    switch (type) {
      case "incident":
        return "bg-red-100 text-red-800"
      case "request":
        return "bg-blue-100 text-blue-800"
      case "change":
        return "bg-purple-100 text-purple-800"
      case "sla":
        return "bg-orange-100 text-orange-800"
      case "knowledge":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-500 text-white"
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      (notification.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (notification.message?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || notification.type === filterType;
    const matchesStatus = filterStatus === "all" || notification.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  })

  if (isLoading) {
    return <div className="p-4">Загрузка уведомлений...</div>;
  }
  if (isError) {
    return <div className="p-4 text-red-500">Ошибка загрузки уведомлений</div>;
  }

  const handleSettingChange = (category: string, channel: string, value: boolean) => {
    console.log(`Изменение настройки: ${category}.${channel} = ${value}`)
  }

  const handleTemplateAction = (action: string, templateId: string) => {
    console.log(`Действие ${action} для шаблона ${templateId}`)
  }

  const handleRuleAction = (action: string, ruleId: string) => {
    console.log(`Действие ${action} для правила ${ruleId}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Центр уведомлений</h1>
          <p className="text-muted-foreground">Управление уведомлениями и настройками рассылок</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Send className="w-4 h-4 mr-2" />
            Отправить тестовое
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Создать правило
          </Button>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего уведомлений</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notifications.length}</div>
            <p className="text-xs text-muted-foreground">За последние 24 часа</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Непрочитанные</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notifications.filter((n) => n.status === "unread").length}</div>
            <p className="text-xs text-muted-foreground">Требуют внимания</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Email отправлено</CardTitle>
            <Mail className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">За сегодня</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Активные правила</CardTitle>
            <Settings className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{escalationRules.filter((r) => r.active).length}</div>
            <p className="text-xs text-muted-foreground">Правил эскалации</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="notifications" className="space-y-4">
        <TabsList>
          <TabsTrigger value="notifications">Уведомления</TabsTrigger>
          <TabsTrigger value="settings">Настройки</TabsTrigger>
          <TabsTrigger value="templates">Шаблоны</TabsTrigger>
          <TabsTrigger value="escalation">Эскалация</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-4">
          {/* Фильтры */}
          <Card>
            <CardHeader>
              <CardTitle>Фильтры уведомлений</CardTitle>
              <CardDescription>Найдите нужные уведомления</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Поиск по заголовку или содержанию..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Тип" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все типы</SelectItem>
                    <SelectItem value="incident">Инциденты</SelectItem>
                    <SelectItem value="request">Запросы</SelectItem>
                    <SelectItem value="change">Изменения</SelectItem>
                    <SelectItem value="sla">SLA</SelectItem>
                    <SelectItem value="knowledge">База знаний</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Статус" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все статусы</SelectItem>
                    <SelectItem value="unread">Непрочитанные</SelectItem>
                    <SelectItem value="read">Прочитанные</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Список уведомлений */}
          <Card>
            <CardHeader>
              <CardTitle>История уведомлений ({filteredNotifications.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border rounded-lg ${notification.status === "unread" ? "bg-blue-50 border-blue-200" : ""}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge className={getTypeColor(notification.type || '')}>
                            {notification.type === "incident"
                              ? "Инцидент"
                              : notification.type === "request"
                                ? "Запрос"
                                : notification.type === "change"
                                  ? "Изменение"
                                  : notification.type === "sla"
                                    ? "SLA"
                                    : "База знаний"}
                          </Badge>
                          <Badge className={getPriorityColor(notification.priority || '')}>
                            {notification.priority === "critical"
                              ? "Критический"
                              : notification.priority === "high"
                                ? "Высокий"
                                : notification.priority === "medium"
                                  ? "Средний"
                                  : "Низкий"}
                          </Badge>
                          {notification.status === "unread" && (
                            <Badge variant="outline" className="bg-blue-100 text-blue-800">
                              Новое
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-semibold">{notification.title}</h3>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {notification.timestamp}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            От: {notification.sender}
                          </span>
                          <span>Кому: {notification.recipient}</span>
                        </div>
                        <div className="flex gap-1">
                          {(notification.channels || []).map((channel: string) => (
                            <Badge key={channel} variant="secondary" className="text-xs">
                              {channel === "browser"
                                ? "Браузер"
                                : channel === "email"
                                  ? "Email"
                                  : channel === "sms"
                                    ? "SMS"
                                    : "Push"}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon">
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Настройки уведомлений</CardTitle>
              <CardDescription>Выберите способы получения уведомлений для разных типов событий</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(notificationSettings).map(([category, settings]) => (
                  <div key={category} className="space-y-4">
                    <h3 className="text-lg font-semibold capitalize">
                      {category === "incidents"
                        ? "Инциденты"
                        : category === "requests"
                          ? "Запросы"
                          : category === "changes"
                            ? "Изменения"
                            : category === "sla"
                              ? "SLA"
                              : "База знаний"}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`${category}-browser`}
                          checked={settings.browser}
                          onCheckedChange={(checked) => handleSettingChange(category, "browser", checked)}
                        />
                        <Label htmlFor={`${category}-browser`} className="flex items-center gap-2">
                          <Bell className="w-4 h-4" />
                          Браузер
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`${category}-email`}
                          checked={settings.email}
                          onCheckedChange={(checked) => handleSettingChange(category, "email", checked)}
                        />
                        <Label htmlFor={`${category}-email`} className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          Email
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`${category}-sms`}
                          checked={settings.sms}
                          onCheckedChange={(checked) => handleSettingChange(category, "sms", checked)}
                        />
                        <Label htmlFor={`${category}-sms`} className="flex items-center gap-2">
                          <Smartphone className="w-4 h-4" />
                          SMS
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`${category}-push`}
                          checked={settings.push}
                          onCheckedChange={(checked) => handleSettingChange(category, "push", checked)}
                        />
                        <Label htmlFor={`${category}-push`} className="flex items-center gap-2">
                          <Smartphone className="w-4 h-4" />
                          Push
                        </Label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Общие настройки</CardTitle>
              <CardDescription>Дополнительные параметры уведомлений</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Тихие часы</Label>
                  <p className="text-sm text-muted-foreground">Не отправлять уведомления в нерабочее время</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Группировка уведомлений</Label>
                  <p className="text-sm text-muted-foreground">Объединять похожие уведомления</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Звуковые уведомления</Label>
                  <p className="text-sm text-muted-foreground">Воспроизводить звук при получении уведомления</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Desktop уведомления</Label>
                  <p className="text-sm text-muted-foreground">Показывать уведомления на рабочем столе</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Шаблоны email-уведомлений</h3>
              <p className="text-sm text-muted-foreground">Настройка шаблонов для автоматических рассылок</p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Создать шаблон
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {emailTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant={template.active ? "default" : "secondary"}>
                        {template.active ? "Активен" : "Отключен"}
                      </Badge>
                      <Badge variant="outline">{template.category}</Badge>
                    </div>
                  </div>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Тема письма:</Label>
                      <p className="text-sm text-muted-foreground font-mono bg-muted p-2 rounded">{template.subject}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                        <Edit className="w-3 h-3 mr-1" />
                        Редактировать
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-transparent"
                        onClick={() => handleTemplateAction("toggle", template.id)}
                      >
                        {template.active ? "Отключить" : "Включить"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="escalation" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Правила эскалации</h3>
              <p className="text-sm text-muted-foreground">Автоматическая эскалация при нарушении SLA</p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Создать правило
            </Button>
          </div>

          <div className="space-y-4">
            {escalationRules.map((rule) => (
              <Card key={rule.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{rule.name}</h3>
                        <Badge variant={rule.active ? "default" : "secondary"}>
                          {rule.active ? "Активно" : "Отключено"}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <Label className="text-sm font-medium">Условие:</Label>
                          <p className="text-sm text-muted-foreground">{rule.condition}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Действие:</Label>
                          <p className="text-sm text-muted-foreground">{rule.action}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Каналы:</Label>
                          <div className="flex gap-1 mt-1">
                            {(rule.channels || []).map((channel: string) => (
                              <Badge key={channel} variant="secondary" className="text-xs">
                                {channel === "email" ? "Email" : channel === "sms" ? "SMS" : "Push"}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="w-3 h-3 mr-1" />
                        Изменить
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleRuleAction("toggle", rule.id)}>
                        {rule.active ? "Отключить" : "Включить"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
