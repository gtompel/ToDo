'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Notification = {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
};

// Центр уведомлений
export default function NotificationCenter({ onRead, onUnreadCount }: { onRead?: () => void, onUnreadCount?: (count: number) => void }) {
  // Состояния для уведомлений и загрузки
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // SSE подписка на поток уведомлений
  useEffect(() => {
    let active = true;
    const eventSource = new EventSource('/api/notifications/stream');
    eventSource.onmessage = (event) => {
      if (!active) return;
      const notification = JSON.parse(event.data);
      setNotifications((prev) => {
        // Не добавлять дубликаты
        if (prev.some((n) => n.id === notification.id)) return prev;
        return [notification, ...prev];
      });
      setLoading(false);
    };
    eventSource.onerror = () => {
      eventSource.close();
    };
    return () => {
      active = false;
      eventSource.close();
    };
  }, []);

  // Вызываем onUnreadCount при изменении notifications
  useEffect(() => {
    if (onUnreadCount) {
      onUnreadCount(notifications.filter(n => !n.read).length);
    }
  }, [notifications, onUnreadCount]);

  // Пометить уведомление как прочитанное
  const markAsRead = async (id: string) => {
    await fetch('/api/notifications/read', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notificationId: id }),
    });
    setNotifications(notifications =>
      notifications.map(n =>
        n.id === id ? { ...n, read: true } : n
      )
    );
    onRead && onRead();
  };

  if (loading) return <div className="p-4">Загрузка уведомлений...</div>;

  const lastNotifications = notifications.slice(0, 5);

  return (
    <div className="p-4 w-80 bg-background shadow rounded border">
      <h2 className="font-bold mb-2 text-foreground">Уведомления</h2>
      {lastNotifications.length === 0 && <div className="text-muted-foreground">Нет уведомлений</div>}
      <ul>
        {lastNotifications.map(n => (
          <li
            key={n.id}
            className={`mb-2 p-2 rounded ${n.read ? 'bg-muted' : 'bg-blue-50 dark:bg-blue-950/20'}`}
          >
            <div className="font-semibold text-foreground">{n.title}</div>
            <div className="text-sm text-foreground">{n.message}</div>
            <div className="text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleString()}</div>
            {!n.read && (
              <button
                className="mt-1 text-xs text-blue-600 underline"
                onClick={() => markAsRead(n.id)}
              >
                Отметить как прочитано
              </button>
            )}
          </li>
        ))}
      </ul>
      <Link href="/notifications" className="block mt-2 text-center text-xs text-blue-600 underline">
        Показать все
      </Link>
    </div>
  );
}
