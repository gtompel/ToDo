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
import { getCurrentUser } from "@/lib/auth"
import { logoutAction } from "@/lib/actions/auth"
import Image from "next/image"
import ThemeToggle from "@/components/ui/theme-toggle"
import Link from "next/link"
import NotificationBell from './notification-bell';

export default async function Header() {
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  const userInitials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()

  return (
    <header className="border-b bg-primary text-primary-foreground">
      <div className="flex h-16 items-center px-4 gap-4">
        <div className="flex-1 flex items-center gap-3">
          <Image src="/logo.png" alt="Логотип" width={36} height={36} className="h-9 w-9" />
          <h1 className="text-xl font-semibold text-primary-foreground">Система управления IT-услугами</h1>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <NotificationBell />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
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
              <DropdownMenuItem asChild>
                <form action={logoutAction}>
                  <button type="submit" className="flex w-full items-center">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Выйти</span>
                  </button>
                </form>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
