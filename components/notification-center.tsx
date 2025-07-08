"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, Check, X, Settings, AlertTriangle, Clock, CheckCircle } from "lucide-react"
import Link from "next/link"

interface Notification {
  id: string
  title: string
  message: string
  type: "incident" | "request" | "change" | "sla" | "knowledge"
  priority: "critical" | "high" | "medium" | "low"
  timestamp: string
  read: boolean
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "Новый критический инцидент",
      message: "INC-045: Недоступность почтового сервера",
      type: "incident",
      priority: "critical",
      timestamp: "2 мин назад",
      read: false,
    },
    {
      id: "2",
      title: "Запрос требует утверждения",
      message: "REQ-023: Установка ПО на рабочее место",
      type: "request",
      priority: "medium",
      timestamp: "15 мин назад",
      read: false,
    },
    {
      id: "3",
      title: "Изменение завершено",
      message: "CHG-015: Обновление сетевого оборудования",
      type: "change",
      priority: "low",
      timestamp: "1 час назад",
      read: true,
    },
    {
      id: "4",
      title: "Нарушение SLA",
      message: "INC-042: Превышено время решения",
      type: "sla",
      priority: "high",
      timestamp: "2 часа назад",
      read: false,
    },
  ])

  const [isOpen, setIsOpen] = useState(false)

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "incident":
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      case "request":
        return <Clock className="w-4 h-4 text-blue-500" />
      case "change":
        return <Settings className="w-4 h-4 text-purple-500" />
      case "sla":
        return <AlertTriangle className="w-4 h-4 text-orange-500" />
      default:
        return <CheckCircle className="w-4 h-4 text-green-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-500"
      case "high":
        return "bg-orange-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  // Симуляция real-time уведомлений
  useEffect(() => {
    const interval = setInterval(() => {
      // Случайно добавляем новые уведомления для демонстрации
      if (Math.random() > 0.95) {
        const newNotification: Notification = {
          id: Date.now().toString(),
          title: "Новое уведомление",
          message: "Тестовое real-time уведомление",
          type: "incident",
          priority: "medium",
          timestamp: "Только что",
          read: false,
        }
        setNotifications((prev) => [newNotification, ...prev.slice(0, 9)])
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end" forceMount>
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Уведомления</span>
          <div className="flex gap-1">
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                <Check className="w-3 h-3 mr-1" />
                Все прочитано
              </Button>
            )}
            <Button variant="ghost" size="sm" asChild>
              <Link href="/notifications">
                <Settings className="w-3 h-3" />
              </Link>
            </Button>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-96">
          {notifications.length > 0 ? (
            <div className="space-y-1">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 hover:bg-muted cursor-pointer border-l-2 ${
                    notification.read ? "border-transparent" : getPriorityColor(notification.priority)
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    {getTypeIcon(notification.type)}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-medium ${notification.read ? "text-muted-foreground" : ""}`}>
                          {notification.title}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-1"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeNotification(notification.id)
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
                      <p className="text-xs text-muted-foreground">{notification.timestamp}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Нет новых уведомлений</p>
            </div>
          )}
        </ScrollArea>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/notifications" className="w-full text-center">
            Показать все уведомления
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
