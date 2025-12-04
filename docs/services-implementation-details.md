# Детали реализации функционала "Сервисы"

## 1. Типы данных (app/types/service.ts)

```typescript
export type Service = {
  id: string;
  name: string;
  description: string | null;
  responsibleId: string;
  responsible: {
    id: string;
    name: string; // Фамилия Имя
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

export type ServiceFormValues = {
  name: string;
  description: string;
  responsibleId: string;
  backupStaffIds: string[];
};
```

## 2. API маршруты

### 2.1. GET /api/services (app/api/services/route.ts)

```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      include: {
        responsible: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            position: true,
          },
        },
        backupStaff: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    // Форматируем данные для фронтенда
    const formattedServices = services.map(service => ({
      id: service.id,
      name: service.name,
      description: service.description,
      responsibleId: service.responsibleId,
      responsible: {
        id: service.responsible.id,
        name: `${service.responsible.lastName} ${service.responsible.firstName}`,
        email: service.responsible.email,
        position: service.responsible.position,
      },
      backupStaff: service.backupStaff.map(staff => ({
        id: staff.id,
        name: `${staff.lastName} ${staff.firstName}`,
        email: staff.email,
      })),
      createdAt: service.createdAt.toISOString(),
      updatedAt: service.updatedAt.toISOString(),
    }));

    return NextResponse.json({ services: formattedServices });
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json(
      { error: "Failed to fetch services" },
      { status: 500 }
    );
  }
}
```

### 2.2. POST /api/services (app/api/services/route.ts)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Проверяем, что сервис с таким именем не существует
    const existingService = await prisma.service.findUnique({
      where: { name: body.name },
    });
    
    if (existingService) {
      return NextResponse.json(
        { error: "Сервис с таким именем уже существует" },
        { status: 400 }
      );
    }
    
    const service = await prisma.service.create({
      data: {
        name: body.name,
        description: body.description,
        responsibleId: body.responsibleId,
        backupStaff: {
          connect: body.backupStaffIds?.map((id: string) => ({ id })) || [],
        },
      },
      include: {
        responsible: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            position: true,
          },
        },
        backupStaff: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Форматируем данные для фронтенда
    const formattedService = {
      id: service.id,
      name: service.name,
      description: service.description,
      responsibleId: service.responsibleId,
      responsible: {
        id: service.responsible.id,
        name: `${service.responsible.lastName} ${service.responsible.firstName}`,
        email: service.responsible.email,
        position: service.responsible.position,
      },
      backupStaff: service.backupStaff.map(staff => ({
        id: staff.id,
        name: `${staff.lastName} ${staff.firstName}`,
        email: staff.email,
      })),
      createdAt: service.createdAt.toISOString(),
      updatedAt: service.updatedAt.toISOString(),
    };

    return NextResponse.json({ service: formattedService });
  } catch (error) {
    console.error("Error creating service:", error);
    return NextResponse.json(
      { error: "Failed to create service" },
      { status: 500 }
    );
  }
}
```

### 2.3. GET /api/services/[id] (app/api/services/[id]/route.ts)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        responsible: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            position: true,
          },
        },
        backupStaff: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    // Форматируем данные для фронтенда
    const formattedService = {
      id: service.id,
      name: service.name,
      description: service.description,
      responsibleId: service.responsibleId,
      responsible: {
        id: service.responsible.id,
        name: `${service.responsible.lastName} ${service.responsible.firstName}`,
        email: service.responsible.email,
        position: service.responsible.position,
      },
      backupStaff: service.backupStaff.map(staff => ({
        id: staff.id,
        name: `${staff.lastName} ${staff.firstName}`,
        email: staff.email,
      })),
      createdAt: service.createdAt.toISOString(),
      updatedAt: service.updatedAt.toISOString(),
    };

    return NextResponse.json({ service: formattedService });
  } catch (error) {
    console.error("Error fetching service:", error);
    return NextResponse.json(
      { error: "Failed to fetch service" },
      { status: 500 }
    );
  }
}
```

