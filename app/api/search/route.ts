import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q")?.trim().toLowerCase() || ""
  if (!q) return NextResponse.json({ results: [] })

  // Поиск по ИТ-ресурсам
  const itResources = await prisma.iTResource.findMany({
    where: {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { owner: { contains: q, mode: "insensitive" } },
      ]
    },
    take: 5
  })

  // Поиск по рабочим станциям
  const workstations = await prisma.workstation.findMany({
    where: {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { ip: { contains: q, mode: "insensitive" } },
      ]
    },
    take: 5,
    include: { user: true }
  })

  // Поиск по пользователям
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { firstName: { contains: q, mode: "insensitive" } },
        { lastName: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
      ]
    },
    take: 5
  })

  // Поиск по инцидентам
  const incidents = await prisma.incident.findMany({
    where: {
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ]
    },
    take: 5
  })

  // Поиск по статьям базы знаний
  const articles = await prisma.article.findMany({
    where: {
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { content: { contains: q, mode: "insensitive" } },
        { tags: { has: q } },
      ],
      status: "published",
    },
    take: 5,
  })

  // Поиск по сервисам
  const services = await prisma.service.findMany({
    where: {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ]
    },
    take: 5,
    include: {
      responsible: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        }
      }
    }
  })

  // Поиск по услугам
  const serviceItems = await prisma.serviceItem.findMany({
    where: {
      OR: [
        { code: { contains: q, mode: "insensitive" } },
        { owner: { contains: q, mode: "insensitive" } },
        { systemName: { contains: q, mode: "insensitive" } },
        { supportCode: { contains: q, mode: "insensitive" } },
        { supportName: { contains: q, mode: "insensitive" } },
        { card: { contains: q, mode: "insensitive" } },
        { passport: { contains: q, mode: "insensitive" } },
        { note: { contains: q, mode: "insensitive" } },
      ]
    },
    take: 5
  })

  const results = [
    ...itResources.map((r: any) => ({
      type: "ИТ-ресурс",
      id: r.id,
      title: r.name,
      description: r.description,
      href: `/it-resources/${r.id}`
    })),
    ...workstations.map((w: any) => ({
      type: "Рабочая станция",
      id: w.id,
      title: w.name,
      description: w.description,
      href: `/workstations/${w.id}`
    })),
    ...users.map((u: any) => ({
      type: "Пользователь",
      id: u.id,
      title: `${u.firstName} ${u.lastName}`,
      description: u.email,
      href: `/users/${u.id}`
    })),
    ...incidents.map((i: any) => ({
      type: "Инцидент",
      id: i.id,
      title: i.title,
      description: i.description,
      href: `/incidents/${i.id}`
    })),
    ...articles.map((a: any) => ({
      type: "Статья базы знаний",
      id: a.id,
      title: a.title,
      description: a.content?.slice(0, 120) || "",
      href: `/knowledge-base/${a.id}`
    })),
    ...services.map((s: any) => ({
      type: "Сервис",
      id: s.id,
      title: s.name,
      description: s.description,
      href: `/services/${s.id}`
    })),
    ...serviceItems.map((si: any) => ({
      type: "Услуга",
      id: si.id,
      title: si.systemName || si.code,
      description: si.card || si.passport || si.note,
      href: `/service-items/${si.id}`
    })),
  ]

  return NextResponse.json({ results })
}