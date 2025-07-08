"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function getRequests() {
  try {
    const requests = await prisma.request.findMany({
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return requests
  } catch (error) {
    console.error("Error fetching requests:", error)
    return []
  }
}

export async function getRequest(id: string) {
  try {
    const request = await prisma.request.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    })

    return request
  } catch (error) {
    console.error("Error fetching request:", error)
    return null
  }
}

export async function createRequest(formData: FormData) {
  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const type = formData.get("type") as string
  const priority = formData.get("priority") as string
  const creatorId = formData.get("creatorId") as string
  const assigneeId = formData.get("assigneeId") as string
  const dueDate = formData.get("dueDate") as string

  if (!title || !description || !creatorId) {
    return { error: "Заполните все обязательные поля" }
  }

  try {
    await prisma.request.create({
      data: {
        title,
        description,
        type,
        priority: priority as any,
        creatorId,
        assigneeId: assigneeId || null,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    })

    revalidatePath("/requests")
    redirect("/requests")
  } catch (error) {
    console.error("Error creating request:", error)
    return { error: "Ошибка при создании запроса" }
  }
}

export async function updateRequest(id: string, formData: FormData) {
  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const status = formData.get("status") as string
  const type = formData.get("type") as string
  const priority = formData.get("priority") as string
  const assigneeId = formData.get("assigneeId") as string
  const dueDate = formData.get("dueDate") as string

  try {
    await prisma.request.update({
      where: { id },
      data: {
        title,
        description,
        status: status as any,
        type,
        priority: priority as any,
        assigneeId: assigneeId || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        completedAt: status === "COMPLETED" ? new Date() : null,
      },
    })

    revalidatePath("/requests")
    revalidatePath(`/requests/${id}`)
  } catch (error) {
    console.error("Error updating request:", error)
    return { error: "Ошибка при обновлении запроса" }
  }
}

export async function deleteRequest(id: string) {
  try {
    await prisma.request.delete({
      where: { id },
    })

    revalidatePath("/requests")
  } catch (error) {
    console.error("Error deleting request:", error)
    return { error: "Ошибка при удалении запроса" }
  }
}
