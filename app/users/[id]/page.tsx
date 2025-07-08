"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  ArrowLeft,
  Edit,
  Mail,
  Phone,
  Building,
  Calendar,
  Shield,
  Activity,
  Clock,
  UserCheck,
  UserX,
  Settings,
} from "lucide-react"
import Link from "next/link"

export default function UserProfilePage({ params }: { params: { id: string } }) {
  // В реальном приложении данные будут загружаться по ID
  const user = {
    id: params.id,
    name: "Иванов Иван Иванович",
    email: "i.ivanov@company.com",
    phone: "+7 (999) 123-45-67",
    position: "Системный администратор",
    department: "IT отдел",
    manager: "Петров П.П.",
    role: "Системный администратор",
    status: "Активен",
    created: "2023-06-15",
    lastLogin: "2024-01-15 14:30",
    lastActivity: "2024-01-15 16:45",
    avatar: "/placeholder-user.jpg",
    permissions: [
      "incidents.manage",
      "requests.view",
      "knowledge.contribute",
      "reports.view",
      "changes.approve",
      "assets.manage",
    ],
    twoFactorEnabled: true,
    passwordLastChanged: "2023-12-01",
  }

  const activityLog = [
    {
      id: 1,
      action: "Авторизация в системе",
      timestamp: "2024-01-15 16:45",
      ip: "192.168.1.100",
      status: "success",
    },
    {
      id: 2,
      action: "Создание инцидента INC-045",
      timestamp: "2024-01-15 15:30",
      ip: "192.168.1.100",
      status: "success",
    },
    {
      id: 3,
      action: "Обновление статьи KB-012",
      timestamp: "2024-01-15 14:15",
      ip: "192.168.1.100",
      status: "success",
    },
    {
      id: 4,
      action: "Неудачная попытка входа",
      timestamp: "2024-01-14 09:20",
      ip: "192.168.1.105",
      status: "error",
    },
  ]

  const assignedItems = [
    { type: "incident", id: "INC-023", title: "Проблемы с почтовым сервером", priority: "Высокий", status: "В работе" },
    { type: "incident", id: "INC-028", title: "Медленная работа сети", priority: "Средний", status: "Назначен" },
    { type: "request", id: "REQ-015", title: "Установка ПО", priority: "Низкий", status: "В работе" },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Активен":
        return "bg-green-100 text-green-800"
      case "Заблокирован":
        return "bg-red-100 text-red-800"
      case "Неактивен":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getActivityStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-500"
      case "error":
        return "bg-red-500"
      case "warning":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  const handleUserAction = (action: string) => {
    console.log(`Действие ${action} для пользователя ${user.id}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/users">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Профиль пользователя</h1>
          <p className="text-muted-foreground">Детальная информация о пользователе</p>
        </div>
        <div className="flex gap-2">
          {user.status === "Активен" ? (
            <Button variant="outline" onClick={() => handleUserAction("block")}>
              <UserX className="w-4 h-4 mr-2" />
              Заблокировать
            </Button>
          ) : (
            <Button variant="outline" onClick={() => handleUserAction("activate")}>
              <UserCheck className="w-4 h-4 mr-2" />
              Активировать
            </Button>
          )}
          <Button variant="outline" onClick={() => handleUserAction("reset-password")}>
            <Settings className="w-4 h-4 mr-2" />
            Сбросить пароль
          </Button>
          <Button asChild>
            <Link href={`/users/${user.id}/edit`}>
              <Edit className="w-4 h-4 mr-2" />
              Редактировать
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
          {/* Основная информация */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                  <AvatarFallback className="text-lg">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-semibold">{user.name}</h2>
                  <p className="text-muted-foreground">{user.position}</p>
                </div>
                <Badge className={getStatusColor(user.status)}>{user.status}</Badge>
              </div>

              <Separator className="my-6" />

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Телефон</p>
                    <p className="text-sm text-muted-foreground">{user.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Building className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Подразделение</p>
                    <p className="text-sm text-muted-foreground">{user.department}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Дата создания</p>
                    <p className="text-sm text-muted-foreground">{user.created}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Статистика активности */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Активность
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Последний вход:</span>
                <span className="text-sm font-medium">{user.lastLogin}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Последняя активность:</span>
                <span className="text-sm font-medium">{user.lastActivity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Смена пароля:</span>
                <span className="text-sm font-medium">{user.passwordLastChanged}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">2FA:</span>
                <Badge variant={user.twoFactorEnabled ? "default" : "secondary"}>
                  {user.twoFactorEnabled ? "Включена" : "Отключена"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="permissions" className="space-y-4">
            <TabsList>
              <TabsTrigger value="permissions">Права доступа</TabsTrigger>
              <TabsTrigger value="assigned">Назначенные задачи</TabsTrigger>
              <TabsTrigger value="activity">Журнал активности</TabsTrigger>
            </TabsList>

            <TabsContent value="permissions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Роль и разрешения
                  </CardTitle>
                  <CardDescription>Текущие права доступа пользователя</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Роль</h4>
                    <Badge className="bg-blue-100 text-blue-800">{user.role}</Badge>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-3">Разрешения</h4>
                    <div className="grid gap-2 md:grid-cols-2">
                      {user.permissions.map((permission, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 border rounded">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          <span className="text-sm">{permission}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-2">Руководитель</h4>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">ПП</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{user.manager}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="assigned" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Назначенные задачи</CardTitle>
                  <CardDescription>Текущие инциденты и запросы</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {assignedItems.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="text-xs">
                            {item.type === "incident" ? "INC" : "REQ"}
                          </Badge>
                          <div>
                            <div className="font-medium">{item.id}</div>
                            <div className="text-sm text-muted-foreground">{item.title}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            className={
                              item.priority === "Высокий"
                                ? "bg-red-100 text-red-800"
                                : item.priority === "Средний"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-green-100 text-green-800"
                            }
                          >
                            {item.priority}
                          </Badge>
                          <Badge variant="outline">{item.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Журнал активности
                  </CardTitle>
                  <CardDescription>Последние действия пользователя</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activityLog.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${getActivityStatusColor(activity.status)}`} />
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">{activity.action}</p>
                            <Badge variant={activity.status === "success" ? "default" : "destructive"}>
                              {activity.status === "success" ? "Успешно" : "Ошибка"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{activity.timestamp}</span>
                            <span>IP: {activity.ip}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4 bg-transparent">
                    Показать больше
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
