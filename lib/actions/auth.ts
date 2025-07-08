"use server"

import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { hashPassword, verifyPassword, createToken } from "@/lib/auth"
import { redirect } from "next/navigation"

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Email и пароль обязательны" }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return { error: "Неверный email или пароль" }
    }

    const isValidPassword = await verifyPassword(password, user.password)
    if (!isValidPassword) {
      return { error: "Неверный email или пароль" }
    }

    if (!user.isActive) {
      return { error: "Аккаунт заблокирован" }
    }

    const token = await createToken(user.id)
    cookies().set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })
    redirect("/") // <-- редирект на сервере
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
  // Можно вернуть { success: true }
}
