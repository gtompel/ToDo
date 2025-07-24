import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const setting = await prisma.systemSettings.findUnique({ where: { key: 'help_text' } });
  return Response.json({ text: setting?.value || '' });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (user?.role !== 'ADMIN') return Response.json({ error: 'Нет прав' }, { status: 403 });
  const { text } = await req.json();
  await prisma.systemSettings.upsert({
    where: { key: 'help_text' },
    update: { value: text },
    create: { key: 'help_text', value: text },
  });
  return Response.json({ success: true });
} 