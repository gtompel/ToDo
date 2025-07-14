// Главный layout приложения Next.js
// Здесь задаётся общая структура (header, sidebar, основной контент)
import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "../styles/globals.css"
import { getCurrentUser } from "@/lib/auth"
import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

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
        <body className={inter.className + " bg-background text-foreground"}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
          </ThemeProvider>
        </body>
      </html>
    )
  }

  // Если пользователь авторизован — рендерим layout
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={inter.className + " bg-background text-foreground"}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="h-screen flex flex-col">
            {/* Хедер */}
            <Header />
            <div className="flex flex-1 overflow-hidden">
              {/* Боковое меню */}
              <Sidebar />
              {/* Основной контент */}
              <main className="flex-1 overflow-y-auto p-6 bg-background text-foreground">{children}</main>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
