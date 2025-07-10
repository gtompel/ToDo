# ITSM Project

## Описание
Веб-приложение для управления инцидентами, запросами, изменениями и пользователями на базе Next.js 15, Prisma, PostgreSQL.

## Архитектура
- **app/** — страницы и API-роуты (Next.js App Router)
- **components/** — UI-компоненты (переиспользуемые)
- **hooks/** — кастомные React-хуки
- **lib/** — бизнес-логика, Prisma, валидация
- **prisma/** — схема и миграции базы данных

## Запуск
1. Установите зависимости:
   ```bash
   npm install
   ```
2. Настройте переменные окружения в `.env` (см. пример ниже).
3. Примените миграции:
   ```bash
   npx prisma migrate dev
   ```
4. Запустите dev-сервер:
   ```bash
   npm run dev
   ```

## Переменные окружения
```
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
JWT_SECRET=your-secret-key
```

## Рекомендации по стилю кода
- Используйте camelCase для переменных и функций
- Разбивайте крупные компоненты на мелкие
- Все асинхронные операции — через try/catch
- Для валидации используйте zod
- Для fetch используйте обработку ошибок и таймауты

## Документация
- [Next.js](https://nextjs.org/docs)
- [Prisma](https://www.prisma.io/docs)
- [Zod](https://zod.dev/)

---
Если есть вопросы — пишите в issues! 