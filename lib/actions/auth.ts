"use server"

import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { hashPassword, verifyPassword, createToken } from "@/lib/auth"
import { isRateLimited } from "@/lib/utils"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export async function logUserActivity({ userId, action, status, ip }: { userId: string, action: string, status: string, ip?: string }) {
  try {
    await prisma.activityLog.create({
      data: { userId, action, status, ip }
    })
    await prisma.user.update({ where: { id: userId }, data: { lastActivity: new Date() } })
  } catch (e) {
    // Не критично, если не удалось залогировать
  }
}

export async function loginAction(formData: FormData, ip?: string) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Email и пароль обязательны" }
  }

  try {
    // CSRF: проверяем Origin/Host
    try {
      const hdrs = await headers()
      const origin = hdrs.get("origin") || ""
      const host = hdrs.get("host") || ""
      const allowedEnv = (process.env.ALLOWED_ORIGINS || "").split(",").map(s => s.trim()).filter(Boolean)
      const derived = [`http://${host}`, `https://${host}`]
      const isAllowed = origin === "" || allowedEnv.includes(origin) || derived.includes(origin)
      if (!isAllowed) {
        return { error: "Недопустимый источник запроса" }
      }
    } catch {}

    // Rate limit: 5 попыток за 10 минут на ключ email+ip
    const key = `local:${email}:${ip || "unknown"}`
    if (isRateLimited(key, 5, 10 * 60 * 1000)) {
      return { error: "Слишком много попыток. Попробуйте позже." }
    }
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      // Логируем неудачный вход
      await logUserActivity({ userId: "unknown", action: "Попытка входа (неизвестный email)", status: "error", ip })
      return { error: "Неверный email или пароль" }
    }

    // Поддержка старых записей с открытым паролем: если не bcrypt-хэш, сравниваем как plaintext и сразу мигрируем на хэш
    const isBcryptHash = typeof user.password === 'string' && user.password.startsWith('$2')
    let isValidPassword = false
    if (isBcryptHash) {
      isValidPassword = await verifyPassword(password, user.password)
    } else {
      isValidPassword = user.password === password
      if (isValidPassword) {
        const newHashed = await hashPassword(password)
        await prisma.user.update({
          where: { id: user.id },
          data: { password: newHashed, passwordLastChanged: new Date() },
        })
      }
    }
    if (!isValidPassword) {
      await logUserActivity({ userId: user.id, action: "Попытка входа (неверный пароль)", status: "error", ip })
      return { error: "Неверный email или пароль" }
    }

    if (!user.isActive) {
      await logUserActivity({ userId: user.id, action: "Попытка входа (заблокирован)", status: "error", ip })
      return { error: "Аккаунт заблокирован" }
    }

    const token = await createToken(user.id)
    const hdrs2 = await headers()
    const isHttps =
      (hdrs2.get('x-forwarded-proto') ?? '').toLowerCase() === 'https' ||
      (hdrs2.get('origin') ?? '').toLowerCase().startsWith('https://')
    ;(await cookies()).set("auth-token", token, {
      httpOnly: true,
      secure: isHttps,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })
    await prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } })
    await logUserActivity({ userId: user.id, action: "Успешный вход в систему", status: "success", ip })
    return { success: true }
  } catch (error) {
    console.error("Login error:", error)
    return { error: "Произошла ошибка при входе" }
  }
}

export async function registerUser(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const firstName = formData.get("firstName") as string
  const lastName = formData.get("lastName") as string

  if (!email || !password || !firstName || !lastName) {
    return { error: "Все поля обязательны" }
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return { error: "Пользователь с таким email уже существует" }
  }

  const hashedPassword = await hashPassword(password)
  await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
    },
  })
  return { success: true }
}

export async function logoutAction() {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value

  if (token) {
    try {
      await prisma.session.deleteMany({
        where: { token },
      })
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  cookieStore.delete("auth-token")
  redirect("/login") // редирект на страницу входа
}

export async function changeUserPassword(userId: string, newPassword: string) {
  const hashed = await hashPassword(newPassword)
  await prisma.user.update({ where: { id: userId }, data: { password: hashed, passwordLastChanged: new Date() } })
  await logUserActivity({ userId, action: "Смена пароля", status: "success" })
  return { success: true }
}
