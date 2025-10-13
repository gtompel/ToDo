// app/changes/ChangesAdminActions.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { fetchWithTimeout } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Change, UserLite } from "@/app/types/change";

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Черновик" },
  { value: "PENDING_APPROVAL", label: "Ожидание одобрения" },
  { value: "APPROVED", label: "Одобрено" },
  { value: "IN_PROGRESS", label: "В работе" },
  { value: "IMPLEMENTED", label: "Внедрено" },
  { value: "CANCELLED", label: "Отменено" },
];

const PRIORITY_OPTIONS = [
  { value: "CRITICAL", label: "Критический" },
  { value: "HIGH", label: "Высокий" },
  { value: "MEDIUM", label: "Средний" },
  { value: "LOW", label: "Низкий" },
];

type ChangesAdminActionsProps = {
  change: Change;
  assignees: UserLite[];
  editDialogOpen?: boolean;
  setEditDialogOpen?: (open: boolean) => void;
  editingChange?: Change | null;
  setEditingChange?: (change: Change | null) => void;
  deleteDialogOpen?: boolean;
  setDeleteDialogOpen?: (open: boolean) => void;
  deletingChange?: Change | null;
  setDeletingChange?: (change: Change | null) => void;
  onUpdated?: (patch: Partial<Change> & { assignedTo?: UserLite }) => void;
};

