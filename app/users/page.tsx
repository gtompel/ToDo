"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Edit, MoreHorizontal, Users, RefreshCw, Phone, BadgeIcon as IdCard } from "lucide-react"
import Link from "next/link"
import { getUsers } from "@/lib/actions/users"
import dynamic from 'next/dynamic';

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  middleName?: string | null
  phone?: string | null
  position?: string | null
  department?: string | null
  role: string
  status?: string
  isActive: boolean
  lastLogin?: Date | null
  createdAt: Date
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [departmentFilter, setDepartmentFilter] = useState("all")

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const data = await getUsers()
      setUsers(data)
    } catch (error) {
      console.error("Error loading users:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "blocked":
        return "bg-red-100 text-red-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "Администратор"
      case "MANAGER":
        return "Менеджер"
      case "TECHNICIAN":
        return "Техник"
      case "USER":
        return "Пользователь"
      default:
        return role
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Активен"
      case "blocked":
        return "Заблокирован"
      case "inactive":
        return "Неактивен"
      default:
        return status
    }
  }

  const filteredUsers = users.filter((user) => {
    const fullName = `${user.lastName} ${user.firstName} ${user.middleName || ""}`.toLowerCase()
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    const matchesDepartment = departmentFilter === "all" || user.department === departmentFilter

    return matchesSearch && matchesRole && matchesDepartment
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                <Users className="w-6 h-6 text-blue-600" />
                Пользователи системы
              </h1>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
              <p className="text-gray-600">Загрузка пользователей...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const UsersTableClient = dynamic(() => import('./UsersTableClient'), {
    loading: () => <div className="flex items-center justify-center h-64"><div className="text-center"><RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" /><p className="text-gray-600">Загрузка таблицы пользователей...</p></div></div>,
    ssr: false,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-600" />
              Пользователи системы
            </h1>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={loadUsers} className="border-gray-300 bg-transparent">
              <RefreshCw className="w-4 h-4 mr-2" />
              Обновить
            </Button>
            <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
              <Link href="/users/new">
                <Plus className="w-4 h-4 mr-2" />
                Добавить пользователя
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Stats */}
        <div className="mb-6">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>
              Всего пользователей: <span className="font-medium text-blue-600">{users.length}</span>
            </span>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Введите значение для поиска"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full md:w-48 h-10">
                  <SelectValue placeholder="Роли" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все роли</SelectItem>
                  <SelectItem value="ADMIN">Администратор</SelectItem>
                  <SelectItem value="MANAGER">Менеджер</SelectItem>
                  <SelectItem value="TECHNICIAN">Техник</SelectItem>
                  <SelectItem value="USER">Пользователь</SelectItem>
                </SelectContent>
              </Select>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white h-10 px-6">
                <Search className="w-4 h-4 mr-2" />
                Сбросить
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardContent className="p-0">
            <UsersTableClient users={filteredUsers} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
