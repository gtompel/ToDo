// Серверные экшены для работы с запросами (Request)
"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createNotification } from "./notifications";

// Получить все запросы с пагинацией
export async function getRequests(page = 1, pageSize = 10) {
  try {
    const [requests, total] = await Promise.all([
      prisma.request.findMany({
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
      prisma.request.count(),
    ])
    return { data: requests, total }
  } catch (error) {
    console.error("Error fetching requests:", error)
    return { data: [], total: 0 }
  }
}

// Получить один запрос по id
export async function getRequest(id: string) {
  try {
    const request = await prisma.request.findUnique({
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

    return request
  } catch (error) {
    console.error("Error fetching request:", error)
    return null
  }
}

// Создать новый запрос
export async function createRequest(formData: FormData, userId?: string) {
  // Получение данных из формы
  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const priority = formData.get("priority") as string
  const assignedToId = formData.get("assigneeId") as string
  const acknowledgmentFile = formData.get("acknowledgmentFile") as unknown as File | null

  // Проверка обязательных полей
  if (!title || !description || !userId) {
    return { error: "Заполните все обязательные поля" }
  }

  try {
    // Создание запроса в базе данных
    await prisma.request.create({
      data: {
        title,
        description,
        priority: priority as any,
        createdById: userId,
        assignedToId: assignedToId || null,
        acknowledgmentFile: (acknowledgmentFile && typeof (acknowledgmentFile as any).name === 'string') ? (acknowledgmentFile as any).name : null,
      },
    })

    revalidatePath("/requests")
    // redirect("/requests") — удалено, редирект делать на клиенте
  } catch (error) {
    console.error("Error creating request:", error)
    return { error: "Ошибка при создании запроса" }
  }
}

// Обновить запрос
export async function updateRequest(id: string, formData: FormData) {
  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const status = formData.get("status") as string
  const priority = formData.get("priority") as string
  const assignedToId = formData.get("assigneeId") as string

  try {
    await prisma.request.update({
      where: { id },
      data: {
        title,
        description,
        status: status as any,
        priority: priority as any,
        assignedToId: assignedToId || null,
      },
    })

    revalidatePath("/requests")
    revalidatePath(`/requests/${id}`)
  } catch (error) {
    console.error("Error updating request:", error)
    return { error: "Ошибка при обновлении запроса" }
  }
}

// Сменить статус запроса
export async function updateRequestStatus(id: string, status: string) {
  try {
    const request = await prisma.request.update({
      where: { id },
      data: { status: status as any },
      include: { assignedTo: true },
    });
    if (request.assignedTo) {
      await createNotification(
        request.assignedTo.id,
        `Статус запроса изменён: ${request.title}`,
        `Новый статус: ${status}`
      );
    }
    revalidatePath("/requests");
    return { success: true };
  } catch (error) {
    console.error("Error updating request status:", error);
    return { error: "Ошибка при смене статуса" };
  }
}

// Сменить приоритет запроса
export async function updateRequestPriority(id: string, priority: string) {
  try {
    const request = await prisma.request.update({
      where: { id },
      data: { priority: priority as any },
    });
    revalidatePath("/requests");
    return { success: true };
  } catch (error) {
    console.error("Error updating request priority:", error);
    return { error: "Ошибка при смене приоритета" };
  }
}

// Назначить исполнителя на запрос
export async function assignRequestToUser(id: string, userId: string) {
  try {
    await prisma.request.update({
      where: { id },
      data: { assignedToId: userId },
    })
    revalidatePath("/requests")
    return { success: true }
  } catch (error) {
    console.error("Error assigning request:", error)
    return { error: "Ошибка при назначении сотрудника" }
  }
}

// Удалить запрос по id
export async function deleteRequestById(id: string) {
  if (!id) return { error: 'Не передан id' }
  try {
    await prisma.request.delete({ where: { id } })
    return { success: true }
  } catch (e: any) {
    return { error: e.message || 'Ошибка удаления запроса' }
  }
}