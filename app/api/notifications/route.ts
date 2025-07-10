import { NextRequest, NextResponse } from 'next/server';
import { getUserNotifications, createNotification } from '@/lib/actions/notifications';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const notifications = await getUserNotifications(user.id);
    return NextResponse.json(notifications);
  } catch (e) {
    console.error('NOTIFICATIONS GET ERROR', e);
    return NextResponse.json({ error: 'Server error', details: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { title, message } = await req.json();
    if (!title || !message) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }
    const notification = await createNotification(user.id, title, message);
    return NextResponse.json(notification);
  } catch (e) {
    console.error('NOTIFICATIONS POST ERROR', e);
    return NextResponse.json({ error: 'Server error', details: String(e) }, { status: 500 });
  }
} 