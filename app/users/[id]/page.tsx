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
import React, { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useState as useReactState } from "react"
import { UserProfileCard } from "@/components/user-profile-card";
import { UserActivityCard } from "@/components/user-activity-card";

export default function UserProfilePage() {
  const params = useParams<{ id: string }>()
  const id = params.id
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [actionLoading, setActionLoading] = useReactState(false)
  const [actionError, setActionError] = useReactState("")
  const [actionSuccess, setActionSuccess] = useReactState("")

  useEffect(() => {
    async function loadUser() {
      setLoading(true)
      setError("")
      try {
        const res = await fetch(`/api/users/${id}`)
        if (!res.ok) throw new Error("Ошибка загрузки пользователя")
        const data = await res.json()
        setUser(data)
      } catch (e: any) {
        setError(e.message || "Ошибка")
      } finally {
        setLoading(false)
      }
    }
    loadUser()
  }, [id])

  const handleUserAction = async (action: string) => {
    setActionLoading(true)
    setActionError("")
    setActionSuccess("")
    let body: any = { id, action }
    if (action === "reset-password") {
      const newPassword = prompt("Введите новый пароль для пользователя:")
      if (!newPassword) {
        setActionLoading(false)
        return
      }
      body.newPassword = newPassword
    }
    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error || "Ошибка операции")
      setActionSuccess("Операция выполнена успешно")
      // обновить пользователя после действия
      const userRes = await fetch(`/api/users/${id}`)
      if (userRes.ok) setUser(await userRes.json())
    } catch (e: any) {
      setActionError(e.message || "Ошибка операции")
    } finally {
      setActionLoading(false)
      setTimeout(() => setActionSuccess("") , 2000)
    }
  }

  if (loading) return <div className="p-8 text-center text-muted-foreground">Загрузка...</div>
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>
  if (!user) return <div className="p-8 text-center text-muted-foreground">Пользователь не найден</div>

  // Формируем ФИО и инициалы
  const fullName = [user.lastName, user.firstName, user.middleName].filter(Boolean).join(" ")
  const initials = [user.lastName, user.firstName, user.middleName].filter(Boolean).map((n: string) => n[0]).join("")

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

  return (
    <div className="space-y-6">
      {/* Верхняя панель управления профилем */}
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
          {/* Кнопки управления пользователем */}
          {user.status === "active" ? (
            <Button variant="outline" disabled={actionLoading} onClick={() => handleUserAction("block")}> 
              <UserX className="w-4 h-4 mr-2" />
              Заблокировать
            </Button>
          ) : (
            <Button variant="outline" disabled={actionLoading} onClick={() => handleUserAction("activate")}> 
              <UserCheck className="w-4 h-4 mr-2" />
              Активировать
            </Button>
          )}
          <Button variant="outline" disabled={actionLoading} onClick={() => handleUserAction("reset-password")}> 
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

      {(actionError || actionSuccess) && (
        <div className={"text-sm " + (actionError ? "text-red-500" : "text-green-600")}>{actionError || actionSuccess}</div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Основная информация о пользователе */}
        <div className="lg:col-span-1 space-y-6">
          <UserProfileCard user={user} />
          {/* Активность пользователя */}
          <UserActivityCard user={user} />
        </div>
        {/* Остальные секции профиля (активности, назначенные задачи и т.д.) */}
        <div className="lg:col-span-2">
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
                      {Array.isArray(user.permissions) && user.permissions.length > 0 ? (
                        user.permissions.map((permission: string, index: number) => (
                          <div key={index} className="flex items-center gap-2 p-2 border rounded">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            <span className="text-sm">{permission}</span>
                          </div>
                        ))
                      ) : (
                        <span className="text-muted-foreground text-sm">Нет данных</span>
                      )}
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
