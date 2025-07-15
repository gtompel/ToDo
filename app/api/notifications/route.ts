import { NextRequest, NextResponse } from 'next/server';
import { getUserNotifications, createNotification, getAllNotifications } from '@/lib/actions/notifications';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.role === 'ADMIN') {
      const notifications = await getAllNotifications();
      return NextResponse.json(notifications);
    }
    const notifications = await getUserNotifications(user.id);
    return NextResponse.json(notifications);
  } catch (e) {
    console.error('NOTIFICATIONS GET ERROR', e);
    return NextResponse.json({ error: 'Server error', details: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { title, message, userId } = await req.json();
    if (!title || !message) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }
    // Если админ — можно указать userId, иначе только себе
    const targetUserId = user.role === 'ADMIN' && userId ? userId : user.id;
    const notification = await createNotification(targetUserId, title, message);
    return NextResponse.json(notification);
  } catch (e) {
    console.error('NOTIFICATIONS POST ERROR', e);
    return NextResponse.json({ error: 'Server error', details: String(e) }, { status: 500 });
  }
} 