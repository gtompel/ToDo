"use client";

import { useState, useMemo, useRef } from "react";
import { ChevronDown, HelpCircle, Plus, Pencil } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  renderRequestDetails,
  formatRequestId,
  STATUS_OPTIONS,
  PRIORITY_OPTIONS,
} from "./RequestsListHelpers";
import { fetchWithTimeout } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useConfirm } from "@/components/ui/confirm-dialog";

// ✅ Обновлённый тип: добавлено department
type UserLite = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department?: string;
};

export type RequestItem = {
  id: string;
  title?: string;
  description: string;
  category?: string | null;
  priority: string;
  status: string;
  createdAt: string | Date;
  assignedToId?: string | null;
  createdBy?: {
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    department?: string | null;
  } | null;
  assignedTo?: {
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    department?: string | null;
  } | null;
  acknowledgmentFile?: string | null;
};

type RequestsListClientProps = {
  requests: RequestItem[];
  isAdmin: boolean;
  assignableUsers: UserLite[];
  total: number;
  // ✅ Удалено: page — не используется
  pageSize: number;
};

function getStatusBadge(status: string) {
  switch (status) {
    case "NEW":
      return (
        <span className="px-2 py-1 rounded bg-blue-500 text-white text-xs font-bold">
          Новый
        </span>
      );
    case "IN_PROGRESS":
      return (
        <span className="px-2 py-1 rounded bg-yellow-400 text-white text-xs font-bold">
          В работе
        </span>
      );
    case "RESOLVED":
      return (
        <span className="px-2 py-1 rounded bg-green-500 text-white text-xs font-bold">
          Решен
        </span>
      );
    case "CLOSED":
      return (
        <span className="px-2 py-1 rounded bg-gray-400 text-white text-xs font-bold">
          Закрыт
        </span>
      );
    default:
      return (
        <span className="px-2 py-1 rounded bg-muted text-foreground text-xs">
          {status}
        </span>
      );
  }
}

function getPriorityBadge(priority: string) {
  switch (priority) {
    case "HIGH":
      return (
        <span className="px-2 py-1 rounded bg-orange-500 text-white text-xs font-bold">
          Высокий
        </span>
      );
    case "MEDIUM":
      return (
        <span className="px-2 py-1 rounded bg-yellow-300 text-yellow-900 text-xs font-bold">
          Средний
        </span>
      );
    case "LOW":
      return (
        <span className="px-2 py-1 rounded bg-green-100 text-green-800 text-xs font-bold">
          Низкий
        </span>
      );
    case "CRITICAL":
      return (
        <span className="px-2 py-1 rounded bg-red-600 text-white text-xs font-bold">
          Критический
        </span>
      );
    default:
      return (
        <span className="px-2 py-1 rounded bg-muted text-foreground text-xs">
          {priority}
        </span>
      );
  }
}

function getCardClassByStatus(status: string) {
  switch (status) {
    case "OPEN":
      return "border-l-4 border-blue-600 bg-blue-50 dark:bg-blue-950/20";
    case "IN_PROGRESS":
      return "border-l-4 border-yellow-400 bg-yellow-50 dark:bg-yellow-950/20";
    case "RESOLVED":
      return "border-l-4 border-green-500 bg-green-50 dark:bg-green-950/20";
    case "CLOSED":
      return "border-l-4 border-gray-400 bg-gray-50 dark:bg-gray-950/20";
    default:
      return "border-l-4 border-gray-200 bg-background";
  }
}

