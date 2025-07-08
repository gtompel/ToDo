"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { ArrowLeft, Download, Filter, TrendingUp, Clock, AlertTriangle, Target } from "lucide-react"
import Link from "next/link"

export default function IncidentReportsPage() {
  const [dateRange, setDateRange] = useState<any>(null)
  const [category, setCategory] = useState("all")
  const [priority, setPriority] = useState("all")
  const [assignee, setAssignee] = useState("all")

  const detailedMetrics = {
    totalIncidents: 156,
    resolvedIncidents: 134,
    avgResolutionTime: "4.2 часа",
    firstResponseTime: "18 минут",
    slaCompliance: 94,
    escalationRate: 12,
    reopenRate: 3,
    customerSatisfaction: 4.6,
  }

  const trendData = [
    { period: "Неделя 1", created: 38, resolved: 35, pending: 3 },
    { period: "Неделя 2", created: 42, resolved: 40, pending: 5 },
    { period: "Неделя 3", created: 35, resolved: 38, pending: 2 },
    { period: "Неделя 4", created: 41, resolved: 39, pending: 4 },
  ]

  const categoryBreakdown = [
    { category: "Инфраструктура", count: 45, avgTime: "5.2ч", sla: 92 },
    { category: "Приложения", count: 38, avgTime: "3.8ч", sla: 96 },
    { category: "Сеть", count: 32, avgTime: "4.1ч", sla: 94 },
    { category: "Оборудование", count: 25, avgTime: "2.9ч", sla: 98 },
    { category: "Безопасность", count: 16, avgTime: "6.1ч", sla: 89 },
  ]

  const priorityAnalysis = [
    { priority: "Критический", count: 2, avgTime: "1.2ч", sla: 100, target: "1ч" },
    { priority: "Высокий", count: 8, avgTime: "2.8ч", sla: 95, target: "4ч" },
    { priority: "Средний", count: 12, avgTime: "6.2ч", sla: 92, target: "8ч" },
    { priority: "Низкий", count: 134, avgTime: "18.5ч", sla: 94, target: "24ч" },
  ]

  const exportReport = () => {
    console.log("Экспорт детального отчета по инцидентам")
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Критический":
        return "bg-red-500 text-white"
      case "Высокий":
        return "bg-red-100 text-red-800"
      case "Средний":
        return "bg-yellow-100 text-yellow-800"
      case "Низкий":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getSlaColor = (sla: number) => {
    if (sla >= 95) return "text-green-600"
    if (sla >= 90) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/reports">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Детальная аналитика инцидентов</h1>
          <p className="text-muted-foreground">Подробные метрики и тренды по инцидентам</p>
        </div>
        <Button onClick={exportReport}>
          <Download className="w-4 h-4 mr-2" />
          Экспорт отчета
        </Button>
      </div>

      {/* Фильтры */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Фильтры отчета
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label>Период</Label>
              <DatePickerWithRange date={dateRange} setDate={setDateRange} />
            </div>
            <div className="space-y-2">
              <Label>Категория</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все категории</SelectItem>
                  <SelectItem value="infrastructure">Инфраструктура</SelectItem>
                  <SelectItem value="applications">Приложения</SelectItem>
                  <SelectItem value="network">Сеть</SelectItem>
                  <SelectItem value="hardware">Оборудование</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Приоритет</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все приоритеты</SelectItem>
                  <SelectItem value="critical">Критический</SelectItem>
                  <SelectItem value="high">Высокий</SelectItem>
                  <SelectItem value="medium">Средний</SelectItem>
                  <SelectItem value="low">Низкий</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Исполнитель</Label>
              <Select value={assignee} onValueChange={setAssignee}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все исполнители</SelectItem>
                  <SelectItem value="ivanov">Иванов И.И.</SelectItem>
                  <SelectItem value="petrov">Петров П.П.</SelectItem>
                  <SelectItem value="sidorov">Сидоров С.С.</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ключевые метрики */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего инцидентов</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{detailedMetrics.totalIncidents}</div>
            <p className="text-xs text-muted-foreground">+12% к предыдущему периоду</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Среднее время решения</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{detailedMetrics.avgResolutionTime}</div>
            <p className="text-xs text-green-600">-8% улучшение</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SLA соблюдение</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{detailedMetrics.slaCompliance}%</div>
            <p className="text-xs text-green-600">Цель: 95%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Удовлетворенность</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{detailedMetrics.customerSatisfaction}/5</div>
            <p className="text-xs text-green-600">+0.2 к предыдущему</p>
          </CardContent>
        </Card>
      </div>

      {/* Тренды */}
      <Card>
        <CardHeader>
          <CardTitle>Тренды создания и решения инцидентов</CardTitle>
          <CardDescription>Динамика по неделям</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trendData.map((week, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <span className="font-medium">{week.period}</span>
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                    <span>Создано: {week.created}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                    <span>Решено: {week.resolved}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                    <span>Ожидает: {week.pending}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Анализ по категориям */}
        <Card>
          <CardHeader>
            <CardTitle>Анализ по категориям</CardTitle>
            <CardDescription>Производительность по типам инцидентов</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryBreakdown.map((cat, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{cat.category}</span>
                    <Badge variant="outline">{cat.count} инцидентов</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Среднее время:</span>
                      <span>{cat.avgTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">SLA:</span>
                      <span className={getSlaColor(cat.sla)}>{cat.sla}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Анализ по приоритетам */}
        <Card>
          <CardHeader>
            <CardTitle>Анализ по приоритетам</CardTitle>
            <CardDescription>Соответствие целевым показателям</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {priorityAnalysis.map((prio, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge className={getPriorityColor(prio.priority)}>{prio.priority}</Badge>
                    <span className="text-sm">{prio.count} инцидентов</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="text-center">
                      <div className="text-muted-foreground">Факт</div>
                      <div className="font-medium">{prio.avgTime}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-muted-foreground">Цель</div>
                      <div className="font-medium">{prio.target}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-muted-foreground">SLA</div>
                      <div className={`font-medium ${getSlaColor(prio.sla)}`}>{prio.sla}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Дополнительные метрики */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Эскалации</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{detailedMetrics.escalationRate}%</div>
            <p className="text-sm text-muted-foreground">от общего количества</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Повторные обращения</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{detailedMetrics.reopenRate}%</div>
            <p className="text-sm text-muted-foreground">решенных инцидентов</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Первый отклик</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{detailedMetrics.firstResponseTime}</div>
            <p className="text-sm text-muted-foreground">среднее время</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
