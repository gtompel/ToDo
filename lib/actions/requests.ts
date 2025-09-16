// Серверные экшены для работы с запросами (Request)
"use server"

import { prisma } from "@/lib/prisma"
import type { Priority, RequestStatus } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { createNotification } from "./notifications";

// Получить все запросы с пагинацией
export async function getRequests(page = 1, pageSize = 10): Promise<{ data: unknown[]; total: number }> {
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
    return null
  }
}

// Создать новый запрос
export async function createRequest(formData: FormData, userId?: string): Promise<{ error?: string }> {
  const title = formData.get("title")?.toString() || ""
  const description = formData.get("description")?.toString() || ""
  const priority = formData.get("priority") as Priority
  const assignedToId = formData.get("assigneeId")?.toString() || null
  const acknowledgmentFileEntry = formData.get("acknowledgmentFile")
  let acknowledgmentFile: string | null = null
  if (acknowledgmentFileEntry instanceof File) {
    acknowledgmentFile = acknowledgmentFileEntry.name
  } else if (typeof acknowledgmentFileEntry === "string") {
    acknowledgmentFile = acknowledgmentFileEntry
  }
  if (!title || !description || !userId) {
    return { error: "Заполните все обязательные поля" }
  }
  try {
    await prisma.request.create({
      data: {
        title,
        description,
        priority,
        createdById: userId!,
        assignedToId,
        acknowledgmentFile,
      },
    })
    return {};
  } catch (error) {
    return { error: "Ошибка при создании запроса" }
  }
}

// Обновить запрос
export async function updateRequest(id: string, formData: FormData): Promise<{ error?: string }> {
  const title = formData.get("title")?.toString() || ""
  const description = formData.get("description")?.toString() || ""
  const status = formData.get("status") as RequestStatus
  const priority = formData.get("priority") as Priority
  const assignedToId = formData.get("assigneeId")?.toString() || null
  try {
    await prisma.request.update({
      where: { id },
      data: {
        title,
        description,
        status,
        priority,
        assignedToId,
      },
    })
    return {};
  } catch (error) {
    return { error: "Ошибка при обновлении запроса" }
  }
}

// Сменить статус запроса
export async function updateRequestStatus(id: string, status: RequestStatus): Promise<{ success?: true; error?: string }> {
  try {
    const request = await prisma.request.update({
      where: { id },
      data: { status },
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
    return { error: "Ошибка при смене статуса" };
  }
}

// Сменить приоритет запроса
export async function updateRequestPriority(id: string, priority: Priority): Promise<{ success?: true; error?: string }> {
  try {
    await prisma.request.update({
      where: { id },
      data: { priority },
    });
    revalidatePath("/requests");
    return { success: true };
  } catch (error) {
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
    return { error: "Ошибка при назначении сотрудника" }
  }
}

// Удалить запрос по id
export async function deleteRequestById(id: string) {
  if (!id) return { error: 'Не передан id' }
  try {
    await prisma.request.delete({ where: { id } })
    return { success: true }
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : 'Ошибка удаления запроса' }
  }
}