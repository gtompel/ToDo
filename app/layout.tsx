import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { getCurrentUser } from "@/lib/auth"
import Header from "@/components/header"
import Sidebar from "@/components/sidebar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ITSM Система",
  description: "Система управления IT-услугами",
    generator: 'v0.dev'
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  // If no user, render without layout (for login page)
  if (!user) {
    return (
      <html lang="ru">
        <body className={inter.className}>{children}</body>
      </html>
    )
  }

  return (
    <html lang="ru">
      <body className={inter.className}>
        <div className="h-screen flex flex-col">
          <Header />
          <div className="flex flex-1 overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-6">{children}</main>
          </div>
        </div>
      </body>
    </html>
  )
}
