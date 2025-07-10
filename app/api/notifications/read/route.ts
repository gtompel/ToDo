import { NextRequest, NextResponse } from 'next/server';
import { markNotificationAsRead } from '@/lib/actions/notifications';
import { getCurrentUser } from '@/lib/auth';

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { notificationId } = await req.json();
  if (!notificationId) {
    return NextResponse.json({ error: 'Missing notificationId' }, { status: 400 });
  }
  const notification = await markNotificationAsRead(notificationId);
  return NextResponse.json(notification);
} 