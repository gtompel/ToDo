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
  Loader2,
} from "lucide-react"
import { ChartContainer } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts"
import { Tooltip as UITooltip } from "@/components/ui/tooltip"
import useSWR from 'swr'

// Страница отчетов
export default function ReportsPage() {
  // Состояния для диапазона времени и загрузки
  const [timeRange, setTimeRange] = useState("30d")
  const [refreshing, setRefreshing] = useState(false)
  const [trendPeriod, setTrendPeriod] = useState(30)

  const fetcher = (url: string) => fetch(url).then(r => r.json())
  const { data: metrics, error: metricsError, isLoading: metricsLoading } = useSWR('/api/reports/metrics', fetcher, { revalidateOnFocus: false })
  const { data: trend, error: trendError, isLoading: trendLoading } = useSWR(`/api/reports/trends?days=${trendPeriod}`, fetcher, { revalidateOnFocus: false })

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
  const statusData = [
    {
      status: 'RESOLVED',
      label: 'Решено',
      value:
        ((metrics?.incidentStatus || []).find((s: any) => s.status === 'CLOSED')?._count._all || 0) +
        ((metrics?.incidentStatus || []).find((s: any) => s.status === 'RESOLVED')?._count._all || 0),
      color: incidentStatusMeta['CLOSED']?.color || '#64748b',
      icon: incidentStatusMeta['CLOSED']?.icon || AlertTriangle,
    },
    {
      status: 'IN_PROGRESS',
      label: 'В работе',
      value: (metrics?.incidentStatus || []).find((s: any) => s.status === 'IN_PROGRESS')?._count._all || 0,
      color: incidentStatusMeta['IN_PROGRESS']?.color || '#64748b',
      icon: incidentStatusMeta['IN_PROGRESS']?.icon || AlertTriangle,
    },
    {
      status: 'OPEN',
      label: 'Новые',
      value: (metrics?.incidentStatus || []).find((s: any) => s.status === 'OPEN')?._count._all || 0,
      color: incidentStatusMeta['OPEN']?.color || '#64748b',
      icon: incidentStatusMeta['OPEN']?.icon || AlertTriangle,
    },
  ]

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

  // Получаем только сотрудников с задачами
  const assigneesWithTasks = Object.values(assignees).filter((u: any) => {
    const openTasks = [
      metrics?.incidentByAssignee?.find((a: any) => a.assignedToId === u.id)?._count._all || 0,
      metrics?.requestByAssignee?.find((a: any) => a.assignedToId === u.id)?._count._all || 0,
      metrics?.changeByAssignee?.find((a: any) => a.assignedToId === u.id)?._count._all || 0,
    ].reduce((a, b) => a + b, 0)
    return openTasks > 0
  })

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
      {metricsLoading ? (
        <div className="p-8 text-center text-muted-foreground">Загрузка метрик...</div>
      ) : metricsError ? (
        <div className="p-8 text-center text-red-500">{metricsError}</div>
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
              <CardTitle className="text-sm font-medium">Всего запросов</CardTitle>
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
              {metricsLoading ? (
                <div className="h-64 flex items-center justify-center text-muted-foreground">Загрузка графика...</div>
              ) : metricsError ? (
                <div className="h-64 flex items-center justify-center text-red-500">{metricsError}</div>
              ) : statusData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                  <span className="text-3xl">📊</span>
                  <span className="mt-2">Нет данных по статусам</span>
                </div>
              ) : (
                <>
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
                </>
              )}
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
          {/* Запросы */}
          <Card>
            <CardHeader><CardTitle>Запросы по статусу</CardTitle></CardHeader>
            <CardContent>
              <ul className="text-xs space-y-1">
                {(metrics?.requestStatus || []).map((s: any) => (
                  <li key={s.status}>{requestStatusRu[s.status] || s.status}: <b>{s._count._all}</b></li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Запросы по категории</CardTitle></CardHeader>
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
                        <Line type="monotone" dataKey="requests" stroke="#059669" name="Запросы" />
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
                              (
                                (
                                  (metrics?.incidentStatus?.find((s: { status: string; _count: { _all: number } }) => s.status === 'CLOSED')?._count._all || 0) +
                                  (metrics?.incidentStatus?.find((s: { status: string; _count: { _all: number } }) => s.status === 'RESOLVED')?._count._all || 0)
                                ) / (metrics?.totalIncidents || 1)
                              ) * 100
                            }%`
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {
                          ((metrics?.incidentStatus?.find((s: { status: string; _count: { _all: number } }) => s.status === 'CLOSED')?._count._all || 0) +
                          (metrics?.incidentStatus?.find((s: { status: string; _count: { _all: number } }) => s.status === 'RESOLVED')?._count._all || 0))
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
          </div>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Столбчатая диаграмма по категориям запросов */}
            <Card>
              <CardHeader><CardTitle>Статистика по категориям запросов</CardTitle></CardHeader>
              <CardContent>
                {metricsLoading ? (
                  <div className="flex items-center justify-center h-40"><Loader2 className="animate-spin w-8 h-8 text-muted-foreground" aria-label="Загрузка" /></div>
                ) : requestCategoryData.every(c => c.value === 0) ? (
                  <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                    <span className="text-3xl">📊</span>
                    <span className="mt-2">Нет данных по выбранным категориям</span>
                  </div>
                ) : (
                  <>
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
                  </>
                )}
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
            {/* BarChart по загрузке сотрудников */}
            <Card>
              <CardHeader><CardTitle>Загрузка сотрудников</CardTitle></CardHeader>
              <CardContent>
                {metricsLoading ? (
                  <div className="flex items-center justify-center h-40"><Loader2 className="animate-spin w-8 h-8 text-muted-foreground" aria-label="Загрузка" /></div>
                ) : (metrics?.incidentByAssignee?.length || 0) + (metrics?.requestByAssignee?.length || 0) + (metrics?.changeByAssignee?.length || 0) === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                    <span className="text-3xl">👥</span>
                    <span className="mt-2">Нет данных по сотрудникам</span>
                  </div>
                ) : (
                  <BarChart width={340} height={200} data={Object.values(assignees).map((u: any) => {
                    const openTasks = [
                      metrics?.incidentByAssignee?.find((a: any) => a.assignedToId === u.id)?._count._all || 0,
                      metrics?.requestByAssignee?.find((a: any) => a.assignedToId === u.id)?._count._all || 0,
                      metrics?.changeByAssignee?.find((a: any) => a.assignedToId === u.id)?._count._all || 0,
                    ].reduce((a, b) => a + b, 0)
                    return {
                      name: `${u.lastName} ${u.firstName}`,
                      value: openTasks,
                    }
                  })}>
                    <Bar dataKey="value" fill="#2563eb" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                  </BarChart>
                )}
              </CardContent>
            </Card>
            {/* Таблица эффективности */}
            <Card>
              <CardHeader><CardTitle>Эффективность сотрудников</CardTitle></CardHeader>
              <CardContent>
                {metricsLoading ? (
                  <div className="flex items-center justify-center h-40"><Loader2 className="animate-spin w-8 h-8 text-muted-foreground" aria-label="Загрузка" /></div>
                ) : Object.keys(assignees).length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                    <span className="text-3xl">📋</span>
                    <span className="mt-2">Нет данных по сотрудникам</span>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b">
                          <th className="p-2 text-left">Сотрудник</th>
                          <th className="p-2 text-left">Открыто</th>
                          <th className="p-2 text-left">Решено</th>
                          <th className="p-2 text-left">Статус</th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Получаем только сотрудников с задачами */}
                        {assigneesWithTasks.map((u: any) => {
                          const openTasks = [
                            metrics?.incidentByAssignee?.find((a: any) => a.assignedToId === u.id)?._count._all || 0,
                            metrics?.requestByAssignee?.find((a: any) => a.assignedToId === u.id)?._count._all || 0,
                            metrics?.changeByAssignee?.find((a: any) => a.assignedToId === u.id)?._count._all || 0,
                          ].reduce((a, b) => a + b, 0)
                          // Решено — можно добавить аналогично, если есть такие данные
                          return (
                            <tr key={u.id} className="border-b">
                              <td className="p-2 font-medium">{u.lastName || u.firstName ? `${u.lastName || ''} ${u.firstName || ''}`.trim() : u.email || 'Без имени'}</td>
                              <td className="p-2">{openTasks}</td>
                              <td className="p-2">—</td>
                              <td className="p-2">
                                <Badge variant={u.isActive ? undefined : "outline"} className={u.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                                  {u.isActive ? "Активен" : "Неактивен"}
                                </Badge>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
