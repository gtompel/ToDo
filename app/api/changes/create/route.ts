import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ALLOWED_STATUS = ["DRAFT", "PENDING_APPROVAL", "APPROVED", "IN_PROGRESS", "IMPLEMENTED", "CANCELLED"];
const ALLOWED_PRIORITY = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export async function POST(req: Request) {
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