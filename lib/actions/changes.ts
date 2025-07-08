"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function getChanges() {
  try {
    const changes = await prisma.change.findMany({
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

    return changes
  } catch (error) {
    console.error("Error fetching changes:", error)
    return []
  }
}

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

export async function createChange(formData: FormData) {
  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const type = formData.get("type") as string
  const priority = formData.get("priority") as string
  const risk = formData.get("risk") as string
  const category = formData.get("category") as string
  const creatorId = formData.get("creatorId") as string
  const assigneeId = formData.get("assigneeId") as string
  const scheduledDate = formData.get("scheduledDate") as string
  const implementationPlan = formData.get("implementationPlan") as string
  const backoutPlan = formData.get("backoutPlan") as string

  if (!title || !description || !creatorId) {
    return { error: "Заполните все обязательные поля" }
  }

  try {
    await prisma.change.create({
      data: {
        title,
        description,
        type: type as any,
        priority: priority as any,
        risk: risk as any,
        category,
        creatorId,
        assigneeId: assigneeId || null,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        implementationPlan,
        backoutPlan,
      },
    })

    revalidatePath("/changes")
    redirect("/changes")
  } catch (error) {
    console.error("Error creating change:", error)
    return { error: "Ошибка при создании изменения" }
  }
}

export async function updateChange(id: string, formData: FormData) {
  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const status = formData.get("status") as string
  const type = formData.get("type") as string
  const priority = formData.get("priority") as string
  const risk = formData.get("risk") as string
  const category = formData.get("category") as string
  const assigneeId = formData.get("assigneeId") as string
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
        type: type as any,
        priority: priority as any,
        risk: risk as any,
        category,
        assigneeId: assigneeId || null,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        implementationPlan,
        backoutPlan,
        completedAt: status === "COMPLETED" ? new Date() : null,
      },
    })

    revalidatePath("/changes")
    revalidatePath(`/changes/${id}`)
  } catch (error) {
    console.error("Error updating change:", error)
    return { error: "Ошибка при обновлении изменения" }
  }
}

export async function deleteChange(id: string) {
  try {
    await prisma.change.delete({
      where: { id },
    })

    revalidatePath("/changes")
  } catch (error) {
    console.error("Error deleting change:", error)
    return { error: "Ошибка при удалении изменения" }
  }
}
