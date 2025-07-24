// Серверные экшены для работы с изменениями (Change)
"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createNotification } from "./notifications";

// Получить все изменения с пагинацией
export async function getChanges(page = 1, pageSize = 10) {
  try {
    const [changes, total] = await Promise.all([
      prisma.change.findMany({
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
      prisma.change.count(),
    ])
    return { data: changes, total }
  } catch (error) {
    console.error("Error fetching changes:", error)
    return { data: [], total: 0 }
  }
}

// Получить одно изменение по id
export async function getChange(id: string) {
  try {
    const change = await prisma.change.findUnique({
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

    return change
  } catch (error) {
    console.error("Error fetching change:", error)
    return null
  }
}

// Создать новое изменение
export async function createChange(formData: FormData) {
  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const priority = formData.get("priority") as string
  const category = formData.get("category") as string
  const createdById = formData.get("creatorId") as string
  const assignedToId = formData.get("assigneeId") as string
  const scheduledDate = formData.get("scheduledDate") as string
  const implementationPlan = formData.get("implementationPlan") as string
  const backoutPlan = formData.get("backoutPlan") as string

  if (!title || !description || !createdById) {
    // Проверка обязательных полей
    return { error: "Заполните все обязательные поля" }
  }

  try {
    const change = await prisma.change.create({
      data: {
        title,
        description,
        priority: priority as any,
        category,
        createdById,
        assignedToId: assignedToId || null,
        scheduledAt: scheduledDate ? new Date(scheduledDate) : null,
        ...(implementationPlan ? { implementationPlan } : {}),
        ...(backoutPlan ? { backoutPlan } : {}),
      },
    });
    // Рассылка уведомлений всем пользователям
    const users = await prisma.user.findMany({ select: { id: true } });
    await Promise.all(
      users.map((u) =>
        createNotification(
          u.id,
          `Новое изменение: ${title}`,
          description
        )
      )
    );
    revalidatePath("/changes");
    redirect("/changes");
  } catch (error) {
    console.error("Error creating change:", error)
    return { error: "Ошибка при создании изменения" }
  }
}

// Обновить изменение
export async function updateChange(id: string, formData: FormData) {
  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const status = formData.get("status") as string
  const priority = formData.get("priority") as string
  const category = formData.get("category") as string
  const assignedToId = formData.get("assigneeId") as string
  const scheduledDate = formData.get("scheduledDate") as string
  const implementationPlan = formData.get("implementationPlan") as string
  const backoutPlan = formData.get("backoutPlan") as string

  try {
    await prisma.change.update({
      where: { id },
      data: {
        title,
        description,
        status: status as any,
        priority: priority as any,
        category,
        assignedToId: assignedToId || null,
        scheduledAt: scheduledDate ? new Date(scheduledDate) : null,
        ...(implementationPlan ? { implementationPlan } : {}),
        ...(backoutPlan ? { backoutPlan } : {}),
      },
    })

    revalidatePath("/changes")
    revalidatePath(`/changes/${id}`)
  } catch (error) {
    console.error("Error updating change:", error)
    return { error: "Ошибка при обновлении изменения" }
  }
}

// Назначить исполнителя на изменение
export async function assignChangeToUser(id: string, userId: string) {
  try {
    await prisma.change.update({
      where: { id },
      data: { assignedToId: userId },
    });
    revalidatePath("/changes");
    return { success: true };
  } catch (error) {
    console.error("Error assigning change:", error);
    return { error: "Ошибка при назначении сотрудника" };
  }
}

// Сменить статус изменения
export async function updateChangeStatus(id: string, status: string) {
  try {
    const change = await prisma.change.update({
      where: { id },
      data: { status: status as any },
      include: { assignedTo: true },
    });
    revalidatePath("/changes");
    return { success: true };
  } catch (error) {
    console.error("Error updating change status:", error);
    return { error: "Ошибка при смене статуса" };
  }
}

// Сменить приоритет изменения
export async function updateChangePriority(id: string, priority: string) {
  try {
    const change = await prisma.change.update({
      where: { id },
      data: { priority: priority as any },
    });
    revalidatePath("/changes");
    return { success: true };
  } catch (error) {
    console.error("Error updating change priority:", error);
    return { error: "Ошибка при смене приоритета" };
  }
}
