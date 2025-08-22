import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 })
  if (user.role !== "ADMIN") return NextResponse.json({ error: "Требуются права администратора" }, { status: 403 })

  const contentType = req.headers.get('content-type') || ''

  if (contentType.includes('multipart/form-data')) {
    try {
      const form = await req.formData()
      const id = String(form.get('id') || '')
      if (!id) return NextResponse.json({ error: 'Не передан id' }, { status: 400 })

      const title = form.get('title')?.toString()
      const description = form.get('description')?.toString()
      const category = form.get('category')?.toString()
      const status = form.get('status')?.toString()
      const priority = form.get('priority')?.toString()
      const assignedToId = form.get('assignedToId')?.toString()
      const preActions = form.get('preActions')?.toString()
      const expectedResult = form.get('expectedResult')?.toString()

      // keepAttachments может прийти множественными полями либо JSON
      const keepEntries = form.getAll('keepAttachments')
      let keepAttachments: string[] = []
      if (keepEntries && keepEntries.length > 0) {
        for (const k of keepEntries) {
          if (typeof k === 'string') {
            keepAttachments.push(k)
          }
        }
      } else {
        const keepJson = form.get('keepAttachmentsJson')?.toString()
        if (keepJson) {
          try { keepAttachments = JSON.parse(keepJson) } catch {}
        }
      }

      const uploadFiles = form.getAll('attachments') as File[]
      const savedPaths: string[] = []
      if (uploadFiles && uploadFiles.length > 0) {
        const uploadDir = path.join(process.cwd(), 'public', 'uploads')
        await mkdir(uploadDir, { recursive: true })
        for (const f of uploadFiles) {
          if (f && typeof (f as any).arrayBuffer === 'function' && f.size > 0) {
            const buffer = Buffer.from(await (f as any).arrayBuffer())
            const ext = (f as any).name?.split('.').pop() || 'bin'
            const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
            const filePath = path.join(uploadDir, filename)
            await writeFile(filePath, buffer)
            savedPaths.push(`/uploads/${filename}`)
          }
        }
      }

      const data: any = {
        ...(title !== undefined ? { title } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(category !== undefined ? { category } : {}),
        ...(status !== undefined ? { status } : {}),
        ...(priority !== undefined ? { priority } : {}),
        ...(assignedToId !== undefined ? { assignedToId: assignedToId ? String(assignedToId) : null } : {}),
        ...(preActions !== undefined ? { preActions } : {}),
        ...(expectedResult !== undefined ? { expectedResult } : {}),
        ...(keepAttachments || savedPaths.length > 0 ? { attachments: [...(keepAttachments || []), ...savedPaths] } : {}),
      }
      const updated = await prisma.incident.update({
        where: { id },
        data,
        include: {
          assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      })
      return NextResponse.json({ success: true, incident: updated })
    } catch (e: any) {
      return NextResponse.json({ error: 'Ошибка при обновлении инцидента', details: String(e) }, { status: 500 })
    }
  } else {
    const body = await req.json().catch(() => ({} as any))
    const { id, title, description, category, status, priority, assignedToId, preActions, expectedResult } = body || {}
    if (!id) return NextResponse.json({ error: "Не передан id" }, { status: 400 })
    try {
      const data: any = {
        ...(title !== undefined ? { title } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(category !== undefined ? { category } : {}),
        ...(status !== undefined ? { status } : {}),
        ...(priority !== undefined ? { priority } : {}),
        ...(assignedToId !== undefined ? { assignedToId: assignedToId ? String(assignedToId) : null } : {}),
        ...(preActions !== undefined ? { preActions } : {}),
        ...(expectedResult !== undefined ? { expectedResult } : {}),
      }
      const updated = await prisma.incident.update({
        where: { id },
        data,
        include: {
          assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      })
      return NextResponse.json({ success: true, incident: updated })
    } catch (e: any) {
      return NextResponse.json({ error: "Ошибка при обновлении инцидента", details: String(e) }, { status: 500 })
    }
  }
}


