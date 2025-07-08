"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function getIncidents() {
  try {
    const incidents = await prisma.incident.findMany({
      include: {
        reporter: {
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

    return incidents
  } catch (error) {
    console.error("Error fetching incidents:", error)
    return []
  }
}

export async function getIncident(id: string) {
  try {
    const incident = await prisma.incident.findUnique({
      where: { id },
      include: {
        reporter: {
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

    return incident
  } catch (error) {
    console.error("Error fetching incident:", error)
    return null
  }
}

export async function createIncident(formData: FormData) {
  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const priority = formData.get("priority") as string
  const category = formData.get("category") as string
  const reporterId = formData.get("reporterId") as string
  const assigneeId = formData.get("assigneeId") as string

  if (!title || !description || !reporterId) {
    return { error: "Заполните все обязательные поля" }
  }

  try {
    await prisma.incident.create({
      data: {
        title,
        description,
        priority: priority as any,
        category,
        reporterId,
        assigneeId: assigneeId || null,
      },
    })

    revalidatePath("/incidents")
    redirect("/incidents")
  } catch (error) {
    console.error("Error creating incident:", error)
    return { error: "Ошибка при создании инцидента" }
  }
}

export async function updateIncident(id: string, formData: FormData) {
  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const status = formData.get("status") as string
  const priority = formData.get("priority") as string
  const category = formData.get("category") as string
  const assigneeId = formData.get("assigneeId") as string

  try {
    await prisma.incident.update({
      where: { id },
      data: {
        title,
        description,
        status: status as any,
        priority: priority as any,
        category,
        assigneeId: assigneeId || null,
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

export async function deleteIncident(id: string) {
  try {
    await prisma.incident.delete({
      where: { id },
    })

    revalidatePath("/incidents")
  } catch (error) {
    console.error("Error deleting incident:", error)
    return { error: "Ошибка при удалении инцидента" }
  }
}
