"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus, Search, Eye, Edit, MoreHorizontal, Shield, Users, Settings, Trash2 } from "lucide-react"
import Link from "next/link"

export default function RolesPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const roles = [
    {
      id: "admin",
      name: "Администратор ITSM",
      description: "Полный доступ ко всем функциям системы",
      users: 2,
      permissions: [
        "incidents.*",
        "requests.*",
        "knowledge.*",
        "reports.*",
        "users.*",
        "system.*",
        "changes.*",
        "assets.*",
      ],
      color: "bg-red-100 text-red-800",
      system: true,
    },
    {
      id: "sysadmin",
      name: "Системный администратор",
      description: "Управление инцидентами и инфраструктурой",
      users: 5,
      permissions: [
        "incidents.manage",
        "requests.view",
        "knowledge.contribute",
        "reports.view",
        "changes.approve",
        "assets.manage",
      ],
      color: "bg-blue-100 text-blue-800",
      system: true,
    },
    {
      id: "support",
      name: "Специалист поддержки",
      description: "Обработка запросов пользователей",
      users: 12,
      permissions: ["incidents.view", "incidents.assign", "requests.manage", "knowledge.view", "knowledge.contribute"],
      color: "bg-green-100 text-green-800",
      system: true,
    },
    {
      id: "manager",
      name: "Менеджер",
      description: "Просмотр отчетов и аналитики",
      users: 3,
      permissions: ["reports.view", "analytics.view", "team.view", "changes.view"],
      color: "bg-purple-100 text-purple-800",
      system: false,
    },
    {
      id: "user",
      name: "Пользователь",
      description: "Создание запросов на обслуживание",
      users: 156,
      permissions: ["requests.create", "knowledge.view", "profile.edit"],
      color: "bg-gray-100 text-gray-800",
      system: true,
    },
  ]

  const permissions = [
    {
      category: "Инциденты",
      items: [
        { id: "incidents.view", name: "Просмотр инцидентов", description: "Просмотр списка и деталей инцидентов" },
        { id: "incidents.create", name: "Создание инцидентов", description: "Создание новых инцидентов" },
        { id: "incidents.assign", name: "Назначение инцидентов", description: "Назначение инцидентов исполнителям" },
        { id: "incidents.manage", name: "Управление инцидентами", description: "Полное управление инцидентами" },
        { id: "incidents.*", name: "Все права на инциденты", description: "Полный доступ к инцидентам" },
      ],
    },
    {
      category: "Запросы",
      items: [
        { id: "requests.view", name: "Просмотр запросов", description: "Просмотр запросов на обслуживание" },
        { id: "requests.create", name: "Создание запросов", description: "Создание новых запросов" },
        { id: "requests.manage", name: "Управление запросами", description: "Обработка и управление запросами" },
        { id: "requests.*", name: "Все права на запросы", description: "Полный доступ к запросам" },
      ],
    },
    {
      category: "База знаний",
      items: [
        { id: "knowledge.view", name: "Просмотр базы знаний", description: "Чтение статей базы знаний" },
        { id: "knowledge.contribute", name: "Создание статей", description: "Создание и редактирование статей" },
        { id: "knowledge.manage", name: "Управление базой знаний", description: "Модерация и управление статьями" },
        { id: "knowledge.*", name: "Все права на базу знаний", description: "Полный доступ к базе знаний" },
      ],
    },
    {
      category: "Отчеты",
      items: [
        { id: "reports.view", name: "Просмотр отчетов", description: "Просмотр стандартных отчетов" },
        { id: "reports.create", name: "Создание отчетов", description: "Создание пользовательских отчетов" },
        { id: "analytics.view", name: "Просмотр аналитики", description: "Доступ к аналитическим дашбордам" },
        { id: "reports.*", name: "Все права на отчеты", description: "Полный доступ к отчетности" },
      ],
    },
    {
      category: "Пользователи",
      items: [
        { id: "users.view", name: "Просмотр пользователей", description: "Просмотр списка пользователей" },
        {
          id: "users.manage",
          name: "Управление пользователями",
          description: "Создание и редактирование пользователей",
        },
        { id: "team.view", name: "Просмотр команды", description: "Просмотр информации о команде" },
        { id: "users.*", name: "Все права на пользователей", description: "Полное управление пользователями" },
      ],
    },
    {
      category: "Система",
      items: [
        { id: "system.config", name: "Настройка системы", description: "Изменение конфигурации системы" },
        { id: "system.audit", name: "Просмотр аудита", description: "Доступ к журналам аудита" },
        { id: "system.backup", name: "Резервное копирование", description: "Управление резервными копиями" },
        { id: "system.*", name: "Все системные права", description: "Полный административный доступ" },
      ],
    },
  ]

  const filteredRoles = roles.filter(
    (role) =>
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleRoleAction = (action: string, roleId: string) => {
    console.log(`Действие ${action} для роли ${roleId}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Управление ролями</h1>
          <p className="text-muted-foreground">Настройка ролей и прав доступа в системе</p>
        </div>
        <Button asChild>
          <Link href="/users/roles/new">
            <Plus className="w-4 h-4 mr-2" />
            Создать роль
          </Link>
        </Button>
      </div>

      {/* Статистика */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего ролей</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roles.length}</div>
            <p className="text-xs text-muted-foreground">Системных и пользовательских</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Системные роли</CardTitle>
            <Settings className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roles.filter((r) => r.system).length}</div>
            <p className="text-xs text-muted-foreground">Встроенные роли</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Пользовательские</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roles.filter((r) => !r.system).length}</div>
            <p className="text-xs text-muted-foreground">Созданные администратором</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Назначений</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roles.reduce((sum, role) => sum + role.users, 0)}</div>
            <p className="text-xs text-muted-foreground">Всего назначений ролей</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="roles" className="space-y-4">
        <TabsList>
          <TabsTrigger value="roles">Роли</TabsTrigger>
          <TabsTrigger value="permissions">Разрешения</TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-4">
          {/* Поиск */}
          <Card>
            <CardHeader>
              <CardTitle>Поиск ролей</CardTitle>
              <CardDescription>Найдите нужную роль</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Поиск по названию или описанию..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Список ролей */}
          <Card>
            <CardHeader>
              <CardTitle>Роли ({filteredRoles.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Название</TableHead>
                      <TableHead>Описание</TableHead>
                      <TableHead>Пользователи</TableHead>
                      <TableHead>Разрешения</TableHead>
                      <TableHead>Тип</TableHead>
                      <TableHead>Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRoles.map((role) => (
                      <TableRow key={role.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge className={role.color}>{role.name}</Badge>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <p className="text-sm text-muted-foreground line-clamp-2">{role.description}</p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{role.users} польз.</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {role.permissions.slice(0, 2).map((permission, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {permission}
                              </Badge>
                            ))}
                            {role.permissions.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{role.permissions.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={role.system ? "default" : "outline"}>
                            {role.system ? "Системная" : "Пользовательская"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Действия</DropdownMenuLabel>
                              <DropdownMenuItem asChild>
                                <Link href={`/users/roles/${role.id}`}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  Просмотр
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/users/roles/${role.id}/edit`}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Редактировать
                                </Link>
                              </DropdownMenuItem>
                              {!role.system && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleRoleAction("delete", role.id)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Удалить
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Доступные разрешения</CardTitle>
              <CardDescription>Все разрешения в системе, сгруппированные по категориям</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {permissions.map((category, index) => (
                  <div key={index} className="space-y-3">
                    <h3 className="text-lg font-semibold">{category.category}</h3>
                    <div className="grid gap-3 md:grid-cols-2">
                      {category.items.map((permission) => (
                        <div key={permission.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{permission.name}</h4>
                            <Badge variant="outline" className="text-xs">
                              {permission.id}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{permission.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
