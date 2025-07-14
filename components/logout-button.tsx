"use client"
import { useState } from "react"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { LogOut } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function LogoutButton() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/logout", { method: "POST" })
      if (res.ok) {
        toast({ title: "Выход", description: "Вы успешно вышли из системы" })
        window.location.href = "/login"
      } else {
        toast({ title: "Ошибка", description: "Не удалось выйти", variant: "destructive" })
      }
    } catch {
      toast({ title: "Ошибка", description: "Не удалось выйти", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <DropdownMenuItem onClick={handleLogout} disabled={loading} className="cursor-pointer">
      <LogOut className="mr-2 h-4 w-4" />
      <span>Выйти</span>
    </DropdownMenuItem>
  )
} 