### 2.4. PUT /api/services/[id] (app/api/services/[id]/route.ts)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    // Проверяем, что сервис существует
    const existingService = await prisma.service.findUnique({
      where: { id },
    });

    if (!existingService) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    // Проверяем, что нет другого сервиса с таким же именем
    const duplicateService = await prisma.service.findFirst({
      where: {
        name: body.name,
        NOT: {
          id: id,
        },
      },
    });

    if (duplicateService) {
      return NextResponse.json(
        { error: "Сервис с таким именем уже существует" },
        { status: 400 }
      );
    }

    const service = await prisma.service.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        responsibleId: body.responsibleId,
        backupStaff: {
          set: body.backupStaffIds?.map((id: string) => ({ id })) || [],
        },
      },
      include: {
        responsible: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            position: true,
          },
        },
        backupStaff: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Форматируем данные для фронтенда
    const formattedService = {
      id: service.id,
      name: service.name,
      description: service.description,
      responsibleId: service.responsibleId,
      responsible: {
        id: service.responsible.id,
        name: `${service.responsible.lastName} ${service.responsible.firstName}`,
        email: service.responsible.email,
        position: service.responsible.position,
      },
      backupStaff: service.backupStaff.map(staff => ({
        id: staff.id,
        name: `${staff.lastName} ${staff.firstName}`,
        email: staff.email,
      })),
      createdAt: service.createdAt.toISOString(),
      updatedAt: service.updatedAt.toISOString(),
    };

    return NextResponse.json({ service: formattedService });
  } catch (error) {
    console.error("Error updating service:", error);
    return NextResponse.json(
      { error: "Failed to update service" },
      { status: 500 }
    );
  }
}
```

### 2.5. DELETE /api/services/[id] (app/api/services/[id]/route.ts)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Проверяем, что сервис существует
    const existingService = await prisma.service.findUnique({
      where: { id },
    });

    if (!existingService) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    await prisma.service.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Service deleted successfully" });
  } catch (error) {
    console.error("Error deleting service:", error);
    return NextResponse.json(
      { error: "Failed to delete service" },
      { status: 500 }
    );
  }
}
```

## 3. Компоненты интерфейса

### 3.1. ServiceForm (app/services/ServiceForm.tsx)

```tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface ServiceFormValues {
  name: string;
  description: string;
  responsibleId: string;
  backupStaffIds: string[];
}

interface User {
  id: string;
  name: string;
  email: string;
  position: string | null;
}

export default function ServiceForm({ 
  initial, 
  onSuccess, 
  onCancel 
}: { 
  initial?: Partial<ServiceFormValues> & { id?: string };
  onSuccess: () => void;
  onCancel?: () => void;
}) {
  const [form, setForm] = useState<ServiceFormValues>({
    name: initial?.name || "",
    description: initial?.description || "",
    responsibleId: initial?.responsibleId || "",
    backupStaffIds: initial?.backupStaffIds || [],
  });
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  // Загружаем список пользователей
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/users?role=TECHNICIAN,ADMIN");
        const data = await res.json();
        setUsers(data.users);
      } catch (err) {
        console.error("Failed to fetch users:", err);
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить список пользователей",
          variant: "destructive",
        });
      }
    };

    fetchUsers();
  }, [toast]);

  const handleChange = (field: keyof ServiceFormValues, value: string | string[]) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const validate = () => {
    const requiredFields: (keyof ServiceFormValues)[] = ["name", "responsibleId"];
    for (const field of requiredFields) {
      if (!form[field]) return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ 
      name: true, 
      description: true, 
      responsibleId: true, 
      backupStaffIds: true 
    });
    
    if (!validate()) {
      setError("Пожалуйста, заполните все обязательные поля");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const method = initial ? "PUT" : "POST";
      const url = initial ? `/api/services/${initial.id}` : "/api/services";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Ошибка сохранения");
      }
      
      toast({
        title: initial ? "Сервис обновлён" : "Сервис создан",
        description: form.name,
      });
      
      onSuccess();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      toast({
        title: "Ошибка",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="block text-sm mb-1 font-medium" htmlFor="name">
          Наименование <span className="text-red-500">*</span>
        </label>
        <Input
          id="name"
          value={form.name}
          onChange={e => handleChange("name", e.target.value)}
          required
          aria-required
          className={touched.name && !form.name ? "border-red-500" : ""}
        />
        {touched.name && !form.name && (
          <div className="text-red-600 text-xs mt-1">Обязательное поле</div>
        )}
      </div>

      <div>
        <label className="block text-sm mb-1 font-medium" htmlFor="description">
          Описание
        </label>
        <Textarea
          id="description"
          value={form.description}
          onChange={e => handleChange("description", e.target.value)}
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm mb-1 font-medium" htmlFor="responsibleId">
          Ответственный <span className="text-red-500">*</span>
        </label>
        <Select
          value={form.responsibleId}
          onValueChange={value => handleChange("responsibleId", value)}
        >
          <SelectTrigger className={touched.responsibleId && !form.responsibleId ? "border-red-500" : ""}>
            <SelectValue placeholder="Выберите ответственного" />
          </SelectTrigger>
          <SelectContent>
            {users.map(user => (
              <SelectItem key={user.id} value={user.id}>
                {user.name} {user.position && `(${user.position})`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {touched.responsibleId && !form.responsibleId && (
          <div className="text-red-600 text-xs mt-1">Обязательное поле</div>
        )}
      </div>

      <div>
        <label className="block text-sm mb-1 font-medium" htmlFor="backupStaffIds">
          Дублирующие сотрудники
        </label>
        <Select
          value={form.backupStaffIds[0] || ""}
          onValueChange={value => handleChange("backupStaffIds", value ? [value] : [])}
        >
          <SelectTrigger>
            <SelectValue placeholder="Выберите дублирующего сотрудника" />
          </SelectTrigger>
          <SelectContent>
            {users.map(user => (
              <SelectItem key={user.id} value={user.id}>
                {user.name} {user.position && `(${user.position})`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="text-xs text-muted-foreground mt-1">
          Выберите сотрудника, который будет дублировать ответственного
        </div>
      </div>

      {error && <div className="text-red-600 text-sm">{error}</div>}

      <div className="flex gap-2 mt-4">
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Сохранение...
            </>
          ) : (
            "Сохранить"
          )}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Отмена
          </Button>
        )}
      </div>
    </form>
  );
}
```

### 3.2. ServicesTableClient (app/services/ServicesTableClient.tsx)

```tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { Plus, RefreshCw, Edit, Trash2, Users } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { useCurrentUser } from "@/hooks/use-user-context";
import ServiceForm from "./ServiceForm";

type Service = {
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

export default function ServicesTableClient({ services: initialServices }: { services: Service[] }) {
  const [services, setServices] = useState<Service[]>(initialServices);
  const [showCreate, setShowCreate] = useState(false);
  const [editService, setEditService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { confirm, dialog } = useConfirm();
  const user = useCurrentUser();

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/services");
      const data = await res.json();
      setServices(data.services);
    } catch (error) {
      console.error("Failed to fetch services:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить список сервисов",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const ok = await confirm({
      title: "Удалить сервис?",
      description: `Вы уверены, что хотите удалить сервис "${name}"? Это действие нельзя отменить.`,
    });
    
    if (!ok) return;
    
    try {
      const res = await fetch(`/api/services/${id}`, { method: "DELETE" });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Ошибка удаления");
      }
      
      toast({ title: "Сервис удалён" });
      fetchServices();
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      toast({
        title: "Ошибка",
        description: msg,
        variant: "destructive",
      });
    }
  };

  return (
    <TooltipProvider>
      {dialog}
      
      {/* Модалка создания */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Добавить сервис</DialogTitle>
            <DialogDescription>
              Заполните информацию о новом сервисе
            </DialogDescription>
          </DialogHeader>
          <ServiceForm 
            onSuccess={() => { 
              setShowCreate(false); 
              fetchServices(); 
            }} 
            onCancel={() => setShowCreate(false)} 
          />
        </DialogContent>
      </Dialog>

      {/* Модалка редактирования */}
      <Dialog open={!!editService} onOpenChange={v => { if (!v) setEditService(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Редактировать сервис</DialogTitle>
            <DialogDescription>
              Измените информацию о сервисе
            </DialogDescription>
          </DialogHeader>
          {editService && (
            <ServiceForm 
              initial={editService} 
              onSuccess={() => { 
                setEditService(null); 
                fetchServices(); 
              }} 
              onCancel={() => setEditService(null)} 
            />
          )}
        </DialogContent>
      </Dialog>

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Сервисы</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={fetchServices}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Обновить
          </Button>
          {(user?.role === "ADMIN" || user?.role === "TECHNICIAN") && (
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Добавить сервис
            </Button>
          )}
        </div>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <span>Всего сервисов: <b>{services.length}</b></span>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">№</TableHead>
              <TableHead>Наименование</TableHead>
              <TableHead>Описание</TableHead>
              <TableHead>Ответственный</TableHead>
              <TableHead>Дублирующие</TableHead>
              <TableHead className="w-32">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map((service, index) => (
              <TableRow key={service.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell className="font-medium">{service.name}</TableCell>
                <TableCell>{service.description || "-"}</TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div className="font-medium">{service.responsible.name}</div>
                    <div className="text-muted-foreground text-xs">{service.responsible.email}</div>
                  </div>
                </TableCell>
                <TableCell>
                  {service.backupStaff.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {service.backupStaff.map(staff => (
                        <span 
                          key={staff.id} 
                          className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-muted"
                        >
                          <Users className="w-3 h-3 mr-1" />
                          {staff.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {(user?.role === "ADMIN" || user?.role === "TECHNICIAN") && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditService(service)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Редактировать</TooltipContent>
                      </Tooltip>
                    )}
                    {user?.role === "ADMIN" && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(service.id, service.name)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Удалить</TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {services.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  Нет данных о сервисах
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </TooltipProvider>
  );
}
```

### 3.3. Main Page (app/services/page.tsx)

```tsx
import { prisma } from "@/lib/prisma";
import ServicesTableClient from "./ServicesTableClient";

export default async function ServicesPage() {
  // Получаем список сервисов с включенными связями
  const services = await prisma.service.findMany({
    include: {
      responsible: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          position: true,
        },
      },
      backupStaff: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  // Форматируем данные для фронтенда
  const formattedServices = services.map(service => ({
    id: service.id,
    name: service.name,
    description: service.description,
    responsibleId: service.responsibleId,
    responsible: {
      id: service.responsible.id,
      name: `${service.responsible.lastName} ${service.responsible.firstName}`,
      email: service.responsible.email,
      position: service.responsible.position,
    },
    backupStaff: service.backupStaff.map(staff => ({
      id: staff.id,
      name: `${staff.lastName} ${staff.firstName}`,
      email: staff.email,
    })),
    createdAt: service.createdAt.toISOString(),
    updatedAt: service.updatedAt.toISOString(),
  }));

  return <ServicesTableClient services={formattedServices} />;
}
```

### 3.4. Loading Component (app/services/loading.tsx)

```tsx
import { Skeleton } from "@/components/ui/skeleton";

export default function ServicesLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-32" />
      </div>
      
      <div className="border rounded-lg p-4">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

## 4. Навигация

Добавить пункт "Сервисы" в боковое меню в компоненте `components/sidebar.tsx`:

```tsx
{
  title: "Основное",
  items: [
    { name: "Главная", href: "/", icon: Home },
    { name: "Сервисы", href: "/services", icon: Server }, // Добавить эту строку
    { name: "ИТ-ресурсы", href: "/it-resources", icon: Database },
    { name: "Рабочие станции", href: "/workstations", icon: Monitor },
  ]
}
```

## 5. План реализации

1. Создать файлы типов (app/types/service.ts)
2. Создать API маршруты (app/api/services/*)
3. Создать компоненты интерфейса (app/services/*)
4. Добавить пункт в навигацию (components/sidebar.tsx)
5. Протестировать функционал