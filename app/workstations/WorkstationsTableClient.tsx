"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, RefreshCw, Edit, Trash2, Info } from "lucide-react"
import WorkstationForm from "./WorkstationForm"
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogHeader } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import { useCurrentUser } from "@/hooks/use-user-context"

export default function WorkstationsTable({ workstations }: { workstations: any[] }) {
  const [showCreate, setShowCreate] = useState(false)
  const [editWorkstation, setEditWorkstation] = useState<any>(null)
  const [workstationsState, setWorkstationsState] = useState(workstations)
  const { toast } = useToast()
  const user = useCurrentUser();

  const fetchWorkstations = async () => {
    const res = await fetch("/api/workstations")
    const data = await res.json()
    setWorkstationsState(data.workstations)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить рабочую станцию?")) return
    try {
      await fetch(`/api/workstations/${id}`, { method: "DELETE" })
      toast({ title: "Станция удалена" })
      fetchWorkstations()
    } catch (e: any) {
      toast({ title: "Ошибка", description: e.message, variant: "destructive" })
    }
  }

  return (
    <div className="space-y-6">
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
            <tr className="bg-gray-50">
              <th className="px-3 py-2 text-left">№</th>
              <th className="px-3 py-2 text-left">Имя компьютера</th>
              <th className="px-3 py-2 text-left">IP-адрес</th>
              <th className="px-3 py-2 text-left">Тип</th>
              <th className="px-3 py-2 text-left">Пользователь</th>
              <th className="px-3 py-2 text-left">Кабинет</th>
              <th className="px-3 py-2 text-left">Отдел</th>
              <th className="px-3 py-2 text-left">Действия</th>
            </tr>
          </thead>
          <tbody>
            {workstationsState.map((w, i) => (
              <tr key={w.id} className="border-b">
                <td className="px-3 py-2">{i + 1}</td>
                <td className="px-3 py-2 font-bold">{w.name}</td>
                <td className="px-3 py-2">{w.ip || "-"}</td>
                <td className="px-3 py-2">{w.type || "-"}</td>
                <td className="px-3 py-2">{w.user ? `${w.user.firstName} ${w.user.lastName}` : "-"}</td>
                <td className="px-3 py-2">{w.room || "-"}</td>
                <td className="px-3 py-2">{w.department || "-"}</td>
                <td className="px-3 py-2 flex gap-2">
                  {(user?.role === "ADMIN" || user?.role === "TECHNICIAN") && (
                    <button title="Редактировать" onClick={() => setEditWorkstation(w)}><Edit className="w-4 h-4" /></button>
                  )}
                  <Link href={`/workstations/${w.id}`} title="Подробнее" prefetch={false}>
                    <Info className="w-4 h-4 text-blue-600 hover:text-blue-800" />
                  </Link>
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