"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, AlertTriangle, HelpCircle, GitBranch, Users, FileText, BarChart3, Settings, Bell } from "lucide-react"

const navigation = [
  { name: "Главная", href: "/", icon: Home },
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

  return (
    <div className="flex h-full w-64 flex-col bg-sidebar text-sidebar-foreground border-r">
      <div className="flex flex-1 flex-col pt-5 pb-4 overflow-y-auto">
        <nav className="mt-5 flex-1 px-2 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive ? "bg-card text-card-foreground" : "text-sidebar-foreground hover:bg-card hover:text-card-foreground",
                )}
              >
                <item.icon
                  className={cn(
                    "mr-3 flex-shrink-0 h-5 w-5",
                    isActive ? "text-gray-500" : "text-gray-400 group-hover:text-gray-500",
                  )}
                />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
