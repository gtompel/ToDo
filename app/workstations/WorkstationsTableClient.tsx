"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, RefreshCw, Edit, Trash2, Info } from "lucide-react"
import WorkstationForm from "./WorkstationForm"
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { useConfirm } from "@/components/ui/confirm-dialog"
// import Link from "next/link"
import { useCurrentUser } from "@/hooks/use-user-context"

type Workstation = {
  id: string;
  name: string;
  ip?: string;
  type?: string;
  user?: { firstName: string; lastName: string } | null;
  room?: string;
  department?: string;
  description?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
};

export default function WorkstationsTable({ workstations }: { workstations: Workstation[] }) {
  const [showCreate, setShowCreate] = useState(false)
  const [editWorkstation, setEditWorkstation] = useState<Workstation | null>(null)
  const [viewWorkstation, setViewWorkstation] = useState<Workstation | null>(null)
  const [workstationsState, setWorkstationsState] = useState<Workstation[]>(workstations)
  const { toast } = useToast()
  const { confirm, dialog } = useConfirm()
  const user = useCurrentUser();

  const fetchWorkstations = async () => {
    const res = await fetch("/api/workstations")
    const data = await res.json()
    setWorkstationsState(data.workstations)
  }

  const handleDelete = async (id: string) => {
    const ok = await confirm({ title: "Удалить рабочую станцию?" })
    if (!ok) return
    try {
      await fetch(`/api/workstations/${id}`, { method: "DELETE" })
      toast({ title: "Станция удалена" })
      fetchWorkstations()
    } catch (e: unknown) {
      toast({ title: "Ошибка", description: e instanceof Error ? e.message : String(e), variant: "destructive" })
    }
  }

  return (
    <div className="space-y-6">
      {dialog}
      {/* Просмотр подробной информации */}
      <Dialog open={!!viewWorkstation} onOpenChange={v => { if (!v) setViewWorkstation(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Информация о рабочей станции</DialogTitle>
            <DialogDescription />
          </DialogHeader>
          {viewWorkstation && (
            <div className="space-y-2 text-sm">
              <div><b>Имя компьютера:</b> {viewWorkstation.name}</div>
              <div><b>IP-адрес:</b> {viewWorkstation.ip || '-'}</div>
              <div><b>Тип:</b> {viewWorkstation.type || '-'}</div>
              <div><b>Пользователь:</b> {viewWorkstation.user ? `${viewWorkstation.user.firstName} ${viewWorkstation.user.lastName}` : '-'}</div>
              <div><b>Кабинет:</b> {viewWorkstation.room || '-'}</div>
              <div><b>Отдел:</b> {viewWorkstation.department || '-'}</div>
              <div><b>Описание:</b> {viewWorkstation.description || '-'}</div>
              <div><b>Статус:</b> {viewWorkstation.status || '-'}</div>
              <div className="text-xs text-muted-foreground pt-2">
                <div><b>Создано:</b> {viewWorkstation.createdAt ? new Date(viewWorkstation.createdAt).toLocaleString('ru-RU') : '-'}</div>
                <div><b>Обновлено:</b> {viewWorkstation.updatedAt ? new Date(viewWorkstation.updatedAt).toLocaleString('ru-RU') : '-'}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить рабочую станцию</DialogTitle>
            <DialogDescription>Заполните все обязательные поля</DialogDescription>
          </DialogHeader>
          <WorkstationForm onSuccess={() => { setShowCreate(false); fetchWorkstations() }} />
        </DialogContent>
      </Dialog>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Рабочие станции</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.location.reload()}><RefreshCw className="w-4 h-4 mr-2" />Обновить</Button>
          {(user?.role === "ADMIN" || user?.role === "TECHNICIAN") && (
            <Button onClick={() => setShowCreate(true)}><Plus className="w-4 h-4 mr-2" />Добавить станцию</Button>
          )}
          {user?.role === 'ADMIN' && (
            <Button variant="outline" onClick={() => {
              const rows = workstationsState.map(w => [w.name, w.ip||'', w.type||'', w.user ? `${w.user.firstName} ${w.user.lastName}` : '', w.room||'', w.department||''])
              const header = ['Имя компьютера','IP-адрес','Тип','Пользователь','Кабинет','Отдел']
              const content = [header, ...rows].map(line => line.join('\t')).join('\n')
              const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = 'workstations.odt'
              a.click()
              URL.revokeObjectURL(url)
            }}>Выгрузить .odt</Button>
          )}
          <Dialog open={!!editWorkstation} onOpenChange={v => { if (!v) setEditWorkstation(null) }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Редактировать рабочую станцию</DialogTitle>
                <DialogDescription>Измените необходимые поля и сохраните изменения.</DialogDescription>
              </DialogHeader>
              {editWorkstation && (
                <WorkstationForm initial={editWorkstation} onSuccess={() => { setEditWorkstation(null); fetchWorkstations() }} />
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="mb-4 flex items-center gap-2">
        <span>Всего: <b>{workstationsState.length}</b></span>
      </div>
      <Card className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-muted border-b">
              <th className="px-3 py-2 text-left font-medium text-foreground">№</th>
              <th className="px-3 py-2 text-left font-medium text-foreground">Имя компьютера</th>
              <th className="px-3 py-2 text-left font-medium text-foreground">IP-адрес</th>
              <th className="px-3 py-2 text-left font-medium text-foreground">Описание</th>
              <th className="px-3 py-2 text-left font-medium text-foreground">Пользователь</th>
              <th className="px-3 py-2 text-left font-medium text-foreground">Кабинет</th>
              <th className="px-3 py-2 text-left font-medium text-foreground">Отдел</th>
              <th className="px-3 py-2 text-left font-medium text-foreground">Действия</th>
            </tr>
          </thead>
          <tbody>
            {workstationsState.map((w, i) => (
              <tr key={w.id} className="border-b hover:bg-muted/50">
                <td className="px-3 py-2 text-foreground">{i + 1}</td>
                <td className="px-3 py-2 font-bold text-foreground">{w.name}</td>
                <td className="px-3 py-2 text-foreground">{w.ip || "-"}</td>
                <td className="px-3 py-2 text-foreground">{w.description || "-"}</td>
                <td className="px-3 py-2 text-foreground">{w.user ? `${w.user.firstName} ${w.user.lastName}` : "-"}</td>
                <td className="px-3 py-2 text-foreground">{w.room || "-"}</td>
                <td className="px-3 py-2 text-foreground">{w.department || "-"}</td>
                <td className="px-3 py-2 flex gap-2">
                  {(user?.role === "ADMIN" || user?.role === "TECHNICIAN") && (
                    <button title="Редактировать" onClick={() => setEditWorkstation(w)}><Edit className="w-4 h-4" /></button>
                  )}
                  <button title="Подробнее" onClick={() => setViewWorkstation(w)}>
                    <Info className="w-4 h-4 text-blue-600 hover:text-blue-800" />
                  </button>
                  {user?.role === "ADMIN" && (
                    <button title="Удалить" onClick={() => handleDelete(w.id)}><Trash2 className="w-4 h-4 text-red-500" /></button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
} 