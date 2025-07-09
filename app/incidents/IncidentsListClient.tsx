"use client"

import { useState, useMemo } from "react"
import { ChevronDown, ChevronRight, AlertTriangle, Plus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import IncidentsAdminActions from "./IncidentsAdminActions"

function getStatusBadge(status: string) {
  switch (status) {
    case "OPEN":
      return <span className="px-2 py-1 rounded bg-red-100 text-red-700 text-xs">Открыт</span>
    case "IN_PROGRESS":
      return <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-700 text-xs">В работе</span>
    case "RESOLVED":
      return <span className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs">Решен</span>
    case "CLOSED":
      return <span className="px-2 py-1 rounded bg-gray-200 text-gray-700 text-xs">Закрыт</span>
    default:
      return <span className="px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs">{status}</span>
  }
}

function getPriorityBadge(priority: string) {
  switch (priority) {
    case "HIGH":
      return <span className="px-2 py-1 rounded bg-red-200 text-red-800 text-xs">Высокий</span>
    case "MEDIUM":
      return <span className="px-2 py-1 rounded bg-yellow-200 text-yellow-800 text-xs">Средний</span>
    case "LOW":
      return <span className="px-2 py-1 rounded bg-gray-200 text-gray-800 text-xs">Низкий</span>
    case "CRITICAL":
      return <span className="px-2 py-1 rounded bg-red-600 text-white text-xs">Критический</span>
    default:
      return <span className="px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs">{priority}</span>
  }
}

function getCardClassByStatus(status: string) {
  switch (status) {
    case "OPEN":
      return "border-red-400 bg-red-50"
    case "IN_PROGRESS":
      return "border-yellow-400 bg-yellow-50"
    case "RESOLVED":
      return "border-green-400 bg-green-50"
    case "CLOSED":
      return "border-gray-300 bg-gray-50"
    default:
      return "border-gray-200 bg-white"
  }
}

export default function IncidentsListClient({ incidents, isAdmin, assignableUsers }: {
  incidents: any[],
  isAdmin: boolean,
  assignableUsers: Array<{id: string, name: string}>
}) {
  const [open, setOpen] = useState<string[]>([])
  const [filter, setFilter] = useState({ category: "", lastName: "" })

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
    return incidents.filter((i: any) => {
      const lastName = (i.createdBy?.lastName || "") + " " + (i.assignedTo?.lastName || "")
      return (
        (!filter.category || i.category === filter.category) &&
        (!filter.lastName || lastName.toLowerCase().includes(filter.lastName.toLowerCase()))
      )
    })
  }, [incidents, filter])

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
      <IncidentsFilterPanel categories={categories} filter={filter} setFilter={setFilter} />
      <div className="space-y-4">
        {filtered.map((incident: any) => {
          const isOpen = open.includes(incident.id)
          return (
            <Card key={incident.id} className={getCardClassByStatus(incident.status) + " transition-colors duration-200"}>
              <CardHeader className="cursor-pointer select-none" onClick={() => toggle(incident.id)}>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span>{isOpen ? <ChevronDown className="inline w-4 h-4" /> : <ChevronRight className="inline w-4 h-4" />}</span>
                    {incident.title} <span className="text-xs text-gray-400 ml-2">{incident.id.slice(0, 8)}</span>
                  </CardTitle>
                  <div className="flex gap-2">
                    {getStatusBadge(incident.status)}
                    {getPriorityBadge(incident.priority)}
                  </div>
                </div>
                <CardDescription>
                  ID: {incident.id.slice(0, 8)} • Создан: {new Date(incident.createdAt).toLocaleDateString("ru-RU")}
                </CardDescription>
              </CardHeader>
              {isOpen && (
                <CardContent>
                  <div className="mb-2 text-gray-700">{incident.description}</div>
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <div>
                      <span className="font-medium">Создал:</span> {incident.createdBy?.firstName} {incident.createdBy?.lastName}
                    </div>
                    <div>
                      <span className="font-medium">Назначен:</span> {incident.assignedTo?.firstName ? `${incident.assignedTo.firstName} ${incident.assignedTo.lastName}` : "Не назначен"}
                    </div>
                  </div>
                  {isAdmin && (
                    <IncidentsAdminActions incident={incident} assignees={assignableUsers} />
                  )}
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>
    </>
  )
} 