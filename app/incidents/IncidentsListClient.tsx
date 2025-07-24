"use client"

import { useState, useMemo } from "react"
import { ChevronDown, ChevronRight, AlertTriangle, Plus, LayoutGrid, List as ListIcon } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import IncidentsAdminActions from "./IncidentsAdminActions"
import { Badge } from "@/components/ui/badge"

function getStatusBadge(status: string) {
  switch (status) {
    case "OPEN":
      return <span className="px-2 py-1 rounded bg-red-600 text-white text-xs font-bold">Открыт</span>
    case "IN_PROGRESS":
      return <span className="px-2 py-1 rounded bg-yellow-400 text-white text-xs font-bold">В работе</span>
    case "RESOLVED":
      return <span className="px-2 py-1 rounded bg-green-500 text-white text-xs font-bold">Решен</span>
    case "CLOSED":
      return <span className="px-2 py-1 rounded bg-gray-400 text-white text-xs font-bold">Закрыт</span>
    default:
      return <span className="px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs">{status}</span>
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
      return <span className="px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs">{priority}</span>
  }
}

function getCardClassByStatus(status: string) {
  switch (status) {
    case "OPEN":
      return "border-l-4 border-red-600 bg-red-50"
    case "IN_PROGRESS":
      return "border-l-4 border-yellow-400 bg-yellow-50"
    case "RESOLVED":
      return "border-l-4 border-green-500 bg-green-50"
    case "CLOSED":
      return "border-l-4 border-gray-400 bg-gray-50"
    default:
      return "border-l-4 border-gray-200 bg-white"
  }
}

export default function IncidentsListClient({ incidents, isAdmin, assignableUsers }: {
  incidents: any[],
  isAdmin: boolean,
  assignableUsers: Array<{id: string, name: string}>
}) {
  const [open, setOpen] = useState<string[]>([])
  const [filter, setFilter] = useState({ category: "", lastName: "" })
  const [view, setView] = useState<'blocks' | 'list'>('blocks')

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
          <Button variant="outline" size="icon" onClick={() => setView(view === 'blocks' ? 'list' : 'blocks')} aria-label={view === 'blocks' ? 'Показать списком' : 'Показать блоками'} onClick={e => e.stopPropagation()}>
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
                  <ChevronDown className={isOpen ? 'rotate-180 transition' : 'transition'} />
                </div>
                <div
                  className={`transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                  style={{ background: 'rgba(243,244,246,0.5)' }}
                >
                  {isOpen && (
                    <div className="px-4 py-2 text-xs animate-fade-in">
                      <div className="mb-1 text-gray-700">{incident.description}</div>
                      <div className="flex items-center justify-between text-gray-600 mb-1">
                        <div>
                          <span className="font-medium">Создал:</span> {incident.createdBy?.firstName} {incident.createdBy?.lastName}
                        </div>
                        <div>
                          <span className="font-medium">Назначен:</span> {incident.assignedTo?.firstName ? `${incident.assignedTo.firstName} ${incident.assignedTo.lastName}` : "Не назначен"}
                        </div>
                      </div>
                      {isAdmin && (
                        <IncidentsAdminActions
                          incident={incident}
                          assignees={assignableUsers.map(user => {
                            const [firstName = "", lastName = ""] = user.name.split(" ");
                            return {
                              id: user.id,
                              firstName,
                              lastName,
                              email: ""
                            };
                          })}
                          onInnerClick={() => toggle(incident.id)}
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
                className={getCardClassByStatus(incident.status) + " card-block rounded-md border p-2 cursor-pointer hover:bg-muted transition flex flex-col min-w-[180px] max-w-[260px] w-full m-0 mr-2 mb-2 align-top"}
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
                          <span className="font-medium">Назначен:</span> {incident.assignedTo?.firstName ? `${incident.assignedTo.firstName} ${incident.assignedTo.lastName}` : "Не назначен"}
                        </div>
                      </div>
                      {isAdmin && (
                        <IncidentsAdminActions
                          incident={incident}
                          assignees={assignableUsers.map(user => {
                            const [firstName = "", lastName = ""] = user.name.split(" ");
                            return {
                              id: user.id,
                              firstName,
                              lastName,
                              email: ""
                            };
                          })}
                          onInnerClick={() => toggle(incident.id)}
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
    </>
  )
} 