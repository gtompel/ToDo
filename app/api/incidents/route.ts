import { NextResponse } from "next/server"
import { createIncident } from "@/lib/actions/incidents"
import { getCurrentUser } from "@/lib/auth"
import { NextRequest } from 'next/server'; // используется в GET — оставляем
import { getIncidents } from '@/lib/actions/incidents';
import { isRateLimited } from '@/lib/utils'

export async function POST(req: Request) { // ✅ Заменили `any` на `Request`
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 })
  }

  // Простая защита от спама: 30 созданий за 10 минут на пользователя
  const ip = req.headers.get?.('x-forwarded-for') || 'unknown'
  const key = `incident:create:${user.id}:${ip}`
  if (isRateLimited(key, 30, 10 * 60 * 1000)) {
    return NextResponse.json({ error: 'Слишком много операций. Попробуйте позже.' }, { status: 429 })
  }

  const formData = await req.formData()

  // Сохраняем файлы во временную папку и подменяем значения attachments путями
  const files = formData.getAll('attachments') as File[] // ✅ Явное утверждение типа
  const savedPaths: string[] = []

  if (files && files.length > 0) {
    const fs = await import('fs')
    const path = await import('path')
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    for (const f of files) {
      // Проверяем, что это действительно File с методом arrayBuffer
      if (!(f instanceof File) || typeof f.arrayBuffer !== 'function') continue

      const ab = await f.arrayBuffer()
      const buffer = Buffer.from(ab)
      const ext = f.name?.split('.').pop() || 'bin'
      const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
      const filePath = path.join(uploadDir, filename)

      fs.writeFileSync(filePath, buffer)
      savedPaths.push(`/uploads/${filename}`)
    }

    // Очистим старые entries и положим нормализованные пути
    formData.delete('attachments')
    for (const p of savedPaths) {
      formData.append('attachments', p)
    }
  }

  const result = await createIncident(formData, user.id)
  if (result?.error) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1', 10)
  const pageSize = parseInt(searchParams.get('pageSize') || '10', 10)
  const { data, total } = await getIncidents(page, pageSize)
  return Response.json({ data, total })
}