"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, RefreshCw, Info, Edit, Trash2 } from "lucide-react"
import ITResourceForm from "./ITResourceForm"
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { useToast } from "@/components/ui/use-toast"
import { useConfirm } from "@/components/ui/confirm-dialog"
import { useCurrentUser } from "@/hooks/use-user-context"

export default function ITResourcesTable({ resources: initialResources }: { resources: any[] }) {
  const [resources, setResources] = useState(initialResources)
  const [showCreate, setShowCreate] = useState(false)
  const [editResource, setEditResource] = useState<any>(null)
  const [viewResource, setViewResource] = useState<any>(null) // новое состояние для просмотра
  const { toast } = useToast()
  const { confirm, dialog } = useConfirm()
  const user = useCurrentUser();

  const fetchResources = async () => {
    const res = await fetch("/api/it-resources")
    const data = await res.json()
    setResources(data.resources)
  }

  const handleDelete = async (id: string) => {
    const ok = await confirm({ title: "Удалить ресурс?" })
    if (!ok) return
    try {
      await fetch(`/api/it-resources/${id}`, { method: "DELETE" })
      toast({ title: "Ресурс удалён" })
      fetchResources()
    } catch (e: any) {
      toast({ title: "Ошибка", description: e.message, variant: "destructive" })
    }
  }

  return (
    <TooltipProvider>
      {dialog}
      {/* Модалка редактирования */}
      <Dialog open={!!editResource} onOpenChange={v => { if (!v) setEditResource(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать ИТ-ресурс</DialogTitle>
            <DialogDescription>Измените необходимые поля и сохраните изменения.</DialogDescription>
          </DialogHeader>
          {editResource && (
            <ITResourceForm initial={editResource} onSuccess={() => { setEditResource(null); fetchResources() }} onCancel={() => setEditResource(null)} />
          )}
        </DialogContent>
      </Dialog>
      {/* Модалка просмотра подробной информации */}
      <Dialog open={!!viewResource} onOpenChange={v => { if (!v) setViewResource(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Информация об ИТ-ресурсе</DialogTitle>
            <DialogDescription />
          </DialogHeader>
          {viewResource && (
            <div className="space-y-2 text-sm">
              <div><b>Название:</b> {viewResource.name}</div>
              <div><b>Описание:</b> {viewResource.description}</div>
              <div><b>Владелец:</b> {viewResource.owner}</div>
              <div><b>Источник:</b> <a href={viewResource.source} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">{viewResource.source}</a></div>
              <div><b>Роли:</b> {viewResource.roles && viewResource.roles.length > 0 ? viewResource.roles.map((role: string) => <span key={role} className="inline-block border rounded px-2 py-0.5 mr-1 text-xs bg-gray-100">{role}</span>) : <span>-</span>}</div>
              <div><b>Примечание:</b> {viewResource.note || <span>-</span>}</div>
              <div className="text-xs text-muted-foreground pt-2">
                <div><b>Создано:</b> {viewResource.createdAt ? new Date(viewResource.createdAt).toLocaleString('ru-RU') : '-'}</div>
                <div><b>Обновлено:</b> {viewResource.updatedAt ? new Date(viewResource.updatedAt).toLocaleString('ru-RU') : '-'}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Модалка создания ресурса */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить ИТ-ресурс</DialogTitle>
            <DialogDescription>Заполните все обязательные поля для добавления нового ресурса.</DialogDescription>
          </DialogHeader>
          <ITResourceForm onSuccess={() => { setShowCreate(false); fetchResources() }} onCancel={() => setShowCreate(false)} />
        </DialogContent>
      </Dialog>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">ИТ-ресурсы</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.location.reload()}><RefreshCw className="w-4 h-4 mr-2" />Обновить</Button>
          {(user?.role === "ADMIN" || user?.role === "TECHNICIAN") && (
            <Button onClick={() => setShowCreate(true)}><Plus className="w-4 h-4 mr-2" />Добавить ресурс</Button>
          )}
          {user?.role === "ADMIN" && (
            <Button variant="outline" onClick={() => {
              const rows = resources.map(r => [r.name, r.description, r.owner, r.source, (r.roles||[]).join(','), r.note||''])
              const header = ['Название','Описание','Владелец','Источник','Роли','Примечание']
              const content = [header, ...rows].map(line => line.join('\t')).join('\n')
              const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = 'it-resources.odt'
              a.click()
              URL.revokeObjectURL(url)
            }}>Выгрузить .odt</Button>
          )}
        </div>
      </div>
      <div className="mb-4 flex items-center gap-2">
        <span>Всего ресурсов: <b>{resources.length}</b></span>
      </div>
      <Card className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-3 py-2 text-left">№</th>
              <th className="px-3 py-2 text-left">Название</th>
              <th className="px-3 py-2 text-left">Описание</th>
              <th className="px-3 py-2 text-left">Владелец</th>
              <th className="px-3 py-2 text-left">Источник</th>
              <th className="px-3 py-2 text-left">Роли</th>
              <th className="px-3 py-2 text-left">Примечание</th>
              <th className="px-3 py-2 text-left">Действия</th>
            </tr>
          </thead>
          <tbody>
            {resources.map((r, i) => (
              <tr key={r.id} className="even:bg-muted/50 hover:bg-muted transition-colors">
                <td className="px-4 py-2">{i + 1}</td>
                <td className="px-4 py-2 font-bold">{r.name}</td>
                <td className="px-4 py-2">{r.description}</td>
                <td className="px-4 py-2">{r.owner}</td>
                <td className="px-4 py-2"><a href={r.source} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">Ссылка</a></td>
                <td className="px-4 py-2">
                  {r.roles.map((role: string) => (
                    <span key={role} className="inline-block border rounded px-2 py-0.5 mr-1 text-xs bg-gray-100">{role}</span>
                  ))}
                </td>
                <td className="px-4 py-2">{r.note}</td>
                <td className="px-4 py-2 flex gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      {(user?.role === "ADMIN" || user?.role === "TECHNICIAN") && (
                        <button aria-label="Редактировать" className="mr-2 focus-visible:ring-2 focus-visible:ring-primary" onClick={() => setEditResource(r)}><Edit className="w-4 h-4" /></button>
                      )}
                    </TooltipTrigger>
                    <TooltipContent>Редактировать</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button aria-label="Инфо" className="mr-2 focus-visible:ring-2 focus-visible:ring-primary text-blue-600 hover:text-blue-800" onClick={() => setViewResource(r)}>
                        <Info className="w-4 h-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Подробнее</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      {user?.role === "ADMIN" && (
                        <button aria-label="Удалить" className="text-red-500 focus-visible:ring-2 focus-visible:ring-primary" onClick={() => handleDelete(r.id)}><Trash2 className="w-4 h-4" /></button>
                      )}
                    </TooltipTrigger>
                    <TooltipContent>Удалить</TooltipContent>
                  </Tooltip>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex items-center justify-between p-4">
          <span>1-{resources.length} из {resources.length} записей</span>
          <div className="flex gap-2 items-center">
            <button className="border rounded px-2 py-1" disabled>1</button>
            <span>10 / page</span>
          </div>
        </div>
      </Card>
      <footer className="text-center text-gray-400 text-xs mt-8">© 2025 Система Управления Доступом. Все права защищены.</footer>
    </TooltipProvider>
  )
} 