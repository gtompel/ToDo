import { NextRequest } from 'next/server';
import { getUserNotifications } from '@/lib/actions/notifications';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let lastCount = 0;
      while (true) {
        const notifications = await getUserNotifications(user.id);
        if (notifications.length > lastCount) {
          const newNotifications = notifications.slice(0, notifications.length - lastCount);
          newNotifications.reverse().forEach(n => {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(n)}\n\n`)
            );
          });
          lastCount = notifications.length;
        }
        await new Promise(r => setTimeout(r, 3000));
      }
    },
    cancel() {},
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
} 