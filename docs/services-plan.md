# План реализации функционала "Сервисы"

## Структура данных

В базе данных уже существует модель `Service` в файле `prisma/schema.prisma`:

```prisma
model Service {
  id            String   @id @default(cuid())
  name          String   @unique
  description   String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Один ответственный (required)
  responsibleId String
  responsible   User     @relation("ServiceResponsible", fields: [responsibleId], references: [id], onDelete: Restrict)

  // Несколько резервных сотрудников (через обратное отношение backupServices в User)
  backupStaff   User[]   @relation("ServiceBackup")

  @@map("services")
}
```

## Требуемые поля

Согласно задаче, необходимо реализовать следующие поля:
- Наименование (уже есть как `name`)
- Ответственный (уже есть как `responsible`)
- Дублирующие сотрудники (уже есть как `backupStaff`)
- Описание (уже есть как `description`)

## Структура файлов

```
app/
└── services/
    ├── page.tsx
    ├── ServicesTableClient.tsx
    ├── ServiceForm.tsx
    └── loading.tsx

app/api/
└── services/
    ├── route.ts
    └── [id]/
        └── route.ts

app/types/
└── service.ts
```

## Компоненты

### Service Type Definition (app/types/service.ts)

```typescript
export type Service = {
  id: string;
  name: string;
  description: string | null;
  responsibleId: string;
  responsible: {
    id: string;
    name: string;
    email: string;
    position: string | null;
  };
  backupStaff: {
    id: string;
    name: string;
    email: string;
  }[];
  createdAt: string;
  updatedAt: string;
};
```

### API Routes

1. GET /api/services - Получение списка всех сервисов
2. POST /api/services - Создание нового сервиса
3. GET /api/services/[id] - Получение конкретного сервиса
4. PUT /api/services/[id] - Обновление сервиса
5. DELETE /api/services/[id] - Удаление сервиса

### Компоненты интерфейса

1. ServiceForm - Форма для создания/редактирования сервиса
2. ServicesTableClient - Таблица для отображения списка сервисов
3. Main Page - Основная страница со списком сервисов

### Навигация

Добавить пункт "Сервисы" в боковое меню в компоненте `components/sidebar.tsx`.

## План реализации

1. Создать файлы типов и API маршрутов
2. Создать компоненты форм и таблиц
3. Создать основную страницу
4. Добавить пункт в навигацию
5. Протестировать функционал