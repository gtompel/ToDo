import { NextResponse } from "next/server"
import { createIncident } from "@/lib/actions/incidents"
import { getCurrentUser } from "@/lib/auth"
import { NextRequest } from 'next/server';
import { getIncidents } from '@/lib/actions/incidents';

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 })
  }
  const formData = await req.formData()
  const result = await createIncident(formData, user.id)
  if (result?.error) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }
  return NextResponse.json({ success: true })
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
  const { data, total } = await getIncidents(page, pageSize);
  return Response.json({ data, total });
} 