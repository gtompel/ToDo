"use client"
import { use, useEffect, useState } from "react"
import Link from "next/link"

export default function WorkstationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [workstation, setWorkstation] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!id) {
      setError("Не указан id станции")
      setLoading(false)
      return
    }
    fetch(`/api/workstations/${id}`)
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(data => {
        setWorkstation(data.workstation)
        setLoading(false)
      })
      .catch(() => {
        setError("Станция не найдена")
        setLoading(false)
      })
  }, [id])

  if (loading) return <div className="max-w-xl mx-auto mt-8 p-6 text-center">Загрузка...</div>
  if (error || !workstation) return <div className="max-w-xl mx-auto mt-8 p-6 text-center text-red-500">{error || "Станция не найдена"}</div>

  return (
    <div className="max-w-xl mx-auto mt-8 p-6 bg-card rounded shadow">
      <div className="mb-4">
        <Link href="/workstations" className="inline-block text-blue-600 hover:underline text-sm mb-2">← Назад к списку</Link>
      </div>
      <h1 className="text-2xl font-bold mb-4">Рабочая станция: {workstation.name}</h1>
      <div className="mb-2"><b>Описание:</b> {workstation.description}</div>
      <div className="mb-2"><b>Пользователь:</b> {workstation.user ? `${workstation.user.firstName} ${workstation.user.lastName}` : "-"}</div>
      <div className="mb-2"><b>IP:</b> {workstation.ip || "-"}</div>
      <div className="mb-2"><b>Статус:</b> {workstation.status}</div>
      <div className="mb-2 text-xs text-muted-foreground">Создано: {new Date(workstation.createdAt).toLocaleString()}</div>
      <div className="mb-2 text-xs text-muted-foreground">Обновлено: {new Date(workstation.updatedAt).toLocaleString()}</div>
    </div>
  )
} 