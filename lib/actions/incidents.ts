"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

// Получение всех инцидентов
export async function getIncidents() {
  try {
    const incidents = await prisma.incident.findMany({
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        assignedTo: {
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
    return incidents
  } catch (error) {
    console.error("Error fetching incidents:", error)
    return []
  }
}

// Получение одного инцидента по ID
export async function getIncident(id: string) {
  try {
    const incident = await prisma.incident.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    })
    return incident
  } catch (error) {
    console.error("Error fetching incident:", error)
    return null
  }
}

// Создание нового инцидента
export async function createIncident(formData: FormData, userId: string) {
  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const priority = formData.get("priority") as string
  const category = formData.get("category") as string
  const assignedToId = formData.get("assigneeId") as string
  const preActions = formData.get("preActions") as string
  const expectedResult = formData.get("expectedResult") as string
  const attachmentsRaw = formData.getAll("attachments")
  const attachments = attachmentsRaw.map((a) => a.toString())

  if (!title || !description || !userId) {
    return { error: "Заполните все обязательные поля" }
  }

  try {
    await prisma.incident.create({
      data: {
        title,
        description,
        priority: priority as any,
        category,
        createdById: userId,
        assignedToId: assignedToId || null,
        preActions,
        expectedResult,
        attachments,
      },
    })
    return { success: true }
  } catch (error: any) {
    console.error("Error creating incident:", error)
    return { error: "Ошибка при создании инцидента" }
  }
}

// Обновление инцидента
export async function updateIncident(id: string, formData: FormData) {
  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const status = formData.get("status") as string
  const priority = formData.get("priority") as string
  const category = formData.get("category") as string
  const assignedToId = formData.get("assigneeId") as string

  try {
    await prisma.incident.update({
      where: { id },
      data: {
        title,
        description,
        status: status as any,
        priority: priority as any,
        category,
        assignedToId: assignedToId || null,
        resolvedAt: status === "RESOLVED" ? new Date() : null,
      },
    })

    revalidatePath("/incidents")
    revalidatePath(`/incidents/${id}`)
  } catch (error) {
    console.error("Error updating incident:", error)
    return { error: "Ошибка при обновлении инцидента" }
  }
}

// Изменение статуса инцидента (только для администратора)
export async function updateIncidentStatus(id: string, status: string) {
  try {
    await prisma.incident.update({
      where: { id },
      data: { status: status as any },
    })
    revalidatePath("/incidents")
    revalidatePath(`/incidents/${id}`)
    return { success: true }
  } catch (error) {
    console.error("Error updating incident status:", error)
    return { error: "Ошибка при смене статуса инцидента" }
  }
}

// Назначение сотрудника на инцидент (только для администратора)
export async function assignIncidentToUser(id: string, userId: string) {
  try {
    await prisma.incident.update({
      where: { id },
      data: { assignedToId: userId },
    })
    revalidatePath("/incidents")
    revalidatePath(`/incidents/${id}`)
    return { success: true }
  } catch (error) {
    console.error("Error assigning incident:", error)
    return { error: "Ошибка при назначении сотрудника" }
  }
}

// Удаление инцидента (только для администратора)
export async function deleteIncidentById(id: string) {
  try {
    await prisma.incident.delete({ where: { id } })
    revalidatePath("/incidents")
    return { success: true }
  } catch (error) {
    console.error("Error deleting incident:", error)
    return { error: "Ошибка при удалении инцидента" }
  }
}
