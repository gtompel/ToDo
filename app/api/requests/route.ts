import { NextResponse } from "next/server"
import { createRequest } from "@/lib/actions/requests"
import { getCurrentUser } from "@/lib/auth"
import { isRateLimited } from '@/lib/utils'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(req: any) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 })
  }
  // Ограничение создания: 30 за 10 минут
  const ip = req.headers.get?.('x-forwarded-for') || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown'
  const key = `request:create:${user.id}:${ip}`
  if (isRateLimited(key, 30, 10 * 60 * 1000)) {
    return NextResponse.json({ error: 'Слишком много операций. Попробуйте позже.' }, { status: 429 })
  }
  const formData = await req.formData()
  const ack = formData.get('acknowledgmentFile') as File | null
  if (ack && typeof (ack as any).arrayBuffer === 'function' && ack.size > 0) {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadDir, { recursive: true })
    const buffer = Buffer.from(await (ack as any).arrayBuffer())
    const ext = (ack as any).name?.split('.').pop() || 'bin'
    const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
    const filePath = path.join(uploadDir, filename)
    await writeFile(filePath, buffer)
    formData.set('acknowledgmentFile', `/uploads/${filename}` as any)
  }
  const result = await createRequest(formData, user.id)
  if (result?.error) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }
  return NextResponse.json({ success: true })
} 