"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, AlertTriangle, Clock, Settings, CheckCircle } from "lucide-react"

interface ToastNotification {
  id: string
  title: string
  message: string
  type: "incident" | "request" | "change" | "sla" | "knowledge"
  priority: "critical" | "high" | "medium" | "low"
  action?: {
    label: string
    onClick: () => void
  }
}

interface NotificationToastProps {
  notifications: ToastNotification[]
  onDismiss: (id: string) => void
}

export function NotificationToast({ notifications, onDismiss }: NotificationToastProps) {
  const [visibleNotifications, setVisibleNotifications] = useState<ToastNotification[]>([])

  useEffect(() => {
    setVisibleNotifications(notifications.slice(0, 3)) // Показываем максимум 3 уведомления
  }, [notifications])

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
        return "border-red-500 bg-red-50"
      case "high":
        return "border-orange-500 bg-orange-50"
      case "medium":
        return "border-yellow-500 bg-yellow-50"
      case "low":
        return "border-green-500 bg-green-50"
      default:
        return "border-gray-500 bg-gray-50"
    }
  }

  if (visibleNotifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {visibleNotifications.map((notification) => (
        <Card
          key={notification.id}
          className={`border-l-4 shadow-lg animate-in slide-in-from-right-full ${getPriorityColor(notification.priority)}`}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              {getTypeIcon(notification.type)}
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm">{notification.title}</h4>
                  <Button variant="ghost" size="sm" className="h-auto p-1" onClick={() => onDismiss(notification.id)}>
                    <X className="w-3 h-3" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">{notification.message}</p>
                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className={
                      notification.priority === "critical"
                        ? "border-red-500 text-red-700"
                        : notification.priority === "high"
                          ? "border-orange-500 text-orange-700"
                          : notification.priority === "medium"
                            ? "border-yellow-500 text-yellow-700"
                            : "border-green-500 text-green-700"
                    }
                  >
                    {notification.priority === "critical"
                      ? "Критический"
                      : notification.priority === "high"
                        ? "Высокий"
                        : notification.priority === "medium"
                          ? "Средний"
                          : "Низкий"}
                  </Badge>
                  {notification.action && (
                    <Button variant="outline" size="sm" onClick={notification.action.onClick}>
                      {notification.action.label}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
