"use server"

import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function getUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        middleName: true,
        phone: true,
        position: true,
        department: true,
        role: true,
        status: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return users
  } catch (error) {
    console.error("Error fetching users:", error)
    return []
  }
}

export async function getUser(id: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        middleName: true,
        phone: true,
        position: true,
        department: true,
        role: true,
        status: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return user
  } catch (error) {
    console.error("Error fetching user:", error)
    return null
  }
}

export async function createUser(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const firstName = formData.get("firstName") as string
  const lastName = formData.get("lastName") as string
  const middleName = formData.get("middleName") as string
  const phone = formData.get("phone") as string
  const position = formData.get("position") as string
  const department = formData.get("department") as string
  const role = formData.get("role") as string
  const status = (formData.get("status") as string) || "active"
  const isActive = formData.get("isActive") === "on"

  if (!email || !password || !firstName || !lastName || !role) {
    return { error: "Заполните все обязательные поля" }
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return { error: "Пользователь с таким email уже существует" }
    }

    const hashedPassword = await hashPassword(password)

    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        middleName: middleName || null,
        phone: phone || null,
        position: position || null,
        department: department || null,
        role: role as any,
        status,
        isActive,
      },
    })

    revalidatePath("/users")
    redirect("/users")
  } catch (error) {
    console.error("Error creating user:", error)
    return { error: "Ошибка при создании пользователя" }
  }
}

export async function updateUser(id: string, formData: FormData) {
  const email = formData.get("email") as string
  const firstName = formData.get("firstName") as string
  const lastName = formData.get("lastName") as string
  const middleName = formData.get("middleName") as string
  const phone = formData.get("phone") as string
  const position = formData.get("position") as string
  const department = formData.get("department") as string
  const role = formData.get("role") as string
  const status = formData.get("status") as string
  const isActive = formData.get("isActive") === "on"

  try {
    await prisma.user.update({
      where: { id },
      data: {
        email,
        firstName,
        lastName,
        middleName: middleName || null,
        phone: phone || null,
        position: position || null,
        department: department || null,
        role: role as any,
        status,
        isActive,
      },
    })

    revalidatePath("/users")
    revalidatePath(`/users/${id}`)
  } catch (error) {
    console.error("Error updating user:", error)
    return { error: "Ошибка при обновлении пользователя" }
  }
}

export async function deleteUser(id: string) {
  try {
    await prisma.user.delete({
      where: { id },
    })

    revalidatePath("/users")
  } catch (error) {
    console.error("Error deleting user:", error)
    return { error: "Ошибка при удалении пользователя" }
  }
}

export async function getTechnicians() {
  try {
    const technicians = await prisma.user.findMany({
      where: {
        role: {
          in: ["TECHNICIAN", "ADMIN", "MANAGER"],
        },
        isActive: true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    })

    return technicians
  } catch (error) {
    console.error("Error fetching technicians:", error)
    return []
  }
}
