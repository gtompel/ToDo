"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, AlertTriangle, HelpCircle, GitBranch, Users, FileText, BarChart3, Settings, Bell, Layers, Database, ChevronLeft, ChevronRight, Monitor } from "lucide-react"
import { useEffect, useState } from "react"

const navigationBase = [
  { name: "Главная", href: "/", icon: Home },
  { name: "ИТ-ресурсы", href: "/it-resources", icon: Database },
  { name: "Рабочие станции", href: "/workstations", icon: Monitor },
  { name: "Инциденты", href: "/incidents", icon: AlertTriangle },
  { name: "Запросы", href: "/requests", icon: HelpCircle },
  { name: "Изменения", href: "/changes", icon: GitBranch },
  { name: "База знаний", href: "/knowledge-base", icon: FileText },
  { name: "Отчеты", href: "/reports", icon: BarChart3 },
  { name: "Пользователи", href: "/users", icon: Users },
  { name: "Уведомления", href: "/notifications", icon: Bell },
  { name: "Настройки", href: "/settings", icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    fetch("/api/users/me").then(res => res.json()).then(data => {
      const role = data?.user?.role || data?.role || ""
      setUserRole(role)
    })
  }, [])

  if (userRole === null) {
    // Можно вернуть скелетон/заглушку или null
    return <div className="w-64 bg-sidebar border-r" />
  }

  const navigation = userRole === "ADMIN"
    ? [
        ...navigationBase.slice(0, 5),
        { name: "Шаблоны", href: "/templates", icon: Layers }, // уникальная иконка
        ...navigationBase.slice(5)
      ]
    : navigationBase

  return (
    <div className={cn("flex h-full flex-col bg-sidebar text-sidebar-foreground border-r transition-all duration-200", collapsed ? "w-20" : "w-64")}>
      <div className="flex items-center justify-end px-2 pt-2 pb-1">
        <button onClick={() => setCollapsed(c => !c)} className="p-1 rounded hover:bg-muted transition-colors" aria-label={collapsed ? "Развернуть" : "Свернуть"}>
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>
      <div className="flex flex-1 flex-col pt-2 pb-4 overflow-y-auto">
        <nav className="mt-2 flex-1 px-2 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive ? "bg-primary/10 text-primary font-bold border-l-4 border-primary" : "text-sidebar-foreground hover:bg-card hover:text-card-foreground",
                  collapsed && "justify-center px-0"
                )}
                style={collapsed ? { width: 48, minWidth: 48, paddingLeft: 0, paddingRight: 0 } : {}}
                title={collapsed ? item.name : undefined}
              >
                <item.icon
                  className={cn(
                    "flex-shrink-0 h-5 w-5",
                    isActive ? "text-primary" : "text-gray-400 group-hover:text-gray-500",
                    collapsed ? "mx-auto" : "mr-3"
                  )}
                />
                {!collapsed && item.name}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
