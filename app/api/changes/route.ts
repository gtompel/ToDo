import { NextRequest } from 'next/server';
import { getChanges } from '@/lib/actions/changes';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
  const { data, total } = await getChanges(page, pageSize);
  return Response.json({ data, total });
} 