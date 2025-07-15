import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const DEFAULTS = {
  systemName: "ITSM System",
  systemDescription: "Система управления IT-сервисами",
  timezone: "Europe/Moscow",
  language: "ru",
  emailNotifications: true,
  pushNotifications: true,
  notificationFrequency: "immediate",
  sessionTimeout: "30",
  passwordMinLength: "8",
  requireTwoFactor: false,
  allowPasswordReset: true,
  backupFrequency: "daily",
  retentionPeriod: "90",
  autoCleanup: true,
  emailServer: "smtp.company.com",
  emailPort: "587",
  emailUsername: "itsm@company.com",
  emailPassword: "",
  incidentResponseTime: "4",
  requestResponseTime: "24",
  escalationTime: "2",
}

export async function GET() {
  const all = await prisma.systemSettings.findMany()
  const settings: any = { ...DEFAULTS }
  for (const s of all) {
    try {
      settings[s.key] = JSON.parse(s.value)
    } catch {
      settings[s.key] = s.value
    }
  }
  return NextResponse.json({ settings })
}

export async function POST(req: any) {
  const data = await req.json()
  for (const key in data) {
    await prisma.systemSettings.upsert({
      where: { key },
      update: { value: JSON.stringify(data[key]) },
      create: { key, value: JSON.stringify(data[key]) },
    })
  }
  return NextResponse.json({ ok: true })
} 