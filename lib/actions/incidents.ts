// Серверные экшены для работы с инцидентами (Incident)
"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { createNotification } from "./notifications";
import { logUserActivity } from "./auth"

// Получить все инциденты с пагинацией
export async function getIncidents(page = 1, pageSize = 10) {
  try {
    const [incidents, total] = await Promise.all([
      prisma.incident.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
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
      }),
      prisma.incident.count(),
    ])
    return { data: incidents, total }
  } catch (error) {
    console.error("Error fetching incidents:", error)
    return { data: [], total: 0 }
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
export async function createIncident(formData: FormData, userId: string, ip?: string) {
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
    // Определяем роль автора для бизнес-правил
    const creator = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } })
    const isSimpleUser = creator?.role === 'USER'
    // Если создатель — обычный USER: принудительно ставим LOW и без назначенного исполнителя
    const effectivePriority = (isSimpleUser ? 'LOW' : (priority || 'LOW')) as any
    const effectiveAssigneeId = isSimpleUser ? null : (assignedToId || null)
    // Создание инцидента в базе данных
    await prisma.incident.create({
      data: {
        title,
        description,
        priority: effectivePriority,
        category,
        createdById: userId,
        assignedToId: effectiveAssigneeId,
        preActions,
        expectedResult,
        attachments,
      },
    })
    await logUserActivity({ userId, action: `Создание инцидента: ${title}`, status: "success", ip })
    return { success: true }
  } catch (error: any) {
    await logUserActivity({ userId, action: `Ошибка создания инцидента: ${title}`, status: "error", ip })
    console.error("Error creating incident:", error)
    return { error: "Ошибка при создании инцидента" }
  }
}

// Обновить инцидент
export async function updateIncident(id: string, formData: FormData, userId?: string, ip?: string) {
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
    if (userId) await logUserActivity({ userId, action: `Обновление инцидента: ${title}`, status: "success", ip })
    revalidatePath("/incidents")
    revalidatePath(`/incidents/${id}`)
  } catch (error) {
    if (userId) await logUserActivity({ userId, action: `Ошибка обновления инцидента: ${id}`, status: "error", ip })
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
export async function deleteIncidentById(id: string, userId?: string, ip?: string) {
  if (!id) return { error: 'Не передан id' }
  try {
    await prisma.incident.delete({ where: { id } })
    if (userId) await logUserActivity({ userId, action: `Удаление инцидента: ${id}`, status: "success", ip })
    return { success: true }
  } catch (e: any) {
    if (userId) await logUserActivity({ userId, action: `Ошибка удаления инцидента: ${id}`, status: "error", ip })
    return { error: e.message || 'Ошибка удаления инцидента' }
  }
}