// Компонент для отображения и управления списком запросов
export default function RequestsListClient({
  requests,
  isAdmin,
  assignableUsers,
}: RequestsListClientProps) {
  const [open, setOpen] = useState<string[]>([]);
  const [filter, setFilter] = useState<{
    department: string;
    lastName: string;
  }>({ department: "", lastName: "" });
  const [requestsState, setRequestsState] = useState<RequestItem[]>(requests);
  const { confirm, dialog } = useConfirm();

  // Фильтрация только по текущему срезу
  const filtered = useMemo(() => {
    return requestsState.filter((r) => {
      const dep = r.createdBy?.department || r.assignedTo?.department || "";
      const lastName = (
        (r.createdBy?.lastName || "") +
        " " +
        (r.assignedTo?.lastName || "")
      ).trim();
      return (
        (!filter.department || dep === filter.department) &&
        (!filter.lastName ||
          lastName.toLowerCase().includes(filter.lastName.toLowerCase()))
      );
    });
  }, [requestsState, filter]);

  const toggle = (id: string) =>
    setOpen((open) =>
      open.includes(id) ? open.filter((i) => i !== id) : [...open, id]
    );

  // Получаем уникальные отделы
  const departments = useMemo(() => {
    const set = new Set<string>();
    requestsState.forEach((r) => {
      const dep = r.createdBy?.department || r.assignedTo?.department;
      if (dep) set.add(dep);
    });
    return Array.from(set);
  }, [requestsState]);

  function RequestsFilterPanel({
    departments,
    filter,
    setFilter,
  }: {
    departments: string[];
    filter: { department: string; lastName: string };
    setFilter: React.Dispatch<
      React.SetStateAction<{ department: string; lastName: string }>
    >;
  }) {
    return (
      <div className="flex flex-wrap gap-4 mb-4 items-end">
        <div>
          <label className="block text-xs mb-1">Отдел</label>
          <select
            className="border rounded px-2 py-1"
            value={filter.department}
            onChange={(e) =>
              setFilter((f) => ({ ...f, department: e.target.value }))
            }
          >
            <option value="">Все</option>
            {departments.map((d: string) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs mb-1">Поиск по фамилии</label>
          <input
            className="border rounded px-2 py-1"
            type="text"
            placeholder="Фамилия..."
            value={filter.lastName}
            onChange={(e) =>
              setFilter((f) => ({ ...f, lastName: e.target.value }))
            }
          />
        </div>
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <HelpCircle className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Нет запросов
          </h3>
          <p className="text-gray-500 text-center mb-4">
            Запросы еще не созданы. Создайте первый запрос.
          </p>
          <Button asChild>
            <Link href="/requests/new">
              <Plus className="mr-2 h-4 w-4" />
              Создать запрос
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Обработчик административных действий
  const handleAdminAction = async (
    action: "status" | "priority" | "assign" | "delete",
    id: string,
    value?: string
  ) => {
    let url = "";
    const body: Record<string, unknown> = { id };

    if (action === "status") {
      url = "/api/requests/status";
      body.status = value;
    } else if (action === "priority") {
      url = "/api/requests/priority";
      body.priority = value;
    } else if (action === "assign") {
      url = "/api/requests/assign";
      body.userId = value;
    } else if (action === "delete") {
      const ok = await confirm({ title: "Удалить запрос?" });
      if (!ok) return;
      url = "/api/requests/delete";
    }

    if (!url) return;

    try {
      const res = await fetchWithTimeout(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || (data as { error?: string }).error)
        throw new Error(
          (data as { error?: string }).error || "Ошибка операции"
        );

      const successDescription =
        action === "status"
          ? "Статус изменён"
          : action === "priority"
          ? "Приоритет изменён"
          : action === "assign"
          ? "Исполнитель назначен"
          : action === "delete"
          ? "Запрос удалён"
          : "Операция выполнена";

      toast({ title: "Успешно", description: successDescription });

      setRequestsState((list) => {
        if (action === "delete") return list.filter((r) => r.id !== id);
        if (action === "status")
          return list.map((r) =>
            r.id === id ? { ...r, status: String(body.status) } : r
          );
        if (action === "priority")
          return list.map((r) =>
            r.id === id ? { ...r, priority: String(body.priority) } : r
          );
        if (action === "assign")
          return list.map((r) =>
            r.id === id
              ? { ...r, assignedToId: String(body.userId), assignedTo: assignableUsers.find((u) => u.id === body.userId) || null }
              : r
          );
        return list;
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      toast({ title: "Ошибка", description: message, variant: "destructive" });
    }
  };

  type RequestCardProps = {
    request: RequestItem;
    isOpen: boolean;
    toggle: (id: string) => void;
    isAdmin: boolean;
    assignableUsers: UserLite[];
    handleAdminAction: (
      action: "status" | "priority" | "assign" | "delete",
      id: string,
      value?: string
    ) => Promise<void>;
  };

  // Компонент карточки запроса
  function RequestCard({
    request,
    isOpen,
    toggle,
    isAdmin,
    assignableUsers,
    handleAdminAction,
  }: RequestCardProps) {
    const [editOpen, setEditOpen] = useState(false);
    const [preview, setPreview] = useState<{
      src: string;
      name: string;
    } | null>(null);
    const actionRef = useRef<HTMLInputElement>(null);
    const [editTitle, setEditTitle] = useState(request.title || "");
    const [editDescription, setEditDescription] = useState(
      request.description || ""
    );
    const [editCategory, setEditCategory] = useState(request.category || "");
    const [editPriority, setEditPriority] = useState(
      request.priority || "MEDIUM"
    );
    const [editStatus, setEditStatus] = useState(request.status || "OPEN");
    const [isDescJson, setIsDescJson] = useState(false);
    const [descFields, setDescFields] = useState<
      Record<string, string | boolean>
    >({});

    const openEdit = () => {
      setEditTitle(request.title || "");
      setEditCategory(request.category || "");
      setEditPriority(request.priority || "MEDIUM");
      setEditStatus(request.status || "OPEN");
      let parsed: unknown = null;
      try {
        parsed = JSON.parse(request.description);
      } catch {}
      const isObj =
        parsed && typeof parsed === "object" && !Array.isArray(parsed);
      setIsDescJson(!!isObj);
      if (isObj) {
        setDescFields(parsed as Record<string, string | boolean>);
      } else {
        setEditDescription(request.description || "");
      }
      setEditOpen(true);
    };

    const headerColor = getCardClassByStatus(request.status);

    const isImage = (url: string) =>
      /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(url);

    let descJson: unknown = null;
    try {
      descJson = JSON.parse(request.description);
    } catch {}
    const attachmentList: string[] = [];
    if (descJson && typeof descJson === "object") {
      const d = descJson as Record<string, unknown>;
      if (Array.isArray(d.attachments))
        attachmentList.push(
          ...d.attachments.filter((x): x is string => typeof x === "string")
        );
      if (typeof d.acknowledgmentFile === "string" && d.acknowledgmentFile)
        attachmentList.push(d.acknowledgmentFile);
    }
    if (
      typeof (request as { acknowledgmentFile?: unknown })
        .acknowledgmentFile === "string" &&
      (request as { acknowledgmentFile?: string }).acknowledgmentFile
    ) {
      if (
        !attachmentList.includes(
          (request as { acknowledgmentFile: string }).acknowledgmentFile
        )
      )
        attachmentList.push(
          (request as { acknowledgmentFile: string }).acknowledgmentFile
        );
    }

    return (
      <div
        key={request.id}
        className={`border-b last:border-0 group flex flex-col ${headerColor}`}
        style={{ borderLeftWidth: 4 }}
      >
        <div className="flex items-center gap-3 px-4 py-2 transition">
          <button
            className="flex-1 flex items-center gap-3 text-left cursor-pointer hover:bg-muted/60 rounded px-1"
            onClick={() => toggle(request.id)}
            aria-expanded={isOpen}
          >
            {getStatusBadge(request.status)}
            {getPriorityBadge(request.priority)}
            <span className="flex-1 font-medium truncate">{request.title}</span>
            <span className="text-xs text-gray-400">
              {formatRequestId(request.id)}
            </span>
            <span className="text-xs text-gray-500 ml-4 whitespace-nowrap">
              {new Date(request.createdAt).toLocaleDateString("ru-RU")}
            </span>
          </button>
          {isAdmin && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="ml-2 h-7 w-7"
                aria-label="Редактировать"
                onClick={() => openEdit()}
              >
                <Pencil className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="ml-2 h-7 w-7 text-red-600 hover:bg-red-100"
                aria-label="Удалить"
                type="button"
                onClick={() => handleAdminAction("delete", request.id)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </Button>
            </>
          )}
          <button
            className="ml-1"
            onClick={() => toggle(request.id)}
            aria-label="Развернуть"
          >
            <ChevronDown
              className={isOpen ? "rotate-180 transition" : "transition"}
            />
          </button>
        </div>
        <div
          className={`transition-all duration-300 ${
            isOpen
              ? "max-h-screen overflow-auto opacity-100"
              : "max-h-0 overflow-hidden opacity-0"
          }`}
          style={{ background: "rgba(243,244,246,0.5)" }}
        >
          {isOpen && (
            <div className="px-4 py-2 text-xs animate-fade-in">
              <div className="mb-1 text-gray-700 whitespace-pre-wrap break-words">
                {renderRequestDetails(request.description)}
              </div>
              {/* Вложения */}
              {attachmentList.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="text-xs font-medium text-gray-700">
                    Вложения:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {attachmentList.map((att: string, idx: number) => (
                      <button
                        key={idx}
                        type="button"
                        className="text-xs underline text-blue-700 hover:text-blue-900"
                        onClick={() =>
                          setPreview({ src: att, name: `Файл ${idx + 1}` })
                        }
                      >
                        {isImage(att) ? (
                          <img
                            src={att}
                            alt="attachment"
                            className="h-12 w-12 object-cover rounded border"
                          />
                        ) : (
                          <span>Файл {idx + 1}</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between text-gray-600 mb-1 gap-2 flex-wrap">
                <div className="text-xs">
                  <span className="font-medium">Создал:</span>{" "}
                  {(request.createdBy?.firstName || "") +
                    " " +
                    (request.createdBy?.lastName || "") ||
                    request.createdBy?.email ||
                    "—"}
                </div>
                <div className="text-xs ml-auto max-w-[60%] text-right truncate">
                  <span className="font-medium">Назначен:</span>{" "}
                  {(() => {
                    const a = request.assignedTo;
                    if (!a) return "—";
                    const name = `${a.firstName || ""} ${
                      a.lastName || ""
                    }`.trim();
                    return name || a.email || "—";
                  })()}
                </div>
              </div>
              {isAdmin && (
                <form
                  className="flex flex-wrap gap-2 items-center mt-2"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const form = e.currentTarget as HTMLFormElement & { elements: Record<string, HTMLInputElement> };
                    const action = form.elements['action'].value;
                    try {
                      if (action === "status") {
                        const status = form.elements['status'].value;
                        await handleAdminAction("status", request.id, status);
                      } else if (action === "priority") {
                        const priority = form.elements['priority'].value;
                        await handleAdminAction("priority", request.id, priority);
                      } else if (action === "assign") {
                        const userId = form.elements['userId'].value;
                        await handleAdminAction("assign", request.id, userId);
                      } else if (action === "delete") {
                        await handleAdminAction("delete", request.id);
                      }
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
                  <input ref={actionRef} type="hidden" name="action" value="status" />
                  <label>
                    Статус:
                    <select
                      name="status"
                      defaultValue={request.status || "OPEN"}
                      className="ml-1 border rounded px-2 py-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    type="submit"
                    className="px-2 py-1 border rounded bg-blue-100 hover:bg-blue-200"
                    onClick={e => { e.stopPropagation(); if (actionRef.current) actionRef.current.value = "status"; }}
                  >
                    Сменить
                  </button>

                  <label>
                    Приоритет:
                    <select
                      name="priority"
                      defaultValue={request.priority || "MEDIUM"}
                      className="ml-1 border rounded px-2 py-1"
                      onClick={(e) => e.stopPropagation()}
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
                    onClick={e => { e.stopPropagation(); if (actionRef.current) actionRef.current.value = "priority"; }}
                  >
                    Сменить
                  </button>

                  <label>
                    Назначить:
                    <select
                      name="userId"
                      defaultValue={request.assignedToId || ""}
                      className="ml-1 border rounded px-2 py-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option value="">Выбрать...</option>
                      {assignableUsers && assignableUsers.length > 0 ? (
                        assignableUsers.map((user) => (
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
                    onClick={e => { e.stopPropagation(); if (actionRef.current) actionRef.current.value = "assign"; }}
                  >
                    Назначить
                  </button>

                  <button
                    type="submit"
                    className="px-2 py-1 border rounded bg-red-100 hover:bg-red-200 ml-2"
                    onClick={e => { e.stopPropagation(); if (actionRef.current) actionRef.current.value = "delete"; }}
                  >
                    Удалить
                  </button>
                </form>
              )}
              {/* Модалка предпросмотра вложения */}
              <Dialog
                open={!!preview}
                onOpenChange={(o) => !o && setPreview(null)}
              >
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>{preview?.name || "Вложение"}</DialogTitle>
                    <DialogDescription className="sr-only">
                      Окно предпросмотра вложенного файла
                    </DialogDescription>
                  </DialogHeader>
                  {preview && (
                    <div className="flex items-center justify-center">
                      {isImage(preview.src) ? (
                        <img
                          src={preview.src}
                          alt="attachment preview"
                          className="max-h-[80vh] max-w-[90vw] object-contain rounded"
                        />
                      ) : (
                        <div className="text-sm">
                          <a
                            href={preview.src}
                            target="_blank"
                            rel="noreferrer"
                            className="underline text-blue-700"
                          >
                            Открыть файл
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </DialogContent>
              </Dialog>

              {/* Модалка редактирования */}
              <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Редактировать запрос</DialogTitle>
                    <DialogDescription className="sr-only">
                      Форма редактирования параметров запроса
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-xs mb-1">Заголовок</label>
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs mb-1">Категория</label>
                      <Input
                        value={editCategory || ""}
                        onChange={(e) => setEditCategory(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs mb-1">Приоритет</label>
                      <Select
                        value={editPriority}
                        onValueChange={setEditPriority}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PRIORITY_OPTIONS.map((p) => (
                            <SelectItem key={p.value} value={p.value}>
                              {p.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs mb-1">Статус</label>
                      <Select value={editStatus} onValueChange={setEditStatus}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((s) => (
                            <SelectItem key={s.value} value={s.value}>
                              {s.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {!isDescJson ? (
                      <div className="space-y-2 md:col-span-2">
                        <label className="block text-xs mb-1">Описание</label>
                        <Textarea
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                        />
                      </div>
                    ) : (
                      <div className="space-y-2 md:col-span-2">
                        <label className="block text-xs mb-1">
                          Детали запроса
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {Object.entries(descFields).map(([key, val]) => {
                            const labelMap: Record<string, string> = {
                              fullName: "ФИО",
                              department: "Подразделение",
                              position: "Должность",
                              building: "Здание",
                              room: "Помещение",
                              deviceType: "Тип устройства",
                              manufacturer: "Производитель",
                              model: "Модель",
                              serialNumber: "Серийный номер",
                              monitorManufacturer: "Произв. монитора",
                              monitorModel: "Модель монитора",
                              monitorSerial: "Серийный монитора",
                              operatingSystem: "ОС",
                              additionalSoftware: "Доп. ПО",
                              flashDrive: "Флеш-носитель",
                              additionalInfo: "Доп. требования",
                              needsEMVS: "Нужен ЭМВС",
                              needsSKZI: "Нужно СКЗИ",
                              needsRosatomAccess: "Доступ Росатом",
                              acknowledgmentFile: "Файл согласования",
                            };
                            const label = labelMap[key] || key;
                            if (typeof val === "boolean") {
                              return (
                                <label
                                  key={key}
                                  className="flex items-center gap-2 text-xs"
                                >
                                  <input
                                    type="checkbox"
                                    checked={!!val}
                                    onChange={(e) =>
                                      setDescFields((f) => ({
                                        ...f,
                                        [key]: e.currentTarget.checked,
                                      }))
                                    }
                                  />
                                  {label}
                                </label>
                              );
                            }
                            if (key === "additionalInfo") {
                              return (
                                <div key={key} className="md:col-span-2">
                                  <div className="text-xs mb-1">{label}</div>
                                  <Textarea
                                    value={String(val || "")}
                                    onChange={(e) =>
                                      setDescFields((f) => ({
                                        ...f,
                                        [key]: e.target.value,
                                      }))
                                    }
                                  />
                                </div>
                              );
                            }
                            return (
                              <div key={key}>
                                <div className="text-xs mb-1">{label}</div>
                                <Input
                                  value={String(val ?? "")}
                                  onChange={(e) =>
                                    setDescFields((f) => ({
                                      ...f,
                                      [key]: e.target.value,
                                    }))
                                  }
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setEditOpen(false)}
                    >
                      Отмена
                    </Button>
                    <Button
                      onClick={async () => {
                        try {
                          const res = await fetchWithTimeout(
                            "/api/requests/update",
                            {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                id: request.id,
                                title: editTitle,
                                description: isDescJson
                                  ? JSON.stringify(descFields)
                                  : editDescription,
                                category: editCategory,
                                priority: editPriority,
                                status: editStatus,
                              }),
                            }
                          );
                          const data = await res.json();
                          if (!res.ok || (data as { error?: string }).error)
                            throw new Error(
                              (data as { error?: string }).error ||
                                "Ошибка обновления"
                            );
                          toast({
                            title: "Успешно",
                            description: "Запрос обновлён",
                          });
                          setRequestsState((list) =>
                            list.map((r) =>
                              r.id === request.id
                                ? {
                                    ...r,
                                    title: editTitle,
                                    description: isDescJson
                                      ? JSON.stringify(descFields)
                                      : editDescription,
                                    category: editCategory,
                                    priority: editPriority,
                                    status: editStatus,
                                  }
                                : r
                            )
                          );
                          setEditOpen(false);
                        } catch (e) {
                          const message =
                            e instanceof Error ? e.message : String(e);
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
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {dialog}
      <RequestsFilterPanel
        departments={departments}
        filter={filter}
        setFilter={setFilter}
      />
      <div className="space-y-4">
        {filtered.map((request) => (
          <RequestCard
            key={request.id}
            request={request}
            isOpen={open.includes(request.id)}
            toggle={toggle}
            isAdmin={isAdmin}
            assignableUsers={assignableUsers}
            handleAdminAction={handleAdminAction}
          />
        ))}
      </div>
    </>
  );
}
