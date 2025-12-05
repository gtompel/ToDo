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
import { Plus, RefreshCw, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { useCurrentUser } from "@/hooks/use-user-context";
import ServiceItemForm from "./ServiceItemForm";

type ServiceItem = {
  id: string;
  code: string;
  owner: string;
  systemName: string;
  supportCode: string | null;
  supportName: string | null;
  card: string | null;
  passport: string | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function ServiceItemsTableClient({ serviceItems: initialServiceItems }: { serviceItems?: ServiceItem[] }) {
  const [serviceItems, setServiceItems] = useState<ServiceItem[]>(initialServiceItems || []);
  const [showCreate, setShowCreate] = useState(false);
  const [editServiceItem, setEditServiceItem] = useState<ServiceItem | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { confirm, dialog } = useConfirm();
  const user = useCurrentUser();

  const fetchServiceItems = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/service-items");
      const data = await res.json();
      setServiceItems(data.serviceItems);
    } catch (error) {
      console.error("Failed to fetch service items:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить список услуг",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Загружаем данные при монтировании компонента
  useEffect(() => {
    fetchServiceItems();
  }, []);

  const handleDelete = async (id: string, code: string) => {
    const ok = await confirm({
      title: "Удалить услугу?",
      description: `Вы уверены, что хотите удалить услугу с кодом "${code}"? Это действие нельзя отменить.`,
    });
    
    if (!ok) return;
    
    try {
      const res = await fetch(`/api/service-items/${id}`, { method: "DELETE" });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Ошибка удаления");
      }
      
      toast({ title: "Услуга удалена" });
      fetchServiceItems();
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
            <DialogTitle>Добавить услугу</DialogTitle>
            <DialogDescription>
              Заполните информацию о новой услуге
            </DialogDescription>
          </DialogHeader>
          <ServiceItemForm
            onSuccess={() => {
              setShowCreate(false);
              fetchServiceItems();
            }}
            onCancel={() => setShowCreate(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Модалка редактирования */}
      <Dialog open={!!editServiceItem} onOpenChange={v => { if (!v) setEditServiceItem(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Редактировать услугу</DialogTitle>
            <DialogDescription>
              Измените информацию об услуге
            </DialogDescription>
          </DialogHeader>
          {editServiceItem && (
            <ServiceItemForm
              initial={{
                ...editServiceItem,
                supportCode: editServiceItem.supportCode || "",
                supportName: editServiceItem.supportName || "",
                card: editServiceItem.card || "",
                passport: editServiceItem.passport || "",
                note: editServiceItem.note || ""
              }}
              onSuccess={() => {
                setEditServiceItem(null);
                fetchServiceItems();
              }}
              onCancel={() => setEditServiceItem(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Услуги</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchServiceItems}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Обновить
          </Button>
          {(user?.role === "ADMIN" || user?.role === "TECHNICIAN") && (
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Добавить услугу
            </Button>
          )}
        </div>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <span>Всего услуг: <b>{serviceItems?.length || 0}</b></span>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">№</TableHead>
              <TableHead>Код</TableHead>
              <TableHead>Владелец</TableHead>
              <TableHead>Наименование системы</TableHead>
              <TableHead>Код сопровождения</TableHead>
              <TableHead>Наименование сопровождения</TableHead>
              <TableHead>Карточка</TableHead>
              <TableHead>Паспорт</TableHead>
              <TableHead>Примечание</TableHead>
              <TableHead className="w-32">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {serviceItems && serviceItems.map((serviceItem, index) => (
              <TableRow key={serviceItem.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell className="font-medium">{serviceItem.code}</TableCell>
                <TableCell>{serviceItem.owner}</TableCell>
                <TableCell>{serviceItem.systemName}</TableCell>
                <TableCell>{serviceItem.supportCode || "-"}</TableCell>
                <TableCell>{serviceItem.supportName || "-"}</TableCell>
                <TableCell>{serviceItem.card || "-"}</TableCell>
                <TableCell>{serviceItem.passport || "-"}</TableCell>
                <TableCell>{serviceItem.note || "-"}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {(user?.role === "ADMIN" || user?.role === "TECHNICIAN") && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditServiceItem(serviceItem)}
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
                            onClick={() => handleDelete(serviceItem.id, serviceItem.code)}
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
            {serviceItems && serviceItems.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                  Нет данных об услугах
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </TooltipProvider>
  );
}