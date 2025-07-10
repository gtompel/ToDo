import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // Пользователи
  await prisma.user.create({
    data: { id: 'u1', firstName: 'Иван', lastName: 'Иванов', email: 'ivanov@example.com', password: 'test123' },
  })
  await prisma.user.create({
    data: { id: 'u2', firstName: 'Петр', lastName: 'Петров', email: 'petrov@example.com', password: 'test123' },
  })
  await prisma.user.create({
    data: { id: 'u3', firstName: 'Сидор', lastName: 'Сидоров', email: 'sidorov@example.com', password: 'test123' },
  })

  // Изменения
  await prisma.change.create({
    data: {
      title: 'Обновление сервера БД',
      description: 'Плановое обновление PostgreSQL',
      priority: 'HIGH',
      status: 'DRAFT',
      category: 'database',
      assignedToId: 'u2',
      createdById: 'u1',
      scheduledAt: new Date(),
      businessJustification: 'Необходимо для повышения безопасности',
      implementationPlan: '1. Бэкап 2. Обновление 3. Проверка',
      backoutPlan: 'Восстановление из бэкапа',
      testPlan: 'Проверка работоспособности',
      risk: 'Средний',
      impact: 'Средний',
      urgency: 'Высокая',
      affectedSystems: ['Сервер базы данных'],
      approvers: ['u3'],
    },
  })
  await prisma.change.create({
    data: {
      title: 'Обновление ПО на рабочих станциях',
      description: 'Установка новых версий офисных программ',
      priority: 'MEDIUM',
      status: 'PENDING_APPROVAL',
      category: 'software',
      assignedToId: 'u3',
      createdById: 'u2',
      scheduledAt: new Date(),
      businessJustification: 'Для совместимости с новыми файлами',
      implementationPlan: '1. Сбор списка ПО 2. Установка 3. Тестирование',
      backoutPlan: 'Откат к предыдущей версии',
      testPlan: 'Проверка запуска',
      risk: 'Низкий',
      impact: 'Низкий',
      urgency: 'Средняя',
      affectedSystems: ['Веб-сервер', 'Файловый сервер'],
      approvers: ['u1'],
    },
  })

  // Инциденты
  await prisma.incident.create({
    data: {
      title: 'Сбой почтового сервера',
      description: 'Почтовый сервер не отвечает с 9:00',
      priority: 'CRITICAL',
      status: 'OPEN',
      category: 'network',
      assignedToId: 'u1',
      createdById: 'u2',
      attachments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  })
  await prisma.incident.create({
    data: {
      title: 'Ошибка доступа к базе данных',
      description: 'Пользователи не могут подключиться к БД',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      category: 'database',
      assignedToId: 'u3',
      createdById: 'u1',
      attachments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  })

  // Запросы
  await prisma.request.create({
    data: {
      title: 'Доступ к файловому серверу',
      description: 'Необходим доступ к папке отдела продаж',
      priority: 'MEDIUM',
      status: 'OPEN',
      category: 'security',
      assignedToId: 'u2',
      createdById: 'u3',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  })
  await prisma.request.create({
    data: {
      title: 'Установка ПО',
      description: 'Пользователь просит установить MS Office',
      priority: 'LOW',
      status: 'IN_PROGRESS',
      category: 'software',
      assignedToId: 'u1',
      createdById: 'u2',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 