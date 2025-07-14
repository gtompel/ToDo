import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...');
  // Очистка всех таблиц (в правильном порядке)
  await prisma.workstation.deleteMany({})
  await prisma.iTResource.deleteMany({})
  await prisma.session.deleteMany({})
  await prisma.incident.deleteMany({})
  await prisma.request.deleteMany({})
  await prisma.change.deleteMany({})
  await prisma.article.deleteMany({})
  await prisma.user.deleteMany({})

  // Пользователи
  await prisma.user.createMany({
    data: [
      {
        id: 'admin-1', email: 'admin@example.com', password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', firstName: 'Иван', lastName: 'Иванов', middleName: 'Иванович', phone: '+79161234567', position: 'Системный администратор', department: 'IT отдел', role: 'ADMIN', status: 'active', isActive: true, createdAt: new Date(), updatedAt: new Date()
      },
      {
        id: 'tech-1', email: 'tech@example.com', password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', firstName: 'Петр', lastName: 'Петров', middleName: 'Петрович', phone: '+79161234568', position: 'Техник поддержки', department: 'IT отдел', role: 'TECHNICIAN', status: 'active', isActive: true, createdAt: new Date(), updatedAt: new Date()
      },
      {
        id: 'manager-1', email: 'manager@example.com', password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', firstName: 'Анна', lastName: 'Сидорова', middleName: 'Сергеевна', phone: '+79161234569', position: 'Менеджер IT', department: 'IT отдел', role: 'MANAGER', status: 'active', isActive: true, createdAt: new Date(), updatedAt: new Date()
      },
      {
        id: 'user-1', email: 'user@example.com', password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', firstName: 'Михаил', lastName: 'Козлов', middleName: 'Александрович', phone: '+79161234570', position: 'Бухгалтер', department: 'Бухгалтерия', role: 'USER', status: 'active', isActive: true, createdAt: new Date(), updatedAt: new Date()
      },
      {
        id: 'user-2', email: 'test@ru.ru', password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', firstName: 'Тест', lastName: 'Тестов', middleName: 'Тестович', phone: '+7123', position: 'Тестировщик', department: 'IT отдел', role: 'ADMIN', status: 'active', isActive: true, createdAt: new Date(), updatedAt: new Date()
      },
      {
        id: 'user-3', email: 'test1234@ru.ru', password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', firstName: 'Тест', lastName: 'Тестов', middleName: 'Тестович', phone: '+7123', position: 'Тестировщик', department: 'IT отдел', role: 'ADMIN', status: 'active', isActive: true, createdAt: new Date(), updatedAt: new Date()
      },
      {
        id: 'user-4', email: 'test1@ru.ru', password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', firstName: 'Тест', lastName: 'Тестов', middleName: 'Тестович', phone: '+7123', position: 'Тестировщик', department: 'IT отдел', role: 'ADMIN', status: 'active', isActive: true, createdAt: new Date(), updatedAt: new Date()
      },
      {
        id: 'user-5', email: 'test12@ru.ru', password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', firstName: 'Тест', lastName: 'Тестов', middleName: 'Тестович', phone: '+7123', position: 'Тестировщик', department: 'IT отдел', role: 'ADMIN', status: 'active', isActive: true, createdAt: new Date(), updatedAt: new Date()
      },
      {
        id: 'user-6', email: 'test123@ru.ru', password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', firstName: 'Тест', lastName: 'Тестов', middleName: 'Тестович', phone: '+7123', position: 'Тестировщик', department: 'IT отдел', role: 'ADMIN', status: 'active', isActive: true, createdAt: new Date(), updatedAt: new Date()
      },
      {
        id: 'user-7', email: 'ivanov@company.com', password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', firstName: 'Иван', lastName: 'Иванов', middleName: 'Иванович', phone: '+79161234567', position: 'Системный администратор', department: 'IT отдел', role: 'ADMIN', status: 'active', isActive: true, createdAt: new Date(), updatedAt: new Date()
      },
      {
        id: 'user-8', email: 'Leg123@ru.ru', password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', firstName: 'Легов', lastName: 'Лег', middleName: 'Легович', phone: '+79161234567', position: 'Менеджер', department: 'Бухгалтерия', role: 'USER', status: 'active', isActive: true, createdAt: new Date(), updatedAt: new Date()
      },
      {
        id: 'user-9', email: 'oleg23@rus.com', password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', firstName: 'Олег', lastName: 'Олег', middleName: 'Олег', phone: '+79999999999', position: 'Менеджер', department: 'IT отдел', role: 'USER', status: 'active', isActive: true, createdAt: new Date(), updatedAt: new Date()
      },
      {
        id: 'user-10', email: 'petrov@company.com', password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', firstName: 'Петров', lastName: 'Петр', middleName: 'Петрович', phone: '+79999999999', position: 'Менеджер', department: 'IT отдел', role: 'MANAGER', status: 'active', isActive: true, createdAt: new Date(), updatedAt: new Date()
      },
    ]
  })

  // Инциденты
  await prisma.incident.createMany({
    data: [
      { id: 'inc-1', title: 'Не работает принтер в офисе', description: 'Принтер HP LaserJet не печатает документы', priority: 'HIGH', status: 'OPEN', category: 'Оборудование', assignedToId: 'tech-1', createdById: 'user-1', createdAt: new Date(), updatedAt: new Date(), attachments: [] },
      { id: 'inc-2', title: 'Медленная работа сети', description: 'Скорость интернета значительно снижена', priority: 'MEDIUM', status: 'IN_PROGRESS', category: 'Сеть', assignedToId: 'tech-1', createdById: 'user-1', createdAt: new Date(), updatedAt: new Date(), attachments: [] },
      { id: 'inc-3', title: 'Ошибка в системе учета', description: 'При сохранении данных возникает ошибка 500', priority: 'CRITICAL', status: 'OPEN', category: 'ПО', assignedToId: 'admin-1', createdById: 'user-1', createdAt: new Date(), updatedAt: new Date(), attachments: [] },
    ]
  })

  // Запросы
  await prisma.request.createMany({
    data: [
      { id: 'req-1', title: 'Установка нового ПО', description: 'Необходимо установить Adobe Photoshop', priority: 'MEDIUM', status: 'OPEN', category: 'ПО', assignedToId: 'tech-1', createdById: 'user-1', createdAt: new Date(), updatedAt: new Date() },
      { id: 'req-2', title: 'Создание нового пользователя', description: 'Создать учетную запись для нового сотрудника', priority: 'LOW', status: 'RESOLVED', category: 'Доступ', assignedToId: 'admin-1', createdById: 'manager-1', createdAt: new Date(), updatedAt: new Date() },
    ]
  })

  // Изменения
  await prisma.change.createMany({
    data: [
      { id: 'chg-1', title: 'Обновление операционной системы', description: 'Обновление Windows Server до последней версии', priority: 'HIGH', status: 'PENDING_APPROVAL', category: 'Система', assignedToId: 'admin-1', createdById: 'manager-1', scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), createdAt: new Date(), updatedAt: new Date(), affectedSystems: [], approvers: [] },
      { id: 'chg-2', title: 'Замена сетевого оборудования', description: 'Замена коммутатора в серверной', priority: 'CRITICAL', status: 'APPROVED', category: 'Сеть', assignedToId: 'tech-1', createdById: 'admin-1', scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), createdAt: new Date(), updatedAt: new Date(), affectedSystems: [], approvers: [] },
    ]
  })

  // Статьи
  await prisma.article.createMany({
    data: [
      { id: 'art-1', title: 'Как сбросить пароль пользователя', content: 'Инструкция по сбросу пароля в Active Directory...', category: 'Инструкции', tags: ['пароль', 'AD', 'пользователи'], isPublished: true, createdById: 'admin-1', createdAt: new Date(), updatedAt: new Date(), authorId: 'admin-1' },
      { id: 'art-2', title: 'Настройка принтера HP LaserJet', content: 'Пошаговая инструкция по настройке принтера...', category: 'Оборудование', tags: ['принтер', 'HP', 'настройка'], isPublished: true, createdById: 'tech-1', createdAt: new Date(), updatedAt: new Date(), authorId: 'tech-1' },
      { id: 'art-3', title: 'Решение проблем с сетью', content: 'Диагностика и устранение сетевых проблем...', category: 'Сеть', tags: ['сеть', 'диагностика', 'проблемы'], isPublished: true, createdById: 'tech-1', createdAt: new Date(), updatedAt: new Date(), authorId: 'tech-1' },
    ]
  })

  // ИТ-ресурсы
  await prisma.iTResource.createMany({
    data: [
      {
        name: 'АГРОРУС',
        description: 'система управления аграрными ресурсами',
        owner: 'ЗАО Уголь',
        source: 'https://agro.example.com',
        roles: ['Менеджер'],
        note: 'Модуль управления',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'АГРОРУСИЧ',
        description: 'система управления агропредприятиями',
        owner: 'ЗАО Уголь',
        source: 'https://agrosich.example.com',
        roles: ['Администратор'],
        note: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'АРИДА',
        description: 'Техническая система',
        owner: 'РОСАТОМ',
        source: 'https://arida.example.com',
        roles: ['Администратор'],
        note: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'ПИРАМИДА',
        description: 'Финансовая система',
        owner: 'ОАО МАВРОДИ',
        source: 'https://piramida.example.com',
        roles: ['Администратор'],
        note: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'УРУС',
        description: 'система управления различными процессами',
        owner: 'ОАО УГОЛЬ',
        source: 'https://urus.example.com',
        roles: ['Администратор', 'Менеджер'],
        note: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]
  })

  // Рабочие станции
  await prisma.workstation.createMany({
    data: [
      {
        name: 'WS-001',
        description: 'Рабочая станция бухгалтера',
        userId: 'user-1',
        ip: '192.168.1.101',
        status: 'active',
        type: 'ПК',
        room: '101',
        department: 'Бухгалтерия',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'WS-002',
        description: 'Рабочая станция администратора',
        userId: 'admin-1',
        ip: '192.168.1.102',
        status: 'active',
        type: 'ПК',
        room: '102',
        department: 'ИТ отдел',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'WS-003',
        description: 'Тестовая станция',
        userId: 'tech-1',
        ip: '192.168.1.103',
        status: 'inactive',
        type: 'Ноутбук',
        room: '103',
        department: 'ИТ отдел',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'WS-004',
        description: 'Станция менеджера',
        userId: 'manager-1',
        ip: '192.168.1.104',
        status: 'active',
        type: 'ПК',
        room: '104',
        department: 'ИТ отдел',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'WS-005',
        description: 'Свободная станция',
        userId: null,
        ip: '192.168.1.105',
        status: 'free',
        type: 'ПК',
        room: '105',
        department: 'ИТ отдел',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]
  })

  // System settings — нет модели в Prisma, добавить если потребуется
  console.log('Seeding finished!');
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })  