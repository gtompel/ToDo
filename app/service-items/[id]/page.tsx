"use client"
import { useEffect, useState } from "react"
import Link from "next/link"

type ServiceItem = {
  id: string
  code: string
  owner: string
  systemName: string
  supportCode?: string | null
  supportName?: string | null
  card?: string | null
  passport?: string | null
  note?: string | null
  createdAt: string
  updatedAt: string
}

export default function ServiceItemPage({ params }: { params: { id: string } }) {
  const { id } = params
  const [serviceItem, setServiceItem] = useState<ServiceItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!id) {
      setError("Не указан id услуги")
      setLoading(false)
      return
    }
    fetch(`/api/service-items/${id}`)
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(data => {
        setServiceItem(data.serviceItem)
        setLoading(false)
      })
      .catch(() => {
        setError("Услуга не найдена")
        setLoading(false)
      })
  }, [id])

  if (loading) return <div className="max-w-2xl mx-auto mt-8 p-6 text-center">Загрузка...</div>
  if (error || !serviceItem) return <div className="max-w-2xl mx-auto mt-8 p-6 text-center text-red-500">{error || "Услуга не найдена"}</div>

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-card rounded shadow">
      <div className="mb-4">
        <Link href="/service-items" className="inline-block text-blue-600 hover:underline text-sm mb-2">← Назад к списку</Link>
      </div>
      <h1 className="text-2xl font-bold mb-4">Услуга ИТ-инфраструктуры: {serviceItem.code}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <div className="mb-2"><b>Код услуги:</b> {serviceItem.code}</div>
          <div className="mb-2"><b>Владелец:</b> {serviceItem.owner}</div>
          <div className="mb-2"><b>Системное имя:</b> {serviceItem.systemName}</div>
          <div className="mb-2"><b>Код поддержки:</b> {serviceItem.supportCode || "-"}</div>
          <div className="mb-2"><b>Имя поддержки:</b> {serviceItem.supportName || "-"}</div>
        </div>
      </div>
      
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Карточка услуги</h2>
        <div className="p-3 bg-muted rounded">
          {serviceItem.card || "Информация отсутствует"}
        </div>
      </div>
      
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Паспорт услуги</h2>
        <div className="p-3 bg-muted rounded">
          {serviceItem.passport || "Информация отсутствует"}
        </div>
      </div>
      
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Примечание</h2>
        <div className="p-3 bg-muted rounded">
          {serviceItem.note || "Информация отсутствует"}
        </div>
      </div>
      
      <div className="text-xs text-muted-foreground mt-6">
        <div>Создано: {new Date(serviceItem.createdAt).toLocaleString()}</div>
        <div>Обновлено: {new Date(serviceItem.updatedAt).toLocaleString()}</div>
      </div>
    </div>
  )
}