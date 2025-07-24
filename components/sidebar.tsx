"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, AlertTriangle, HelpCircle, GitBranch, Users, FileText, BarChart3, Settings, Bell, Layers, Database, ChevronLeft, ChevronRight, Monitor, ChevronDown } from "lucide-react"
import { useEffect, useState } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useIsMobile } from "@/hooks/use-mobile"

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
  {
    title: "Справка",
    items: [
      { name: "Справка", href: "/help", icon: HelpCircle },
    ]
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [collapsed, setCollapsed] = useState(false)
  const [openGroups, setOpenGroups] = useState(() => new Set(navigationGroups.map(g => g.title)))
  const isMobile = useIsMobile()

  // Если мобильное устройство — всегда collapsed
  const effectiveCollapsed = isMobile ? true : collapsed

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
    <TooltipProvider>
      <div className={cn("flex h-full flex-col bg-sidebar text-sidebar-foreground border-r transition-all duration-200", effectiveCollapsed ? "w-20" : "w-52")}>
        <div className="flex items-center justify-end px-2 pt-2 pb-1">
          {/* Кнопка сворачивания только если не мобильное устройство */}
          {!isMobile && (
            <button onClick={() => setCollapsed(c => !c)} className="p-1 rounded hover:bg-muted transition-colors" aria-label={effectiveCollapsed ? "Развернуть" : "Свернуть"}>
              {effectiveCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
          )}
        </div>
        <div className="flex flex-1 flex-col pt-2 pb-4 overflow-y-auto">
          <nav className="mt-2 flex-1 px-2 space-y-1">
            {navigationGroups.map(group => {
              const isOpen = effectiveCollapsed ? false : openGroups.has(group.title)
              return (
                <div key={group.title} className="mb-2">
                  {/* Заголовок группы только в expanded-режиме */}
                  {!effectiveCollapsed && (
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
                  {/* В expanded-режиме: только открытые группы, с текстом и иконкой */}
                  {!effectiveCollapsed && isOpen && group.items.map(item => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                    return (
                      <Tooltip key={item.href} disableHoverableContent={!effectiveCollapsed}>
                        <TooltipTrigger asChild>
                          <Link
                            href={item.href}
                            className={cn(
                              "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                              isActive ? "bg-primary/10 text-primary font-bold border-l-4 border-primary" : "text-sidebar-foreground hover:bg-card hover:text-card-foreground",
                              effectiveCollapsed && "justify-center px-0"
                            )}
                          >
                            <item.icon
                              className={cn(
                                "flex-shrink-0 h-5 w-5",
                                isActive ? "text-primary" : "text-gray-400 group-hover:text-gray-500",
                                effectiveCollapsed ? "mx-auto" : "mr-3"
                              )}
                            />
                            {!effectiveCollapsed && item.name}
                          </Link>
                        </TooltipTrigger>
                        {effectiveCollapsed && (
                          <TooltipContent side="right" align="center">
                            {item.name}
                          </TooltipContent>
                        )}
                      </Tooltip>
                    )
                  })}
                  {/* В collapsed-режиме: всегда показываем все иконки группы */}
                  {effectiveCollapsed && group.items.map(item => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                    return (
                      <Tooltip key={item.href}>
                        <TooltipTrigger asChild>
                          <Link
                            href={item.href}
                            className={cn(
                              "group flex items-center justify-center px-0 py-2 text-sm font-medium rounded-md transition-colors",
                              isActive ? "bg-primary/10 text-primary font-bold border-l-4 border-primary" : "text-sidebar-foreground hover:bg-card hover:text-card-foreground"
                            )}
                            style={{ width: 48, minWidth: 48 }}
                          >
                            <item.icon
                              className={cn(
                                "flex-shrink-0 h-5 w-5 mx-auto",
                                isActive ? "text-primary" : "text-gray-400 group-hover:text-gray-500"
                              )}
                            />
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right" align="center">
                          {item.name}
                        </TooltipContent>
                      </Tooltip>
                    )
                  })}
                </div>
              )
            })}
          </nav>
        </div>
      </div>
    </TooltipProvider>
  )
}
