"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, AlertTriangle, HelpCircle, GitBranch, Users, FileText, BarChart3, Settings, Bell, Layers, Database, ChevronLeft, ChevronRight, Monitor, ChevronDown } from "lucide-react"
import { useEffect, useState } from "react"

const navigationGroups = [
  {
    title: "Основное",
    items: [
      { name: "Главная", href: "/", icon: Home },
      { name: "ИТ-ресурсы", href: "/it-resources", icon: Database },
      { name: "Рабочие станции", href: "/workstations", icon: Monitor },
    ]
  },
  {
    title: "Запросы и инциденты",
    items: [
      { name: "Инциденты", href: "/incidents", icon: AlertTriangle },
      { name: "Запросы", href: "/requests", icon: HelpCircle },
      { name: "Изменения", href: "/changes", icon: GitBranch },
    ]
  },
  {
    title: "Знания и отчёты",
    items: [
      { name: "База знаний", href: "/knowledge-base", icon: FileText },
      { name: "Отчеты", href: "/reports", icon: BarChart3 },
      { name: "Шаблоны", href: "/templates", icon: Layers },
    ]
  },
  {
    title: "Пользователи и настройки",
    items: [
      { name: "Пользователи", href: "/users", icon: Users },
      { name: "Уведомления", href: "/notifications", icon: Bell },
      { name: "Настройки", href: "/settings", icon: Settings },
    ]
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [collapsed, setCollapsed] = useState(false)
  const [openGroups, setOpenGroups] = useState(() => new Set(navigationGroups.map(g => g.title)))

  const toggleGroup = (title: string) => {
    setOpenGroups(prev => {
      const next = new Set(prev)
      if (next.has(title)) next.delete(title)
      else next.add(title)
      return next
    })
  }

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

  return (
    <div className={cn("flex h-full flex-col bg-sidebar text-sidebar-foreground border-r transition-all duration-200", collapsed ? "w-20" : "w-64")}>
      <div className="flex items-center justify-end px-2 pt-2 pb-1">
        <button onClick={() => setCollapsed(c => !c)} className="p-1 rounded hover:bg-muted transition-colors" aria-label={collapsed ? "Развернуть" : "Свернуть"}>
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>
      <div className="flex flex-1 flex-col pt-2 pb-4 overflow-y-auto">
        <nav className="mt-2 flex-1 px-2 space-y-1">
          {navigationGroups.map(group => {
            const isOpen = collapsed ? false : openGroups.has(group.title)
            return (
              <div key={group.title} className="mb-2">
                {!collapsed && (
                  <button
                    type="button"
                    className="flex items-center w-full text-xs font-semibold text-muted-foreground px-2 mb-1 mt-3 uppercase tracking-wider focus:outline-none select-none"
                    onClick={() => toggleGroup(group.title)}
                    aria-expanded={isOpen}
                  >
                    <span className="flex-1 text-left">{group.title}</span>
                    <span>{isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}</span>
                  </button>
                )}
                {isOpen && group.items.map(item => {
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
              </div>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
