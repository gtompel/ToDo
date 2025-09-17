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
  let timer: NodeJS.Timeout | null = null;
  let heartbeat: NodeJS.Timeout | null = null;
  let closed = false;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      // Heartbeat каждые 25s (важно для прокси/браузеров)
      heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`));
        } catch {}
      }, 25_000);

      let lastCount = 0;
      const poll = async () => {
        if (closed) return;
        try {
          const notifications = await getUserNotifications(user.id);
          if (notifications.length > lastCount) {
            const newNotifications = notifications.slice(lastCount).reverse();
            for (const n of newNotifications) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(n)}\n\n`));
            }
            lastCount = notifications.length;
          }
        } catch (e) {
          controller.enqueue(encoder.encode(`event: error\n` + `data: ${JSON.stringify({ message: 'stream_error' })}\n\n`));
        } finally {
          timer = setTimeout(poll, 3000);
        }
      };
      poll();

      // Завершение по прерыванию клиента
      const signal = req.signal;
      const onAbort = () => {
        if (closed) return;
        closed = true;
        if (timer) clearTimeout(timer);
        if (heartbeat) clearInterval(heartbeat);
        try {
          controller.close();
        } catch {}
      };
      if (signal.aborted) onAbort();
      signal.addEventListener('abort', onAbort);
    },
    cancel() {
      if (closed) return;
      closed = true;
      if (timer) clearTimeout(timer);
      if (heartbeat) clearInterval(heartbeat);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
} 