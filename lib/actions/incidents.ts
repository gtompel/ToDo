// Серверные экшены для работы с инцидентами (Incident)
"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { createNotification } from "./notifications";

// Получить все инциденты
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

// Получить один инцидент по id
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

// Создать новый инцидент
export async function createIncident(formData: FormData, userId: string) {
  // Получение данных из формы
  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const priority = formData.get("priority") as string
  const category = formData.get("category") as string
  const assignedToId = formData.get("assigneeId") as string
  const preActions = formData.get("preActions") as string
  const expectedResult = formData.get("expectedResult") as string
  const attachmentsRaw = formData.getAll("attachments")
  const attachments = attachmentsRaw.map((a) => a.toString())

  // Проверка обязательных полей
  if (!title || !description || !userId) {
    return { error: "Заполните все обязательные поля" }
  }

  try {
    // Создание инцидента в базе данных
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

// Обновить инцидент
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

// Сменить статус инцидента (только для администратора)
export async function updateIncidentStatus(id: string, status: string) {
  try {
    const incident = await prisma.incident.update({
      where: { id },
      data: { status: status as any },
      include: { assignedTo: true },
    });
    if (incident.assignedTo) {
      await createNotification(
        incident.assignedTo.id,
        `Статус инцидента изменён: ${incident.title}`,
        `Новый статус: ${status}`
      );
    }
    revalidatePath("/incidents");
    revalidatePath(`/incidents/${id}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating incident status:", error);
    return { error: "Ошибка при смене статуса инцидента" };
  }
}

// Назначить сотрудника на инцидент (только для администратора)
export async function assignIncidentToUser(id: string, userId: string) {
  try {
    await prisma.incident.update({
      where: { id },
      data: { assignedToId: userId },
    })
    // Создаём уведомление назначенному пользователю
    await createNotification(
      userId,
      "Вам назначен инцидент",
      `Вы назначены ответственным за инцидент с ID: ${id}`
    )
    revalidatePath("/incidents")
    revalidatePath(`/incidents/${id}`)
    return { success: true }
  } catch (error) {
    console.error("Error assigning incident:", error)
    return { error: "Ошибка при назначении сотрудника" }
  }
}

// Удалить инцидент по id
export async function deleteIncidentById(id: string) {
  if (!id) return { error: 'Не передан id' }
  try {
    await prisma.incident.delete({ where: { id } })
    return { success: true }
  } catch (e: any) {
    return { error: e.message || 'Ошибка удаления инцидента' }
  }
}
