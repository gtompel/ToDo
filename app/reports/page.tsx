"use client"

import { useState } from "react"
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

export default function ReportsPage() {
  const [timeRange, setTimeRange] = useState("30d")
  const [refreshing, setRefreshing] = useState(false)

  // Данные для метрик (в реальном приложении будут загружаться с сервера)
  const kpiMetrics = [
    {
      title: "Среднее время решения",
      value: "4.2ч",
      change: "-12%",
      trend: "down",
      icon: Clock,
      description: "Среднее время от создания до закрытия инцидента",
    },
    {
      title: "Первое время отклика",
      value: "18мин",
      change: "+5%",
      trend: "up",
      icon: AlertTriangle,
      description: "Время до первого ответа на инцидент",
    },
    {
      title: "Процент решения с первого раза",
      value: "78%",
      change: "+3%",
      trend: "up",
      icon: CheckCircle,
      description: "Инциденты, решенные без эскалации",
    },
    {
      title: "Удовлетворенность пользователей",
      value: "4.6/5",
      change: "+0.2",
      trend: "up",
      icon: Users,
      description: "Средняя оценка качества обслуживания",
    },
  ]

  const incidentStats = {
    total: 156,
    resolved: 134,
    inProgress: 18,
    new: 4,
    byPriority: {
      critical: 2,
      high: 8,
      medium: 12,
      low: 134,
    },
    byCategory: [
      { name: "Инфраструктура", count: 45, percentage: 29 },
      { name: "Приложения", count: 38, percentage: 24 },
      { name: "Сеть", count: 32, percentage: 21 },
      { name: "Оборудование", count: 25, percentage: 16 },
      { name: "Безопасность", count: 16, percentage: 10 },
    ],
  }

  const requestStats = {
    total: 89,
    completed: 67,
    inProgress: 15,
    pending: 7,
    avgCompletionTime: "2.1 дня",
    slaCompliance: 92,
  }

  const teamPerformance = [
    { name: "Иванов И.И.", resolved: 23, avgTime: "3.2ч", satisfaction: 4.8 },
    { name: "Петров П.П.", resolved: 19, avgTime: "4.1ч", satisfaction: 4.6 },
    { name: "Сидоров С.С.", resolved: 17, avgTime: "3.8ч", satisfaction: 4.7 },
    { name: "Волков В.В.", resolved: 15, avgTime: "5.2ч", satisfaction: 4.4 },
  ]

  const handleRefresh = async () => {
    setRefreshing(true)
    // Имитация загрузки данных
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setRefreshing(false)
  }

  const exportReport = () => {
    // Логика экспорта отчета
    console.log("Экспорт отчета за период:", timeRange)
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiMetrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="flex items-center text-xs">
                {metric.trend === "up" ? (
                  <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-500 mr-1" />
                )}
                <span className={metric.trend === "up" ? "text-green-600" : "text-red-600"}>{metric.change}</span>
                <span className="text-muted-foreground ml-1">за период</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

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
                <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">График временных рядов</p>
                    <p className="text-xs text-muted-foreground">Инциденты, запросы, время решения</p>
                  </div>
                </div>
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
                          style={{ width: `${(incidentStats.resolved / incidentStats.total) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{incidentStats.resolved}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">В работе</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500"
                          style={{ width: `${(incidentStats.inProgress / incidentStats.total) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{incidentStats.inProgress}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Новые</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-500"
                          style={{ width: `${(incidentStats.new / incidentStats.total) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{incidentStats.new}</span>
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
            {/* Распределение по приоритетам */}
            <Card>
              <CardHeader>
                <CardTitle>Распределение по приоритетам</CardTitle>
                <CardDescription>Инциденты за выбранный период</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full" />
                      <span className="text-sm">Критический</span>
                    </div>
                    <Badge variant="destructive">{incidentStats.byPriority.critical}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full" />
                      <span className="text-sm">Высокий</span>
                    </div>
                    <Badge className="bg-orange-100 text-orange-800">{incidentStats.byPriority.high}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                      <span className="text-sm">Средний</span>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">{incidentStats.byPriority.medium}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full" />
                      <span className="text-sm">Низкий</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">{incidentStats.byPriority.low}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Распределение по категориям */}
            <Card>
              <CardHeader>
                <CardTitle>Распределение по категориям</CardTitle>
                <CardDescription>Топ категории инцидентов</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {incidentStats.byCategory.map((category, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{category.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${category.percentage}%` }} />
                        </div>
                        <span className="text-sm font-medium w-8">{category.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Временная диаграмма */}
          <Card>
            <CardHeader>
              <CardTitle>Динамика инцидентов</CardTitle>
              <CardDescription>Создание и решение инцидентов по дням</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
                <div className="text-center">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Временная диаграмма</p>
                  <p className="text-xs text-muted-foreground">Создано vs Решено по дням</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Всего запросов</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{requestStats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Выполнено</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{requestStats.completed}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Среднее время</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{requestStats.avgCompletionTime}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">SLA соблюдение</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{requestStats.slaCompliance}%</div>
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
          <Card>
            <CardHeader>
              <CardTitle>Производительность команды</CardTitle>
              <CardDescription>Индивидуальные показатели сотрудников</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Сотрудник</th>
                      <th className="text-left p-2">Решено</th>
                      <th className="text-left p-2">Среднее время</th>
                      <th className="text-left p-2">Оценка</th>
                      <th className="text-left p-2">Статус</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamPerformance.map((member, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2 font-medium">{member.name}</td>
                        <td className="p-2">{member.resolved}</td>
                        <td className="p-2">{member.avgTime}</td>
                        <td className="p-2">
                          <div className="flex items-center gap-1">
                            <span>{member.satisfaction}</span>
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <div
                                  key={star}
                                  className={`w-3 h-3 ${
                                    star <= member.satisfaction ? "text-yellow-400" : "text-gray-300"
                                  }`}
                                >
                                  ★
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                        <td className="p-2">
                          <Badge variant="outline" className="bg-green-100 text-green-800">
                            Активен
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Загрузка команды */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Загрузка команды</CardTitle>
                <CardDescription>Текущие назначения</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {teamPerformance.map((member, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{member.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500"
                            style={{ width: `${Math.min((member.resolved / 25) * 100, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{Math.round((member.resolved / 25) * 100)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Эффективность</CardTitle>
                <CardDescription>Соотношение скорости и качества</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-48 flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
                  <div className="text-center">
                    <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Scatter plot</p>
                    <p className="text-xs text-muted-foreground">Время vs Качество</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
