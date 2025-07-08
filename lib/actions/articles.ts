"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function getArticles() {
  try {
    const articles = await prisma.article.findMany({
      include: {
        author: {
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

    return articles
  } catch (error) {
    console.error("Error fetching articles:", error)
    return []
  }
}

export async function getArticle(id: string) {
  try {
    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    })

    if (article) {
      // Увеличиваем счетчик просмотров
      await prisma.article.update({
        where: { id },
        data: {
          views: {
            increment: 1,
          },
        },
      })
    }

    return article
  } catch (error) {
    console.error("Error fetching article:", error)
    return null
  }
}

export async function createArticle(formData: FormData) {
  const title = formData.get("title") as string
  const content = formData.get("content") as string
  const category = formData.get("category") as string
  const tags = formData.get("tags") as string
  const authorId = formData.get("authorId") as string
  const status = formData.get("status") as string

  if (!title || !content || !authorId) {
    return { error: "Заполните все обязательные поля" }
  }

  try {
    const tagsArray = tags ? tags.split(",").map((tag) => tag.trim()) : []

    await prisma.article.create({
      data: {
        title,
        content,
        category: category || "Общее",
        tags: tagsArray,
        status: (status as any) || "DRAFT",
        authorId,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
      },
    })

    revalidatePath("/knowledge-base")
    redirect("/knowledge-base")
  } catch (error) {
    console.error("Error creating article:", error)
    return { error: "Ошибка при создании статьи" }
  }
}

export async function updateArticle(id: string, formData: FormData) {
  const title = formData.get("title") as string
  const content = formData.get("content") as string
  const category = formData.get("category") as string
  const tags = formData.get("tags") as string
  const status = formData.get("status") as string

  try {
    const tagsArray = tags ? tags.split(",").map((tag) => tag.trim()) : []

    await prisma.article.update({
      where: { id },
      data: {
        title,
        content,
        category: category || "Общее",
        tags: tagsArray,
        status: status as any,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
      },
    })

    revalidatePath("/knowledge-base")
    revalidatePath(`/knowledge-base/${id}`)
  } catch (error) {
    console.error("Error updating article:", error)
    return { error: "Ошибка при обновлении статьи" }
  }
}

export async function deleteArticle(id: string) {
  try {
    await prisma.article.delete({
      where: { id },
    })

    revalidatePath("/knowledge-base")
  } catch (error) {
    console.error("Error deleting article:", error)
    return { error: "Ошибка при удалении статьи" }
  }
}

export async function searchArticles(query: string) {
  try {
    const articles = await prisma.article.findMany({
      where: {
        OR: [
          {
            title: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            content: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            tags: {
              has: query,
            },
          },
        ],
        status: "PUBLISHED",
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        views: "desc",
      },
    })

    return articles
  } catch (error) {
    console.error("Error searching articles:", error)
    return []
  }
}
