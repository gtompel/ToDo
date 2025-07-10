import { prisma } from '../prisma';

// Получить все уведомления пользователя
export async function getUserNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

// Создать новое уведомление
export async function createNotification(userId: string, title: string, message: string) {
  return prisma.notification.create({
    data: { userId, title, message },
  });
}

// Отметить уведомление как прочитанное
export async function markNotificationAsRead(notificationId: string) {
  return prisma.notification.update({
    where: { id: notificationId },
    data: { read: true },
  });
}

// Отметить все уведомления пользователя как прочитанные
export async function markAllNotificationsAsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
} 