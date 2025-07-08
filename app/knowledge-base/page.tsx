"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, Eye, Edit, Star, ThumbsUp, BookOpen, TrendingUp, Clock } from "lucide-react"
import Link from "next/link"

export default function KnowledgeBasePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [sortBy, setSortBy] = useState("recent")

  const articles = [
    {
      id: "KB-001",
      title: "Решение проблем с подключением к Exchange Server",
      description: "Пошаговое руководство по диагностике и устранению проблем подключения к почтовому серверу",
      category: "Почта",
      tags: ["Exchange", "Outlook", "Подключение"],
      author: "Иванов И.И.",
      created: "2024-01-10",
      updated: "2024-01-15",
      views: 245,
      rating: 4.8,
      votes: 12,
      status: "Опубликовано",
    },
    {
      id: "KB-002",
      title: "Настройка VPN подключения для удаленной работы",
      description: "Детальная инструкция по настройке VPN клиента и решению типичных проблем",
      category: "Сеть",
      tags: ["VPN", "Удаленная работа", "Безопасность"],
      author: "Петров П.П.",
      created: "2024-01-12",
      updated: "2024-01-14",
      views: 189,
      rating: 4.6,
      votes: 8,
      status: "Опубликовано",
    },
    {
      id: "KB-003",
      title: "Восстановление данных из резервных копий",
      description: "Процедуры восстановления файлов и баз данных из различных типов резервных копий",
      category: "Резервное копирование",
      tags: ["Backup", "Восстановление", "Данные"],
      author: "Сидоров С.С.",
      created: "2024-01-08",
      updated: "2024-01-13",
      views: 156,
      rating: 4.9,
      votes: 15,
      status: "Опубликовано",
    },
    {
      id: "KB-004",
      title: "Установка и настройка антивирусного ПО",
      description: "Руководство по развертыванию корпоративного антивируса и настройке политик безопасности",
      category: "Безопасность",
      tags: ["Антивирус", "Безопасность", "Политики"],
      author: "Волков В.В.",
      created: "2024-01-05",
      updated: "2024-01-11",
      views: 203,
      rating: 4.4,
      votes: 9,
      status: "На рассмотрении",
    },
  ]

  const categories = [
    { name: "Почта", count: 15, color: "bg-blue-100 text-blue-800" },
    { name: "Сеть", count: 23, color: "bg-green-100 text-green-800" },
    { name: "Безопасность", count: 18, color: "bg-red-100 text-red-800" },
    { name: "Резервное копирование", count: 12, color: "bg-purple-100 text-purple-800" },
    { name: "Оборудование", count: 20, color: "bg-yellow-100 text-yellow-800" },
    { name: "ПО", count: 25, color: "bg-indigo-100 text-indigo-800" },
  ]

  const popularTags = ["Exchange", "VPN", "Backup", "Active Directory", "Windows", "Linux", "Сеть", "Принтеры"]

  const getCategoryColor = (category: string) => {
    const cat = categories.find((c) => c.name === category)
    return cat ? cat.color : "bg-gray-100 text-gray-800"
  }

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = categoryFilter === "all" || article.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  const sortedArticles = [...filteredArticles].sort((a, b) => {
    switch (sortBy) {
      case "rating":
        return b.rating - a.rating
      case "views":
        return b.views - a.views
      case "recent":
        return new Date(b.updated).getTime() - new Date(a.updated).getTime()
      default:
        return 0
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">База знаний</h1>
          <p className="text-muted-foreground">Накопленные знания и решения IT-проблем</p>
        </div>
        <Button asChild>
          <Link href="/knowledge-base/new">
            <Plus className="w-4 h-4 mr-2" />
            Создать статью
          </Link>
        </Button>
      </div>

      {/* Статистика */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего статей</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{articles.length}</div>
            <p className="text-xs text-muted-foreground">+3 за неделю</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Просмотры</CardTitle>
            <Eye className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{articles.reduce((sum, a) => sum + a.views, 0)}</div>
            <p className="text-xs text-muted-foreground">+12% за месяц</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Средний рейтинг</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(articles.reduce((sum, a) => sum + a.rating, 0) / articles.length).toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">из 5.0</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Активные авторы</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">в этом месяце</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="articles" className="space-y-4">
        <TabsList>
          <TabsTrigger value="articles">Статьи</TabsTrigger>
          <TabsTrigger value="categories">Категории</TabsTrigger>
          <TabsTrigger value="popular">Популярное</TabsTrigger>
        </TabsList>

        <TabsContent value="articles" className="space-y-4">
          {/* Поиск и фильтры */}
          <Card>
            <CardHeader>
              <CardTitle>Поиск статей</CardTitle>
              <CardDescription>Найдите нужную информацию</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Поиск по названию, описанию или тегам..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Категория" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все категории</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.name} value={category.name}>
                        {category.name} ({category.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Сортировка" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">По дате обновления</SelectItem>
                    <SelectItem value="rating">По рейтингу</SelectItem>
                    <SelectItem value="views">По просмотрам</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Список статей */}
          <div className="grid gap-4">
            {sortedArticles.map((article) => (
              <Card key={article.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getCategoryColor(article.category)}>
                          {article.category}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{article.id}</span>
                        {article.status === "На рассмотрении" && (
                          <Badge variant="outline" className="bg-orange-100 text-orange-800">
                            На рассмотрении
                          </Badge>
                        )}
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-2">
                          <Link href={`/knowledge-base/${article.id}`} className="hover:text-primary">
                            {article.title}
                          </Link>
                        </h3>
                        <p className="text-muted-foreground text-sm">{article.description}</p>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {article.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Автор: {article.author}</span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {article.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          {article.rating}
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3" />
                          {article.votes}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Обновлено: {article.updated}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/knowledge-base/${article.id}`}>
                          <Eye className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/knowledge-base/${article.id}/edit`}>
                          <Edit className="w-4 h-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {sortedArticles.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Статьи не найдены</h3>
                <p className="text-muted-foreground">Попробуйте изменить параметры поиска</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Card key={category.name} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{category.name}</h3>
                      <p className="text-sm text-muted-foreground">{category.count} статей</p>
                    </div>
                    <Badge className={category.color}>{category.count}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="popular" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Популярные теги</CardTitle>
              <CardDescription>Часто используемые темы</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {popularTags.map((tag) => (
                  <Badge key={tag} variant="outline" className="cursor-pointer hover:bg-secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Самые просматриваемые статьи</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {articles
                  .sort((a, b) => b.views - a.views)
                  .slice(0, 5)
                  .map((article, index) => (
                    <div key={article.id} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <Link href={`/knowledge-base/${article.id}`} className="font-medium hover:text-primary">
                          {article.title}
                        </Link>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {article.views}
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            {article.rating}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
