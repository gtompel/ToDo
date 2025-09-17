import { NextResponse } from 'next/server';

const AI_API_URL = process.env.AI_API_URL || 'http://172.16.8.200:11434';

export async function GET() {
  try {
    const res = await fetch(`${AI_API_URL}/api/tags`, { next: { revalidate: 0 } });
    const data = await res.text();
    return new NextResponse(data, {
      status: res.status,
      headers: { 'Content-Type': res.headers.get('content-type') || 'application/json' },
    });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
