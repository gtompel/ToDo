"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertTriangle,
  CheckCircle,
  Users,
  Calendar,
  Download,
  RefreshCw,
} from "lucide-react"
import { ChartContainer } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts"

// Страница отчетов
export default function ReportsPage() {
  // Состояния для диапазона времени и загрузки
  const [timeRange, setTimeRange] = useState("30d")
  const [refreshing, setRefreshing] = useState(false)
  const [metrics, setMetrics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [trend, setTrend] = useState<any>(null)
  const [trendLoading, setTrendLoading] = useState(true)
  const [trendError, setTrendError] = useState("")
  const [trendPeriod, setTrendPeriod] = useState(30)

  useEffect(() => {
    setLoading(true)
    fetch("/api/reports/metrics")
      .then(r => r.json())
      .then(data => { setMetrics(data); setError("") })
      .catch(() => setError("Ошибка загрузки метрик"))
      .finally(() => setLoading(false))
  }, [refreshing])

  useEffect(() => {
    setTrendLoading(true)
    fetch(`/api/reports/trends?days=${trendPeriod}`)
      .then(r => r.json())
      .then(data => { setTrend(data); setTrendError("") })
      .catch(() => setTrendError("Ошибка загрузки трендов"))
      .finally(() => setTrendLoading(false))
  }, [trendPeriod])

// Цвета и иконки для статусов инцидентов
  const incidentStatusMeta: Record<string, { color: string; icon: any; label: string }> = {
    CLOSED: { color: "#22c55e", icon: CheckCircle, label: "Решено" },
    IN_PROGRESS: { color: "#f59e42", icon: Clock, label: "В работе" },
    OPEN: { color: "#2563eb", icon: AlertTriangle, label: "Новые" },
    RESOLVED: { color: "#06b6d4", icon: CheckCircle, label: "Решено (ожидает)" },
  }

  // Получить ФИО исполнителей по id
  const [assignees, setAssignees] = useState<any>({})
  useEffect(() => {
    if (!metrics) return
    const ids = [
      ...metrics.incidentByAssignee.map((a: any) => a.assignedToId),
      ...metrics.requestByAssignee.map((a: any) => a.assignedToId),
      ...metrics.changeByAssignee.map((a: any) => a.assignedToId),
    ].filter(Boolean)
    if (ids.length === 0) return
    fetch(`/api/users?ids=${ids.join(",")}`)
      .then(r => r.json())
      .then(data => setAssignees(data.users.reduce((acc: any, u: any) => { acc[u.id] = u; return acc }, {})))
  }, [metrics])

  // Обновить данные отчета
  const handleRefresh = async () => {
    setRefreshing(true)
    // Имитация загрузки данных
    await new Promise((resolve) => setTimeout(resolve, 500))
    setRefreshing(false)
  }

  // Экспортировать отчет
  const exportReport = () => {
    // Логика экспорта отчета
    console.log("Экспорт отчета за период:", timeRange)
  }

  // Формируем массив статусов с реальными данными (0 если нет)
  const statusOrder = [
    { key: 'CLOSED', label: 'Решено' },
    { key: 'IN_PROGRESS', label: 'В работе' },
    { key: 'OPEN', label: 'Новые' },
  ]
  const statusData = statusOrder.map(({ key, label }) => {
    const found = (metrics?.incidentStatus || []).find((s: any) => s.status === key)
    return {
      status: key,
      label,
      value: found ? found._count._all : 0,
      color: incidentStatusMeta[key]?.color || '#64748b',
      icon: incidentStatusMeta[key]?.icon || AlertTriangle,
    }
  })

  // Фиксированные категории для заявок
  const requestCategoryOrder = [
    { key: 'Доступ', label: 'Доступ' },
    { key: 'ПО', label: 'ПО' },
    { key: 'Оборудование', label: 'Оборудование' },
  ]
  const requestCategoryData = requestCategoryOrder.map(({ key, label }) => {
    const found = (metrics?.requestCategory || []).find((c: any) => c.category === key)
    return {
      category: key,
      label,
      value: found ? found._count._all : 0,
    }
  })

  // Словари русских названий статусов
  const requestStatusRu: Record<string, string> = {
    OPEN: 'Открыта',
    RESOLVED: 'Решено',
    IN_PROGRESS: 'В работе',
    CLOSED: 'Закрыта',
  }
  const changeStatusRu: Record<string, string> = {
    APPROVED: 'Утверждено',
    PENDING_APPROVAL: 'Ожидает утверждения',
    DRAFT: 'Черновик',
    IMPLEMENTED: 'Внедрено',
    REJECTED: 'Отклонено',
    IN_PROGRESS: 'В работе',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Отчеты и аналитика</h1>
          <p className="text-muted-foreground">Метрики производительности ITSM процессов</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Последние 7 дней</SelectItem>
              <SelectItem value="30d">Последние 30 дней</SelectItem>
              <SelectItem value="90d">Последние 3 месяца</SelectItem>
              <SelectItem value="1y">Последний год</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Обновить
          </Button>
          <Button variant="outline" onClick={exportReport}>
            <Download className="w-4 h-4 mr-2" />
            Экспорт
          </Button>
        </div>
      </div>

      {/* Ключевые метрики */}
      {loading ? (
        <div className="p-8 text-center text-muted-foreground">Загрузка метрик...</div>
      ) : error ? (
        <div className="p-8 text-center text-red-500">{error}</div>
      ) : metrics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Всего инцидентов</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalIncidents}</div>
              <div className="text-xs text-muted-foreground mt-1">Открытых: {metrics.openIncidents}, Закрытых: {metrics.closedIncidents}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Среднее время решения</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.avgIncidentResolution ? `${metrics.avgIncidentResolution} ч` : "-"}</div>
              <div className="text-xs text-muted-foreground mt-1">Среднее время от создания до закрытия инцидента</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">SLA (8ч)</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.slaPercent}%</div>
              <div className="text-xs text-muted-foreground mt-1">Инциденты, решённые за 8 часов</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Всего заявок</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalRequests}</div>
              <div className="text-xs text-muted-foreground mt-1">Открытых: {metrics.openRequests}, Закрытых: {metrics.closedRequests}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Детализация по статусам и категориям */}
      {metrics && (
        <div className="grid gap-6 md:grid-cols-3">
          {/* Инциденты по статусу — BarChart + список */}
          <Card>
            <CardHeader><CardTitle>Статус инцидентов</CardTitle></CardHeader>
            <CardContent>
              <BarChart width={220} height={120} data={statusData}>
                <Bar dataKey="value">
                  {statusData.map((s, idx) => (
                    <Cell key={s.status} fill={s.color} />
                  ))}
                </Bar>
              </BarChart>
              <ul className="text-xs space-y-1 mt-4">
                {statusData.map((s) => {
                  const Icon = s.icon
                  return (
                    <li key={s.status} className="flex items-center gap-2">
                      <Badge style={{ background: s.color, color: '#fff' }}><Icon className="w-3 h-3 mr-1 inline" />{s.label}</Badge>
                      <span className="ml-2 font-bold">{s.value}</span>
                    </li>
                  )
                })}
              </ul>
            </CardContent>
          </Card>
          {/* Инциденты по категории */}
          <Card>
            <CardHeader><CardTitle>Инциденты по категории</CardTitle></CardHeader>
            <CardContent>
              <ul className="text-xs space-y-1">
                {(metrics?.incidentCategory || []).map((c: any) => (
                  <li key={c.category}>{c.category || 'Без категории'}: <b>{c._count._all}</b></li>
                ))}
              </ul>
            </CardContent>
          </Card>
          {/* Заявки */}
          <Card>
            <CardHeader><CardTitle>Заявки по статусу</CardTitle></CardHeader>
            <CardContent>
              <ul className="text-xs space-y-1">
                {(metrics?.requestStatus || []).map((s: any) => (
                  <li key={s.status}>{requestStatusRu[s.status] || s.status}: <b>{s._count._all}</b></li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Заявки по категории</CardTitle></CardHeader>
            <CardContent>
              <ul className="text-xs space-y-1">
                {(metrics?.requestCategory || []).map((c: any) => (
                  <li key={c.category}>{c.category || 'Без категории'}: <b>{c._count._all}</b></li>
                ))}
              </ul>
            </CardContent>
          </Card>
          {/* Изменения */}
          <Card>
            <CardHeader><CardTitle>Изменения по статусу</CardTitle></CardHeader>
            <CardContent>
              <ul className="text-xs space-y-1">
                {(metrics?.changeStatus || []).map((s: any) => (
                  <li key={s.status}>{changeStatusRu[s.status] || s.status}: <b>{s._count._all}</b></li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Изменения по категории</CardTitle></CardHeader>
            <CardContent>
              <ul className="text-xs space-y-1">
                {(metrics?.changeCategory || []).map((c: any) => (
                  <li key={c.category}>{c.category || 'Без категории'}: <b>{c._count._all}</b></li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="incidents">Инциденты</TabsTrigger>
          <TabsTrigger value="requests">Запросы</TabsTrigger>
          <TabsTrigger value="team">Команда</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* График трендов */}
            <Card>
              <CardHeader>
                <CardTitle>Тренды по времени</CardTitle>
                <CardDescription>Динамика ключевых метрик</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-xs text-muted-foreground">Период:</span>
                  <select
                    className="border rounded px-2 py-1 text-xs"
                    value={trendPeriod}
                    onChange={e => setTrendPeriod(Number(e.target.value))}
                  >
                    <option value={7}>7 дней</option>
                    <option value={30}>30 дней</option>
                    <option value={90}>90 дней</option>
                    <option value={365}>Год</option>
                  </select>
                </div>
                {trendLoading ? (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">Загрузка графика...</div>
                ) : trendError ? (
                  <div className="h-64 flex items-center justify-center text-red-500">{trendError}</div>
                ) : trend && (
                  <>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={trend.labels.map((label: string, i: number) => ({
                        date: label,
                        incidents: trend.incidents[i],
                        requests: trend.requests[i],
                        changes: trend.changes[i],
                      }))}>
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="incidents" stroke="#2563eb" name="Инциденты" />
                        <Line type="monotone" dataKey="requests" stroke="#059669" name="Заявки" />
                        <Line type="monotone" dataKey="changes" stroke="#f59e42" name="Изменения" />
                      </LineChart>
                    </ResponsiveContainer>
                    <div className="flex gap-6 mt-2 text-xs text-muted-foreground">
                      <span>Инцидентов: <b>{trend.total.incidents}</b></span>
                      <span>Заявок: <b>{trend.total.requests}</b></span>
                      <span>Изменений: <b>{trend.total.changes}</b></span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Распределение по статусам */}
            <Card>
              <CardHeader>
                <CardTitle>Статус инцидентов</CardTitle>
                <CardDescription>Текущее распределение</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Решено</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500"
                          style={{
                            width: `${
                              ((metrics?.incidentStatus?.find(
                                (s: { status: string; _count: { _all: number } }) => s.status === 'CLOSED'
                              )?._count._all || 0) / (metrics?.totalIncidents || 1)) * 100
                            }%`
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {
                          metrics?.incidentStatus?.find((s: { status: string; _count: { _all: number } }) => s.status === 'CLOSED')?._count._all || 0
                        }
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">В работе</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500"
                          style={{
                            width: `${
                              ((metrics?.incidentStatus?.find(
                                (s: { status: string; _count: { _all: number } }) => s.status === 'IN_PROGRESS'
                              )?._count._all || 0) / (metrics?.totalIncidents || 1)) * 100
                            }%`
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {
                          metrics?.incidentStatus?.find(
                            (s: { status: string; _count: { _all: number } }) => s.status === 'IN_PROGRESS'
                          )?._count._all || 0
                        }
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Новые</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-500"
                          style={{
                            width: `${
                              ((metrics?.incidentStatus?.find(
                                (s: { status: string; _count: { _all: number } }) => s.status === 'OPEN'
                              )?._count._all || 0) / (metrics?.totalIncidents || 1)) * 100
                            }%`
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {
                          metrics?.incidentStatus?.find(
                            (s: { status: string; _count: { _all: number } }) => s.status === 'OPEN'
                          )?._count._all || 0
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* SLA метрики */}
          <Card>
            <CardHeader>
              <CardTitle>Соблюдение SLA</CardTitle>
              <CardDescription>Показатели выполнения соглашений об уровне обслуживания</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">94%</div>
                  <p className="text-sm text-muted-foreground">Инциденты в SLA</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">92%</div>
                  <p className="text-sm text-muted-foreground">Запросы в SLA</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">96%</div>
                  <p className="text-sm text-muted-foreground">Первый отклик в SLA</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incidents" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Динамика инцидентов: создано и решено */}
            <Card>
              <CardHeader>
                <CardTitle>Динамика инцидентов</CardTitle>
                <CardDescription>Создание и решение по дням</CardDescription>
              </CardHeader>
              <CardContent>
                {trendLoading ? (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">Загрузка графика...</div>
                ) : trendError ? (
                  <div className="h-64 flex items-center justify-center text-red-500">{trendError}</div>
                ) : trend && (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={trend.labels.map((label: string, i: number) => ({
                      date: label,
                      created: trend.incidentsCreated[i],
                      closed: trend.incidentsClosed[i],
                    }))}>
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="created" stroke="#2563eb" name="Создано" />
                      <Line type="monotone" dataKey="closed" stroke="#22c55e" name="Решено" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
            {/* Распределение по статусам */}
            <Card>
              <CardHeader><CardTitle>Статус инцидентов</CardTitle></CardHeader>
              <CardContent>
                <BarChart width={220} height={120} data={(metrics?.incidentStatus || []).map((s: any) => ({
                  name: incidentStatusMeta[s.status]?.label || s.status || 'Без статуса',
                  value: s._count._all,
                  color: incidentStatusMeta[s.status]?.color || '#64748b',
                }))}>
                  <Bar dataKey="value">
                    {(metrics?.incidentStatus || []).map((s: any, idx: number) => (
                      <Cell key={s.status} fill={incidentStatusMeta[s.status]?.color || '#64748b'} />
                    ))}
                  </Bar>
                </BarChart>
                <ul className="text-xs space-y-1 mt-4">
                  {(metrics?.incidentStatus || []).map((s: any) => {
                    const meta = incidentStatusMeta[s.status] || { color: '#64748b', icon: AlertTriangle, label: s.status || 'Без статуса' }
                    const Icon = meta.icon
                    return (
                      <li key={s.status} className="flex items-center gap-2">
                        <Badge style={{ background: meta.color, color: '#fff' }}><Icon className="w-3 h-3 mr-1 inline" />{meta.label}</Badge>
                        <span className="ml-2 font-bold">{s._count._all}</span>
                      </li>
                    )
                  })}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Столбчатая диаграмма по категориям запросов */}
            <Card>
              <CardHeader><CardTitle>Статистика по категориям запросов</CardTitle></CardHeader>
              <CardContent>
                <BarChart width={320} height={180} data={requestCategoryData}>
                  <Bar dataKey="value" fill="#2563eb">
                    {requestCategoryData.map((c, idx) => (
                      <Cell key={c.category} fill={["#2563eb", "#f59e42", "#22c55e"][idx % 3]} />
                    ))}
                  </Bar>
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                </BarChart>
                <ul className="text-xs space-y-1 mt-4">
                  {requestCategoryData.map((c) => (
                    <li key={c.category}>{c.label}: <b>{c.value}</b></li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            {/* Вкладка "Запросы" */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Всего запросов</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.totalRequests || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Выполнено</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {
                    metrics?.requestStatus?.find((s: { status: string; _count: { _all: number } }) => s.status === 'COMPLETED')?._count._all || 0
                  }
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Среднее время</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.avgRequestCompletionTime || "-"}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">SLA соблюдение</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{metrics?.slaCompliancePercent || 0}%</div>
              </CardContent>
            </Card>
          </div>

          {/* График выполнения запросов */}
          <Card>
            <CardHeader>
              <CardTitle>Выполнение запросов по типам</CardTitle>
              <CardDescription>Статистика по категориям запросов</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Столбчатая диаграмма</p>
                  <p className="text-xs text-muted-foreground">Доступ, ПО, Оборудование</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* BarChart по исполнителям */}
            <Card>
              <CardHeader><CardTitle>Топ исполнителей (инциденты)</CardTitle></CardHeader>
              <CardContent>
                <BarChart width={320} height={180} data={(metrics?.incidentByAssignee || []).map((a: any) => ({
                  name: assignees[a.assignedToId]?.name || a.assignedToId || '—',
                  value: a._count._all,
                }))}>
                  <Bar dataKey="value" fill="#2563eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                </BarChart>
                <ul className="text-xs space-y-1 mt-4">
                  {(metrics?.incidentByAssignee || []).map((a: any) => (
                    <li key={a.assignedToId} className="flex items-center gap-2">
                      <span className="font-bold">{assignees[a.assignedToId]?.name || a.assignedToId || '—'}</span>
                      <span className="ml-2">{a._count._all}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            {/* Аналогично для заявок и изменений ... */}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
