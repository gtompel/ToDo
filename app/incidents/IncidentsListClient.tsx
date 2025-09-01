"use client"

import { useState, useMemo } from "react"
import { ChevronDown, ChevronRight, AlertTriangle, Plus, LayoutGrid, List as ListIcon, Pencil, Info } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import IncidentsAdminActions from "./IncidentsAdminActions"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

function isImage(url: string) {
  return /\.(png|jpe?g|gif|webp|svg)$/i.test(url || "")
}

function getStatusBadge(status: string) {
  switch (status) {
    case "OPEN":
      return <span className="px-2 py-1 rounded bg-red-500 text-white text-xs font-bold">Открыт</span>
    case "IN_PROGRESS":
      return <span className="px-2 py-1 rounded bg-yellow-500 text-white text-xs font-bold">В работе</span>
    case "RESOLVED":
      return <span className="px-2 py-1 rounded bg-green-500 text-white text-xs font-bold">Решен</span>
    case "CLOSED":
      return <span className="px-2 py-1 rounded bg-gray-400 text-white text-xs font-bold">Закрыт</span>
    default:
      return <span className="px-2 py-1 rounded bg-muted text-foreground text-xs">{status}</span>
  }
}

function getPriorityBadge(priority: string) {
  switch (priority) {
    case "HIGH":
      return <span className="px-2 py-1 rounded bg-orange-500 text-white text-xs font-bold">Высокий</span>
    case "MEDIUM":
      return <span className="px-2 py-1 rounded bg-yellow-300 text-yellow-900 text-xs font-bold">Средний</span>
    case "LOW":
      return <span className="px-2 py-1 rounded bg-green-100 text-green-800 text-xs font-bold">Низкий</span>
    case "CRITICAL":
      return <span className="px-2 py-1 rounded bg-red-600 text-white text-xs font-bold">Критический</span>
    default:
      return <span className="px-2 py-1 rounded bg-muted text-foreground text-xs">{priority}</span>
  }
}

function getCardClassByStatus(status: string) {
  switch (status) {
    case "OPEN":
      return "border-l-4 border-red-600 bg-red-50 dark:bg-red-950/20"
    case "IN_PROGRESS":
      return "border-l-4 border-yellow-400 bg-yellow-50 dark:bg-yellow-950/20"
    case "RESOLVED":
      return "border-l-4 border-green-500 bg-green-50 dark:bg-green-950/20"
    case "CLOSED":
      return "border-l-4 border-gray-400 bg-gray-50 dark:bg-gray-950/20"
    default:
      return "border-l-4 border-gray-200 bg-background"
  }
}

