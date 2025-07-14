"use client"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, Settings, LogOut, User } from "lucide-react"
import Image from "next/image"
import ThemeToggle from "@/components/ui/theme-toggle"
import Link from "next/link"
import NotificationBell from './notification-bell';
import LogoutButton from "./logout-button"
import { useRouter } from "next/navigation"

export default function Header({ onBurgerClick }: { onBurgerClick?: () => void }) {
  const [user, setUser] = useState<any>(null)
  const [search, setSearch] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [showResults, setShowResults] = useState(false)
  const router = useRouter()
  useEffect(() => {
    fetch("/api/users/me").then(res => res.json()).then(data => setUser(data.user))
  }, [])

  useEffect(() => {
    if (search.trim().length < 2) {
      setResults([])
      return
    }
    const timeout = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(search)}`)
        .then(res => res.json())
        .then(data => setResults(data.results || []))
    }, 300)
    return () => clearTimeout(timeout)
  }, [search])

  if (!user) return null
  const userInitials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
  return (
    <header className="border-b bg-primary text-primary-foreground relative">
      <div className="flex h-16 items-center px-4 gap-4">
        <div className="flex-1 flex items-center gap-3">
          <Image src="/logo.png" alt="Логотип" width={36} height={36} className="h-9 w-9" />
          <h1 className="text-xl font-semibold text-primary-foreground">Система управления IT-услугами</h1>
          <form className="ml-8 flex-1 max-w-md relative hidden md:block" onSubmit={e => { e.preventDefault(); if (results[0]) router.push(results[0].href) }} autoComplete="off">
            <input
              type="text"
              placeholder="Поиск по всему сайту..."
              className="w-full rounded border px-3 py-1.5 pl-9 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition"
              value={search}
              onChange={e => { setSearch(e.target.value); setShowResults(true) }}
              onFocus={() => setShowResults(true)}
              onBlur={() => setTimeout(() => setShowResults(false), 200)}
              aria-label="Глобальный поиск"
            />
            <span className="absolute left-2 top-2.5 text-gray-400 pointer-events-none">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            </span>
            {showResults && results.length > 0 && (
              <div className="absolute z-50 mt-1 w-full bg-white border rounded shadow-lg max-h-72 overflow-auto text-black">
                {results.map((r, i) => (
                  <div
                    key={r.type + r.id}
                    className="px-3 py-2 hover:bg-primary/10 cursor-pointer border-b last:border-b-0"
                    onMouseDown={() => { router.push(r.href); setShowResults(false); setSearch("") }}
                  >
                    <div className="text-xs text-gray-500">{r.type}</div>
                    <div className="font-medium">{r.title}</div>
                    <div className="text-xs truncate text-gray-400">{r.description}</div>
                  </div>
                ))}
              </div>
            )}
            {showResults && search.length > 1 && results.length === 0 && (
              <div className="absolute z-50 mt-1 w-full bg-white border rounded shadow-lg text-black px-3 py-2 text-sm">Ничего не найдено</div>
            )}
          </form>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle aria-label="Сменить тему" />
          <NotificationBell aria-label="Оповещения" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-muted transition focus-visible:ring-2 focus-visible:ring-primary" aria-label="Открыть меню пользователя">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder-user.jpg" alt={user.firstName} />
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/users/${user.id}`} prefetch={false}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Профиль</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/profile/settings" prefetch={false}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Настройки</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <LogoutButton />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
