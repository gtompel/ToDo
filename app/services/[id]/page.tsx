"use client"
import { useEffect, useState } from "react"
import Link from "next/link"

type Service = {
  id: string
  name: string
  description?: string | null
  responsible: {
    id: string
    name: string
    email: string
    position?: string | null
  } | null
  backupStaff: {
    id: string
    name: string
    email: string
  }[]
  createdAt: string
  updatedAt: string
}

export default function ServicePage({ params }: { params: { id: string } }) {
  const { id } = params
  const [service, setService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!id) {
      setError("Не указан id сервиса")
      setLoading(false)
      return
    }
    fetch(`/api/services/${id}`)
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(data => {
        setService(data.service)
        setLoading(false)
      })
      .catch(() => {
        setError("Сервис не найден")
        setLoading(false)
      })
  }, [id])

  if (loading) return <div className="max-w-2xl mx-auto mt-8 p-6 text-center">Загрузка...</div>
  if (error || !service) return <div className="max-w-2xl mx-auto mt-8 p-6 text-center text-red-500">{error || "Сервис не найден"}</div>

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-card rounded shadow">
      <div className="mb-4">
        <Link href="/services" className="inline-block text-blue-600 hover:underline text-sm mb-2">← Назад к списку</Link>
      </div>
      <h1 className="text-2xl font-bold mb-4">Сервис: {service.name}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <div className="mb-2"><b>Название:</b> {service.name}</div>
          <div className="mb-2"><b>Описание:</b> {service.description || "-"}</div>
        </div>
        <div>
          {service.responsible && (
            <div className="mb-2">
              <b>Ответственный:</b> {service.responsible.name} ({service.responsible.email})
              {service.responsible.position && <span>, {service.responsible.position}</span>}
            </div>
          )}
          {service.backupStaff.length > 0 && (
            <div className="mb-2">
              <b>Резервный персонал:</b>
              <ul className="list-disc list-inside ml-2">
                {service.backupStaff.map(staff => (
                  <li key={staff.id}>{staff.name} ({staff.email})</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      
      <div className="text-xs text-muted-foreground mt-6">
        <div>Создано: {new Date(service.createdAt).toLocaleString()}</div>
        <div>Обновлено: {new Date(service.updatedAt).toLocaleString()}</div>
      </div>
    </div>
  )
}