export default function ChangesAdminActions({
  change,
  assignees,
  onUpdated,
  editDialogOpen,
  setEditDialogOpen,
  editingChange,
  setEditingChange,
  deleteDialogOpen,
  setDeleteDialogOpen,
  deletingChange,
  setDeletingChange,
}: ChangesAdminActionsProps) {
  const [status, setStatus] = useState(change.status);
  const [assignee, setAssignee] = useState(change.assignedToId || "");
  const [loading, setLoading] = useState(false);
  const actionRef = useRef<HTMLInputElement>(null);
  const [priority, setPriority] = useState(change.priority);
  const [editTitle, setEditTitle] = useState(change.title || "");
  const [editDescription, setEditDescription] = useState(
    change.description || ""
  );
  const [editCategory, setEditCategory] = useState(change.category || "");

  const isEditDialogControlled = editDialogOpen !== undefined;
  const isEditOpen = isEditDialogControlled ? editDialogOpen : false;
  const setIsEditOpen = isEditDialogControlled ? setEditDialogOpen : undefined;

  useEffect(() => {
    if (editingChange && editingChange.id === change.id) {
      setEditTitle(editingChange.title || "");
      setEditDescription(editingChange.description || "");
      setEditCategory(editingChange.category || "");
      setStatus(editingChange.status);
      setPriority(editingChange.priority);
      setAssignee(editingChange.assignedToId || "");
    }
  }, [editingChange, change.id]);

  const handleAdminAction = async (
    action: "status" | "priority" | "assign",
    value?: string
  ) => {
    setLoading(true);
    try {
      let res: Response;
      let data: unknown;

      if (action === "status") {
        setStatus(value || status);
        res = await fetchWithTimeout("/api/changes/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: change.id, status: value || status }),
        });
        data = await res.json();
        if (!res.ok || (data as { error?: string }).error)
          throw new Error(
            (data as { error?: string }).error || "Ошибка смены статуса"
          );
        toast({ title: "Успешно", description: "Статус изменён" });
        onUpdated?.({ status: value || status });
      } else if (action === "priority") {
        setPriority(value || priority);
        res = await fetchWithTimeout("/api/changes/priority", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: change.id, priority: value || priority }),
        });
        data = await res.json();
        if (!res.ok || (data as { error?: string }).error)
          throw new Error(
            (data as { error?: string }).error || "Ошибка смены приоритета"
          );
        toast({ title: "Успешно", description: "Приоритет изменён" });
        onUpdated?.({ priority: value || priority });
      } else if (action === "assign") {
        setAssignee(value || assignee);
        res = await fetchWithTimeout("/api/changes/assign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: change.id, userId: value || assignee }),
        });
        data = await res.json();
        if (!res.ok || (data as { error?: string }).error)
          throw new Error(
            (data as { error?: string }).error || "Ошибка назначения"
          );
        toast({ title: "Успешно", description: "Исполнитель назначен" });
        const userId = value || assignee;
        const user = assignees.find((u) => u.id === userId);
        if (user) onUpdated?.({ assignedToId: userId, assignedTo: user });
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      toast({ title: "Ошибка", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingChange) return;

    setLoading(true);
    try {
      const res = await fetchWithTimeout("/api/changes/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deletingChange.id }),
      });
      const data = await res.json();
      if (!res.ok || (data as { error?: string }).error)
        throw new Error(
          (data as { error?: string }).error || "Ошибка удаления"
        );

      toast({ title: "Успешно", description: "Изменение удалено" });

      if (setDeleteDialogOpen) setDeleteDialogOpen(false);
      if (setDeletingChange) setDeletingChange(null);
      onUpdated?.({});
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      toast({ title: "Ошибка", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className="flex flex-wrap gap-2 items-center mt-2"
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.currentTarget as HTMLFormElement & {
          elements: Record<string, HTMLInputElement | HTMLSelectElement>;
        };
        const action = (form.elements["action"] as HTMLInputElement).value;
        if (action === "status") {
          await handleAdminAction(
            "status",
            (form.elements["status"] as HTMLSelectElement).value
          );
        } else if (action === "priority") {
          await handleAdminAction(
            "priority",
            (form.elements["priority"] as HTMLSelectElement).value
          );
        } else if (action === "assign") {
          await handleAdminAction(
            "assign",
            (form.elements["userId"] as HTMLSelectElement).value
          );
        }
      }}
    >
      {/* Смена статуса */}
      <label>
        Статус:
        <select
          name="status"
          defaultValue={status}
          className="ml-1 border rounded px-2 py-1"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>
      <input ref={actionRef} type="hidden" name="action" value="status" />
      <button
        type="submit"
        className="px-2 py-1 border rounded bg-blue-100 hover:bg-blue-200"
        disabled={loading}
        onClick={() => {
          if (actionRef.current) actionRef.current.value = "status";
        }}
      >
        {loading ? "..." : "Сменить"}
      </button>

      {/* Смена приоритета */}
      <label>
        Приоритет:
        <select
          name="priority"
          defaultValue={priority}
          className="ml-1 border rounded px-2 py-1"
        >
          {PRIORITY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>
      <button
        type="submit"
        className="px-2 py-1 border rounded bg-blue-100 hover:bg-blue-200"
        disabled={loading}
        onClick={() => {
          if (actionRef.current) actionRef.current.value = "priority";
        }}
      >
        {loading ? "..." : "Сменить"}
      </button>

      {/* Назначение исполнителя */}
      <label>
        Назначить:
        <select
          name="userId"
          defaultValue={assignee}
          className="ml-1 border rounded px-2 py-1"
        >
          <option value="">Выбрать...</option>
          {assignees.length > 0 ? (
            assignees.map((user) => (
              <option key={user.id} value={user.id}>
                {user.lastName} {user.firstName} ({user.email})
              </option>
            ))
          ) : (
            <option value="" disabled>
              Нет доступных исполнителей
            </option>
          )}
        </select>
      </label>
      <button
        type="submit"
        className="px-2 py-1 border rounded bg-green-100 hover:bg-green-200"
        disabled={loading}
        onClick={() => {
          if (actionRef.current) actionRef.current.value = "assign";
        }}
      >
        {loading ? "..." : "Назначить"}
      </button>

      {/* Диалог редактирования */}
      <Dialog
        open={isEditOpen}
        onOpenChange={(open) => {
          if (setIsEditOpen) setIsEditOpen(open);
          if (!open && setEditingChange) setEditingChange(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать изменение</DialogTitle>
            <DialogDescription>
              Внесите изменения в поля ниже и нажмите &quot;Сохранить&quot; для применения изменений.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="block text-xs mb-1">Заголовок</label>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs mb-1">Описание</label>
              <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs mb-1">Категория</label>
              <Input
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                if (setIsEditOpen) setIsEditOpen(false);
                if (setEditingChange) setEditingChange(null);
              }}
            >
              Отмена
            </Button>
            <Button
              onClick={async () => {
                try {
                  const res = await fetchWithTimeout("/api/changes/update", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      id: change.id,
                      title: editTitle,
                      description: editDescription,
                      category: editCategory,
                      status,
                      priority,
                      assignedToId: assignee || null,
                    }),
                  });
                  const data = await res.json();
                  if (!res.ok || (data as { error?: string }).error)
                    throw new Error(
                      (data as { error?: string }).error || "Ошибка обновления"
                    );
                  toast({
                    title: "Успешно",
                    description: "Изменение обновлено",
                  });
                  onUpdated?.({
                    title: editTitle,
                    description: editDescription,
                    category: editCategory,
                  });
                  if (setIsEditOpen) setIsEditOpen(false);
                  if (setEditingChange) setEditingChange(null);
                } catch (e) {
                  const message = e instanceof Error ? e.message : String(e);
                  toast({
                    title: "Ошибка",
                    description: message,
                    variant: "destructive",
                  });
                }
              }}
            >
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог подтверждения удаления */}
      <Dialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          if (setDeleteDialogOpen) setDeleteDialogOpen(open);
          if (!open && setDeletingChange) setDeletingChange(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Подтвердите удаление</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить это изменение? Действие нельзя
              отменить.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                if (setDeleteDialogOpen) setDeleteDialogOpen(false);
                if (setDeletingChange) setDeletingChange(null);
              }}
            >
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? "Удаление..." : "Удалить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  );
}