export default function IncidentsListClient({ incidents, isAdmin, assignableUsers }: {
  incidents: any[],
  isAdmin: boolean,
  assignableUsers: Array<{id: string, firstName: string, lastName: string, email: string}>
}) {
  const [open, setOpen] = useState<string[]>([])
  const [filter, setFilter] = useState({ category: "", lastName: "" })
  const [view, setView] = useState<'blocks' | 'list'>('blocks')
  const [incidentsState, setIncidentsState] = useState<any[]>(incidents)
  const [preview, setPreview] = useState<{ src: string; name?: string } | null>(null)
  const [quickEditOpen, setQuickEditOpen] = useState(false)
  const [quickEdit, setQuickEdit] = useState<{ id: string; title: string; description: string; category: string } | null>(null)
  const [infoOpen, setInfoOpen] = useState(false)
  const [infoIncident, setInfoIncident] = useState<any | null>(null)

  // Категории для фильтра
  const categories = useMemo(() => {
    const set = new Set<string>()
    incidents.forEach((i: any) => {
      if (i.category) set.add(i.category)
    })
    return Array.from(set)
  }, [incidents])

  // Фильтрация
  const filtered = useMemo(() => {
    return incidentsState.filter((i: any) => {
      const lastName = (i.createdBy?.lastName || "") + " " + (i.assignedTo?.lastName || "")
      return (
        (!filter.category || i.category === filter.category) &&
        (!filter.lastName || lastName.toLowerCase().includes(filter.lastName.toLowerCase()))
      )
    })
  }, [incidentsState, filter])

  const toggle = (id: string) => setOpen(open => open.includes(id) ? open.filter(i => i !== id) : [...open, id])

  function IncidentsFilterPanel({ categories, filter, setFilter }: any) {
    return (
      <div className="flex flex-wrap gap-4 mb-4 items-end">
        <div>
          <label className="block text-xs mb-1">Категория</label>
          <select
            className="border rounded px-2 py-1"
            value={filter.category}
            onChange={e => setFilter((f: any) => ({ ...f, category: e.target.value }))}
            onClick={e => e.stopPropagation()}
          >
            <option value="">Все</option>
            {categories.map((c: string) => (
              <option key={c} value={c}>{c}</option>
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
            onChange={e => setFilter((f: any) => ({ ...f, lastName: e.target.value }))}
            onClick={e => e.stopPropagation()}
          />
        </div>
      </div>
    )
  }

  if (filtered.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertTriangle className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Нет инцидентов</h3>
          <p className="text-gray-500 text-center mb-4">Инциденты еще не созданы. Создайте первый инцидент.</p>
          <Button asChild>
            <Link href="/incidents/new">
              <Plus className="mr-2 h-4 w-4" />
              Создать инцидент
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="flex items-center gap-2 mb-4">
        <IncidentsFilterPanel categories={categories} filter={filter} setFilter={setFilter} />
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="icon" onClick={e => { e.stopPropagation(); setView(view === 'blocks' ? 'list' : 'blocks') }} aria-label={view === 'blocks' ? 'Показать списком' : 'Показать блоками'}>
            {view === 'blocks' ? <ListIcon className="w-5 h-5" /> : <LayoutGrid className="w-5 h-5" />}
          </Button>
        </div>
      </div>
      {view === 'list' ? (
        <div className="rounded-md border bg-background overflow-hidden">
          {filtered.map((incident: any, idx) => {
            const isOpen = open.includes(incident.id)
            const cardColor = getCardClassByStatus(incident.status)
             return (
              <div key={incident.id} className={`border-b last:border-0 group flex flex-col ${cardColor}`} style={{ borderLeftWidth: 4 }}>
                <div
                  className="flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-muted transition"
                  onClick={() => toggle(incident.id)}
                  tabIndex={0}
                  role="button"
                  aria-expanded={isOpen}
                >
                  {getStatusBadge(incident.status)}
                  {getPriorityBadge(incident.priority)}
                  <span className="flex-1 font-medium truncate">{incident.title}</span>
                  <span className="text-xs text-gray-400">{incident.id.slice(0, 8)}</span>
                  <span className="text-xs text-gray-500 ml-4 whitespace-nowrap">{new Date(incident.createdAt).toLocaleDateString("ru-RU")}</span>
                    {isAdmin && (
                      <Button
                        variant="outline"
                        size="icon"
                        className="ml-2 h-7 w-7"
                        aria-label="Редактировать"
                        onClick={(e) => {
                          e.stopPropagation()
                          setQuickEdit({
                            id: incident.id,
                            title: incident.title || "",
                            description: incident.description || "",
                            category: incident.category || "",
                            // для вложений и доп. полей
                            attachments: Array.isArray(incident.attachments) ? [...incident.attachments] : [],
                            keptAttachments: Array.isArray(incident.attachments) ? [...incident.attachments] : [],
                            preActions: incident.preActions || "",
                            expectedResult: incident.expectedResult || "",
                          } as any)
                          setQuickEditOpen(true)
                        }}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    {isAdmin && (
                      <Button
                        variant="outline"
                        size="icon"
                        className="ml-1 h-7 w-7"
                        aria-label="Информация"
                        onClick={(e) => {
                          e.stopPropagation()
                          setInfoIncident(incident)
                          setInfoOpen(true)
                        }}
                      >
                        <Info className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  <ChevronDown className={isOpen ? 'rotate-180 transition' : 'transition'} />
                </div>
                <div
                  className={`transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                  style={{ background: 'rgba(243,244,246,0.5)' }}
                >
                  {isOpen && (
                    <div className="px-4 py-2 text-xs animate-fade-in">
                      <div className="mb-1 text-gray-700 whitespace-pre-wrap break-words">{incident.description}</div>
                      <div className="flex items-center justify-between text-gray-600 mb-1">
                        <div>
                          <span className="font-medium">Создал:</span> {incident.createdBy?.firstName} {incident.createdBy?.lastName}
                        </div>
                        <div>
                          <span className="font-medium">Назначен:</span> {(() => {
                            const a = incident.assignedTo
                            if (!a) return "Не назначен"
                            const name = `${a.firstName || ""} ${a.lastName || ""}`.trim()
                            return name || a.email || "Не назначен"
                          })()}
                        </div>
                      </div>
                      {/* Вложения */}
                      {Array.isArray(incident.attachments) && incident.attachments.length > 0 && (
                        <div className="mt-2 space-y-1">
                          <div className="text-xs font-medium text-gray-700">Вложения:</div>
                          <div className="flex flex-wrap gap-2">
                            {incident.attachments.map((att: string, idx: number) => (
                              <button
                                key={idx}
                                type="button"
                                className="text-xs underline text-blue-700 hover:text-blue-900"
                                onClick={() => setPreview({ src: att, name: `Файл ${idx + 1}` })}
                              >
                                {isImage(att) ? (
                                  <img src={att} alt="attachment" className="h-12 w-12 object-cover rounded border" />
                                ) : (
                                  <span>Файл {idx + 1}</span>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {isAdmin && (
                        <IncidentsAdminActions
                          incident={incident}
                          assignees={assignableUsers}
                          onUpdated={(patch) => {
                            setIncidentsState(list => list.map(i => i.id === incident.id ? { ...i, ...patch, assignedTo: patch.assignedTo ?? i.assignedTo } : i))
                          }}
                          onDeleted={() => setIncidentsState(list => list.filter(i => i.id !== incident.id))}
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="w-full cards-masonry" style={{ fontSize: 0 }}>
          {filtered.map((incident: any) => {
            const isOpen = open.includes(incident.id)
            return (
              <div
                key={incident.id}
                className={getCardClassByStatus(incident.status) + " relative card-block rounded-md border p-2 cursor-pointer hover:bg-muted transition flex flex-col min-w-[180px] max-w-[260px] w-full m-0 mr-2 mb-2 align-top"}
                onClick={() => toggle(incident.id)}
                tabIndex={0}
                role='button'
                aria-expanded={isOpen}
                style={{ display: 'inline-block', verticalAlign: 'top', fontSize: '1rem' }}
              >
                <div className="flex flex-col items-start gap-1">
                  <div className="flex gap-1">
                    {getStatusBadge(incident.status)}
                    {getPriorityBadge(incident.priority)}
                  </div>
                  <div className="font-medium truncate max-w-full text-sm">{incident.title}</div>
                  <div className="flex justify-between w-full text-xs text-gray-500">
                    <span>{incident.id.slice(0, 8)}</span>
                    <span>{new Date(incident.createdAt).toLocaleDateString("ru-RU")}</span>
                  </div>
                  {isAdmin && (
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute top-1 right-1 h-7 w-7"
                      aria-label="Редактировать"
                      onClick={(e) => {
                        e.stopPropagation()
                        setQuickEdit({
                          id: incident.id,
                          title: incident.title || "",
                          description: incident.description || "",
                          category: incident.category || "",
                          attachments: Array.isArray(incident.attachments) ? [...incident.attachments] : [],
                          keptAttachments: Array.isArray(incident.attachments) ? [...incident.attachments] : [],
                          preActions: incident.preActions || "",
                          expectedResult: incident.expectedResult || "",
                        } as any)
                        setQuickEditOpen(true)
                      }}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                  )}
                  {isAdmin && (
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute top-1 right-9 h-7 w-7"
                      aria-label="Информация"
                      onClick={(e) => {
                        e.stopPropagation()
                        setInfoIncident(incident)
                        setInfoOpen(true)
                      }}
                    >
                      <Info className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
                <div
                  className={`transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                  style={{ background: 'rgba(243,244,246,0.5)' }}
                >
                  {isOpen && (
                    <div className="mt-2 p-2 rounded animate-fade-in w-full text-xs">
                      <div className="mb-2 text-gray-700">{incident.description}</div>
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                        <div>
                          <span className="font-medium">Создал:</span> {incident.createdBy?.firstName} {incident.createdBy?.lastName}
                        </div>
                        <div>
                          <span className="font-medium">Назначен:</span> {(() => {
                            const a = incident.assignedTo
                            if (!a) return "Не назначен"
                            const name = `${a.firstName || ""} ${a.lastName || ""}`.trim()
                            return name || a.email || "Не назначен"
                          })()}
                        </div>
                      </div>
                      {/* Вложения */}
                      {Array.isArray(incident.attachments) && incident.attachments.length > 0 && (
                        <div className="mt-2 space-y-1">
                          <div className="text-xs font-medium text-gray-700">Вложения:</div>
                          <div className="flex flex-wrap gap-2">
                            {incident.attachments.map((att: string, idx: number) => (
                              <button
                                key={idx}
                                type="button"
                                className="text-xs underline text-blue-700 hover:text-blue-900"
                                onClick={() => setPreview({ src: att, name: `Файл ${idx + 1}` })}
                              >
                                {isImage(att) ? (
                                  <img src={att} alt="attachment" className="h-12 w-12 object-cover rounded border" />
                                ) : (
                                  <span>Файл {idx + 1}</span>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {isAdmin && (
                        <IncidentsAdminActions
                          incident={incident}
                          assignees={assignableUsers}
                          onUpdated={(patch) => {
                            setIncidentsState(list => list.map(i => i.id === incident.id ? { ...i, ...patch, assignedTo: patch.assignedTo ?? i.assignedTo } : i))
                          }}
                          onDeleted={() => setIncidentsState(list => list.filter(i => i.id !== incident.id))}
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
      {/* Preview dialog */}
      <Dialog open={!!preview} onOpenChange={(o) => { if (!o) setPreview(null) }}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{preview?.name || 'Вложение'}</DialogTitle>
            <DialogDescription className="sr-only">Предпросмотр вложения</DialogDescription>
          </DialogHeader>
          {preview && (
            <div className="flex items-center justify-center">
              {isImage(preview.src) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview.src} alt="attachment preview" className="max-h-[80vh] max-w-[90vw] object-contain rounded" />
              ) : (
                <div className="text-sm">
                  <a href={preview.src} target="_blank" rel="noopener noreferrer" className="underline text-blue-700">Открыть файл</a>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Быстрое редактирование (для кнопки в правом верхнем углу) */}
      <Dialog open={quickEditOpen} onOpenChange={setQuickEditOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Редактировать инцидент</DialogTitle>
            <DialogDescription className="sr-only">Форма быстрого редактирования инцидента</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs mb-1">Заголовок</label>
              <Input value={quickEdit?.title || ''} onChange={(e) => setQuickEdit(q => q ? { ...q, title: e.target.value } : q)} />
            </div>
            <div className="space-y-2">
              <label className="block text-xs mb-1">Категория</label>
              <Select value={quickEdit?.category || ''} onValueChange={(v) => setQuickEdit(q => q ? { ...q, category: v } : q)}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите категорию" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Инфраструктура">Инфраструктура</SelectItem>
                  <SelectItem value="Сеть">Сеть</SelectItem>
                  <SelectItem value="Приложения">Приложения</SelectItem>
                  <SelectItem value="Оборудование">Оборудование</SelectItem>
                  <SelectItem value="Безопасность">Безопасность</SelectItem>
                  <SelectItem value="Другое">Другое</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="block text-xs mb-1">Описание</label>
              <Textarea rows={3} value={quickEdit?.description || ''} onChange={(e) => setQuickEdit(q => q ? { ...q, description: e.target.value } : q)} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="block text-xs mb-1">Действия, предпринятые до обращения</label>
              <Textarea rows={2} value={(quickEdit as any)?.preActions || ''} onChange={(e) => setQuickEdit(q => q ? { ...q, preActions: e.target.value } : q)} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="block text-xs mb-1">Ожидаемый результат</label>
              <Textarea rows={2} value={(quickEdit as any)?.expectedResult || ''} onChange={(e) => setQuickEdit(q => q ? { ...q, expectedResult: e.target.value } : q)} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="block text-xs mb-1">Вложения</label>
              <div className="text-xs text-gray-600 mb-1">Текущие файлы (снимите галочку, чтобы удалить):</div>
              <div className="flex flex-wrap gap-2 mb-2">
                {(Array.isArray((quickEdit as any)?.attachments) ? (quickEdit as any).attachments : []).map((att: string, idx: number) => {
                  const kept = (quickEdit as any).keptAttachments?.includes(att)
                  return (
                    <label key={idx} className="flex items-center gap-1 border rounded px-2 py-1 text-xs">
                      <input
                        type="checkbox"
                        checked={kept}
                        onChange={(e) => {
                          const checked = e.currentTarget.checked
                          setQuickEdit(q => {
                            if (!q) return q as any
                            const keptList = new Set<string>((q as any).keptAttachments || [])
                            if (checked) keptList.add(att); else keptList.delete(att)
                            return { ...(q as any), keptAttachments: Array.from(keptList) }
                          })
                        }}
                      />
                      <button type="button" className="underline" onClick={() => setPreview({ src: att, name: att.split('/').pop() })}>
                        {att.split('/').pop()}
                      </button>
                    </label>
                  )
                })}
              </div>
              <input type="file" multiple onChange={(e) => {
                const files = e.target.files ? Array.from(e.target.files) : []
                setQuickEdit(q => q ? { ...q as any, newFiles: files } : q)
              }} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setQuickEditOpen(false)}>Отмена</Button>
            <Button onClick={async () => {
              if (!quickEdit) return
              try {
                const form = new FormData()
                form.append('id', quickEdit.id)
                form.append('title', quickEdit.title || '')
                form.append('description', quickEdit.description || '')
                form.append('category', quickEdit.category || '')
                form.append('preActions', (quickEdit as any).preActions || '')
                form.append('expectedResult', (quickEdit as any).expectedResult || '')
                // какие вложения оставить
                const kept = Array.isArray((quickEdit as any)?.keptAttachments) ? (quickEdit as any).keptAttachments : []
                kept.forEach((p: string) => form.append('keepAttachments', p))
                // новые файлы
                const newFiles: File[] = ((quickEdit as any).newFiles || [])
                newFiles.forEach((f: File) => form.append('attachments', f))

                const res = await fetch('/api/incidents/update', { method: 'POST', body: form })
                const data = await res.json()
                if (!res.ok || data.error) throw new Error(data.error || 'Ошибка обновления')
                setIncidentsState(list => list.map(i => i.id === quickEdit.id ? { ...i, title: quickEdit.title, description: quickEdit.description, category: quickEdit.category, preActions: (quickEdit as any).preActions, expectedResult: (quickEdit as any).expectedResult, attachments: data.incident.attachments } : i))
                setQuickEditOpen(false)
              } catch (e: any) {
                console.error(e)
              }
            }}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Инфо по инциденту */}
      <Dialog open={infoOpen} onOpenChange={setInfoOpen}>
        <DialogContent className="sm:max-w-[780px]">
          <DialogHeader>
            <DialogTitle>Информация об инциденте</DialogTitle>
            <DialogDescription className="sr-only">Подробная информация по инциденту</DialogDescription>
          </DialogHeader>
          {infoIncident && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-xs text-gray-500">ID</div>
                <div className="font-mono">{infoIncident.id}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Статус</div>
                <div>{infoIncident.status}</div>
              </div>
              <div className="md:col-span-2">
                <div className="text-xs text-gray-500">Заголовок</div>
                <div>{infoIncident.title}</div>
              </div>
              <div className="md:col-span-2">
                <div className="text-xs text-gray-500">Описание</div>
                <div className="whitespace-pre-wrap break-words">{infoIncident.description}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Категория</div>
                <div>{infoIncident.category || '-'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Приоритет</div>
                <div>{infoIncident.priority}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Создал</div>
                <div>{`${infoIncident.createdBy?.firstName || ''} ${infoIncident.createdBy?.lastName || ''}`.trim() || infoIncident.createdBy?.email}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Назначен</div>
                <div>{infoIncident.assignedTo ? `${infoIncident.assignedTo.firstName || ''} ${infoIncident.assignedTo.lastName || ''}`.trim() || infoIncident.assignedTo.email : 'Не назначен'}</div>
              </div>
              <div className="md:col-span-2">
                <div className="text-xs text-gray-500">Предпринятые действия</div>
                <div className="whitespace-pre-wrap">{infoIncident.preActions || '-'}</div>
              </div>
              <div className="md:col-span-2">
                <div className="text-xs text-gray-500">Ожидаемый результат</div>
                <div className="whitespace-pre-wrap">{infoIncident.expectedResult || '-'}</div>
              </div>
              <div className="md:col-span-2">
                <div className="text-xs text-gray-500">Вложения</div>
                <div className="flex flex-wrap gap-2">
                  {(infoIncident.attachments || []).length === 0 ? (
                    <span className="text-gray-500">Нет вложений</span>
                  ) : (
                    infoIncident.attachments.map((a: string, i: number) => (
                      <button
                        key={i}
                        type="button"
                        className="underline text-blue-700 text-xs hover:text-blue-900"
                        onClick={() => setPreview({ src: a, name: a.split('/').pop() })}
                      >
                        {a.split('/').pop()}
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
} 