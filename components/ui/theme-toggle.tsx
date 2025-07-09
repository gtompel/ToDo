"use client"
import { useTheme } from "next-themes"
import { Sun, Moon, Palette } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useEffect, useState } from "react"

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Можно вернуть null или статичную иконку
    return (
      <button
        type="button"
        aria-label="Переключить тему"
        className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        disabled
      >
        <Sun className="w-5 h-5" />
      </button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Переключить тему"
          className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          {theme === "dark" ? <Moon className="w-5 h-5" /> : theme === "rosatom" ? <Palette className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>Светлая</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>Тёмная</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("rosatom")}>Росатом</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 