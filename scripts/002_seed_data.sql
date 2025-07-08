-- Очистка существующих данных
TRUNCATE TABLE sessions, incidents, requests, changes, articles, users RESTART IDENTITY CASCADE;

-- Вставка тестовых пользователей
INSERT INTO "users" ("id", "email", "password", "firstName", "lastName", "middleName", "phone", "position", "department", "role", "status", "isActive", "createdAt", "updatedAt") VALUES
('admin-1', 'admin@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Иван', 'Иванов', 'Иванович', '+79161234567', 'Системный администратор', 'IT отдел', 'ADMIN', 'active', true, NOW(), NOW()),
('tech-1', 'tech@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Петр', 'Петров', 'Петрович', '+79161234568', 'Техник поддержки', 'IT отдел', 'TECHNICIAN', 'active', true, NOW(), NOW()),
('manager-1', 'manager@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Анна', 'Сидорова', 'Сергеевна', '+79161234569', 'Менеджер IT', 'IT отдел', 'MANAGER', 'active', true, NOW(), NOW()),
('user-1', 'user@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Михаил', 'Козлов', 'Александрович', '+79161234570', 'Бухгалтер', 'Бухгалтерия', 'USER', 'active', true, NOW(), NOW()),
('user-2', 'test@ru.ru', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Тест', 'Тестов', 'Тестович', '+7123', 'Тестировщик', 'IT отдел', 'ADMIN', 'active', true, NOW(), NOW()),
('user-3', 'test1234@ru.ru', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Тест', 'Тестов', 'Тестович', '+7123', 'Тестировщик', 'IT отдел', 'ADMIN', 'active', true, NOW(), NOW()),
('user-4', 'test1@ru.ru', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Тест', 'Тестов', 'Тестович', '+7123', 'Тестировщик', 'IT отдел', 'ADMIN', 'active', true, NOW(), NOW()),
('user-5', 'test12@ru.ru', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Тест', 'Тестов', 'Тестович', '+7123', 'Тестировщик', 'IT отдел', 'ADMIN', 'active', true, NOW(), NOW()),
('user-6', 'test123@ru.ru', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Тест', 'Тестов', 'Тестович', '+7123', 'Тестировщик', 'IT отдел', 'ADMIN', 'active', true, NOW(), NOW()),
('user-7', 'ivanov@company.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Иван', 'Иванов', 'Иванович', '+79161234567', 'Системный администратор', 'IT отдел', 'ADMIN', 'active', true, NOW(), NOW()),
('user-8', 'Leg123@ru.ru', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Легов', 'Лег', 'Легович', '+79161234567', 'Менеджер', 'Бухгалтерия', 'USER', 'active', true, NOW(), NOW()),
('user-9', 'oleg23@rus.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Олег', 'Олег', 'Олег', '+79999999999', 'Менеджер', 'IT отдел', 'USER', 'active', true, NOW(), NOW()),
('user-10', 'petrov@company.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Петров', 'Петр', 'Петрович', '+79999999999', 'Менеджер', 'IT отдел', 'MANAGER', 'active', true, NOW(), NOW());

-- Вставка тестовых инцидентов
INSERT INTO "incidents" ("id", "title", "description", "priority", "status", "category", "assignedToId", "createdById", "createdAt", "updatedAt") VALUES
('inc-1', 'Не работает принтер в офисе', 'Принтер HP LaserJet не печатает документы', 'HIGH', 'OPEN', 'Оборудование', 'tech-1', 'user-1', NOW(), NOW()),
('inc-2', 'Медленная работа сети', 'Скорость интернета значительно снижена', 'MEDIUM', 'IN_PROGRESS', 'Сеть', 'tech-1', 'user-1', NOW(), NOW()),
('inc-3', 'Ошибка в системе учета', 'При сохранении данных возникает ошибка 500', 'CRITICAL', 'OPEN', 'ПО', 'admin-1', 'user-1', NOW(), NOW());

-- Вставка тестовых запросов
INSERT INTO "requests" ("id", "title", "description", "priority", "status", "category", "assignedToId", "createdById", "createdAt", "updatedAt") VALUES
('req-1', 'Установка нового ПО', 'Необходимо установить Adobe Photoshop', 'MEDIUM', 'OPEN', 'ПО', 'tech-1', 'user-1', NOW(), NOW()),
('req-2', 'Создание нового пользователя', 'Создать учетную запись для нового сотрудника', 'LOW', 'RESOLVED', 'Доступ', 'admin-1', 'manager-1', NOW(), NOW());

-- Вставка тестовых изменений
INSERT INTO "changes" ("id", "title", "description", "priority", "status", "category", "assignedToId", "createdById", "scheduledAt", "createdAt", "updatedAt") VALUES
('chg-1', 'Обновление операционной системы', 'Обновление Windows Server до последней версии', 'HIGH', 'PENDING_APPROVAL', 'Система', 'admin-1', 'manager-1', NOW() + INTERVAL '7 days', NOW(), NOW()),
('chg-2', 'Замена сетевого оборудования', 'Замена коммутатора в серверной', 'CRITICAL', 'APPROVED', 'Сеть', 'tech-1', 'admin-1', NOW() + INTERVAL '3 days', NOW(), NOW());

-- Вставка тестовых статей
INSERT INTO "articles" ("id", "title", "content", "category", "tags", "isPublished", "createdById", "createdAt", "updatedAt") VALUES
('art-1', 'Как сбросить пароль пользователя', 'Инструкция по сбросу пароля в Active Directory...', 'Инструкции', ARRAY['пароль', 'AD', 'пользователи'], true, 'admin-1', NOW(), NOW()),
('art-2', 'Настройка принтера HP LaserJet', 'Пошаговая инструкция по настройке принтера...', 'Оборудование', ARRAY['принтер', 'HP', 'настройка'], true, 'tech-1', NOW(), NOW()),
('art-3', 'Решение проблем с сетью', 'Диагностика и устранение сетевых проблем...', 'Сеть', ARRAY['сеть', 'диагностика', 'проблемы'], true, 'tech-1', NOW(), NOW());

-- Вставка системных настроек
INSERT INTO "system_settings" ("id", "key", "value", "type") VALUES
('set_1', 'system_name', 'ITSM System', 'string'),
('set_2', 'timezone', 'Europe/Moscow', 'string'),
('set_3', 'session_timeout', '30', 'number'),
('set_4', 'email_notifications', 'true', 'boolean');
