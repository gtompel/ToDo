// Главный layout приложения Next.js
// Здесь задаётся общая структура (header, sidebar, основной контент)
import type React from "react"
import type { Metadata } from "next"

import { JetBrains_Mono } from "next/font/google"
import "../styles/globals.css"
import { getCurrentUser } from "@/lib/auth"
import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import AppShell from "./AppShell"
import { UserProvider } from "@/hooks/use-user-context";


const jetbrains = JetBrains_Mono({ subsets: ["latin", "cyrillic"], weight: ["400", "500", "700"] })

export const metadata: Metadata = {
  title: "Система управления IT-услугами",
  description: "Система управления IT-услугами"
}

export default async function RootLayout({ children, }: { children: React.ReactNode }) {
  const user = await getCurrentUser()

  // Если пользователь не авторизован, рендерим только children (login/register)
  if (!user) {
    return (
      <html lang="ru" suppressHydrationWarning>
        <body className={"font-sans bg-background text-foreground"}>
          <ThemeProvider attribute="class" defaultTheme="rosatom" enableSystem>
            {children}
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    )
  }

  // Если пользователь авторизован — рендерим layout
  return (
    <html lang="ru" suppressHydrationWarning>
        <body className={jetbrains.className + " bg-background text-foreground"}>
        <ThemeProvider attribute="class" defaultTheme="rosatom" enableSystem>
          <UserProvider>
            <AppShell>{children}</AppShell>
          </UserProvider>
            <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
