import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { isRateLimited } from "@/lib/utils";

const ALLOWED_STATUS = ["DRAFT", "PENDING_APPROVAL", "APPROVED", "IN_PROGRESS", "IMPLEMENTED", "CANCELLED"];
const ALLOWED_PRIORITY = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export async function POST(req: any) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  // CSRF: Origin/Host
  try {
    const origin = req.headers.get?.('origin') || req.headers['origin'] || ''
    const host = req.headers.get?.('host') || req.headers['host'] || ''
    const allowedEnv = (process.env.ALLOWED_ORIGINS || '').split(',').map((s: string) => s.trim()).filter(Boolean)
    const derived = [`http://${host}`, `https://${host}`]
    const isAllowed = origin === '' || allowedEnv.includes(origin) || derived.includes(origin)
    if (!isAllowed) return NextResponse.json({ error: 'Недопустимый источник запроса' }, { status: 403 })
  } catch {}

  // Rate-limit на пользователя + IP
  const ip = req.headers.get?.('x-forwarded-for') || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown'
  const key = `change:create:${user.id}:${ip}`
  if (isRateLimited(key, 30, 10 * 60 * 1000)) {
    return NextResponse.json({ error: 'Слишком много операций. Попробуйте позже.' }, { status: 429 })
  }
  const data = await req.json();
  const {
    title, description, priority, category, requester,
    scheduledDate, status, assignedToId,
    businessJustification, implementationPlan, backoutPlan, testPlan, risk, impact, urgency, affectedSystems, approvers
  } = data;

  if (!title || !description || !priority || !requester) {
    return NextResponse.json({ error: "Заполните все обязательные поля" }, { status: 400 });
  }
  if (!ALLOWED_PRIORITY.includes(priority.toUpperCase())) {
    return NextResponse.json({ error: "Некорректный приоритет" }, { status: 400 });
  }
  if (!ALLOWED_STATUS.includes(status)) {
    return NextResponse.json({ error: "Некорректный статус" }, { status: 400 });
  }
  try {
    const change = await prisma.change.create({
      data: {
        title,
        description,
        priority: priority.toUpperCase(),
        category,
        createdById: requester,
        assignedToId: assignedToId || null,
        scheduledAt: scheduledDate ? new Date(scheduledDate) : null,
        status,
        businessJustification,
        implementationPlan,
        backoutPlan,
        testPlan,
        risk,
        impact,
        urgency,
        affectedSystems: Array.isArray(affectedSystems) ? affectedSystems : [],
        approvers: Array.isArray(approvers) ? approvers : [],
      },
    });
    return NextResponse.json({ success: true, change });
  } catch (e) {
    return NextResponse.json({ error: "Ошибка при создании изменения", details: String(e) }, { status: 500 });
  }
} 