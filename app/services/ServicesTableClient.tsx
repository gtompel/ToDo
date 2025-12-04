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
              initial={{
                ...editService,
                description: editService?.description || "",
                backupStaffIds: editService?.backupStaff.map(s => s.id) || []
              }}
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