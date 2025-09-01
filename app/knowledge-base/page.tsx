"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, Eye, Edit, Star, ThumbsUp, BookOpen, TrendingUp, Clock } from "lucide-react"
import Link from "next/link"
import { useCurrentUser } from "@/hooks/use-user"

export default function KnowledgeBasePage() {
  const { user: currentUser } = useCurrentUser()
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [sortBy, setSortBy] = useState("recent")
  const [articles, setArticles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [tab, setTab] = useState("articles")
  const [statusFilter, setStatusFilter] = useState("all")

  // Реальные метрики на основе полученных статей
  const totalViews = useMemo(() => articles.reduce((sum, a) => sum + (a.views || 0), 0), [articles])
  const avgRating = useMemo(() => {
    if (articles.length === 0) return "-"
    const total = articles.reduce((sum, a) => sum + (a.rating || 0), 0)
    return (total / articles.length).toFixed(1)
  }, [articles])
  const activeAuthorsThisMonth = useMemo(() => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const authorIds = new Set(
      articles
        .filter((a) => new Date(a.updatedAt || a.updated) >= startOfMonth)
        .map((a) => a.authorId)
        .filter(Boolean)
    )
    return authorIds.size
  }, [articles])

  useEffect(() => {
    setLoading(true)
    fetch("/api/articles")
      .then(r => r.json())
      .then(data => setArticles(data.articles || []))
      .catch(() => setError("Ошибка загрузки статей"))
      .finally(() => setLoading(false))
  }, [])

  // Категории и теги можно вычислять из статей
  const categories = Array.from(new Set(articles.map(a => a.category).filter(Boolean))).map(name => ({
    name,
    count: articles.filter(a => a.category === name).length,
    color: "bg-blue-100 text-blue-800"
  }))
  const popularTags = Array.from(new Set(articles.flatMap(a => a.tags || [])))

  const getCategoryColor = (category: string) => {
    const cat = categories.find((c) => c.name === category)
    return cat ? cat.color : "bg-muted text-foreground"
  }

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (article.description || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (article.tags || []).some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = categoryFilter === "all" || article.category === categoryFilter
    // Черновики видны только автору или админу
    const isDraft = article.status === "draft"
    const canSeeDraft = currentUser && (currentUser.id === article.authorId || currentUser.role === "ADMIN")
    if (isDraft && !canSeeDraft) return false
    // Фильтр по статусу
    if (statusFilter === "published" && article.status === "draft") return false
    if (statusFilter === "draft" && article.status !== "draft") return false
    return matchesSearch && matchesCategory
  })

  const sortedArticles = [...filteredArticles].sort((a, b) => {
    switch (sortBy) {
      case "rating":
        return (b.rating || 0) - (a.rating || 0)
      case "views":
        return (b.views || 0) - (a.views || 0)
      case "recent":
        return new Date(b.updatedAt || b.updated).getTime() - new Date(a.updatedAt || a.updated).getTime()
      default:
        return 0
    }
  })

  if (loading) return <div className="p-8 text-center text-muted-foreground">Загрузка статей...</div>
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">База знаний</h1>
          <p className="text-muted-foreground">Накопленные знания и решения IT-проблем</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/knowledge-base/new">
              <Plus className="w-4 h-4 mr-2" />
              Создать статью
            </Link>
          </Button>
          {currentUser && (
            <Button asChild variant="outline">
              <Link href="/knowledge-base/drafts">Мои черновики</Link>
            </Button>
          )}
        </div>
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
            {/* Убрали моковую подпись */}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Просмотры</CardTitle>
            <Eye className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Средний рейтинг</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {avgRating}
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
            <div className="text-2xl font-bold">{activeAuthorsThisMonth}</div>
            <p className="text-xs text-muted-foreground">в этом месяце</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={tab} onValueChange={setTab} defaultValue="articles" className="space-y-4">
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
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Статус" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все статусы</SelectItem>
                    <SelectItem value="published">Опубликовано</SelectItem>
                    <SelectItem value="draft">Черновики</SelectItem>
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
                        {article.tags.map((tag: string) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Автор: {article.author?.lastName || ''} {article.author?.firstName || ''}{!article.author?.lastName && !article.author?.firstName ? article.author?.email : ''}</span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {article.views || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          {article.rating || 0}/5
                        </span>
                        <span className="flex items-center gap-1">
                          👍 {article.helpful || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          👎 {article.notHelpful || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          💬 {article.commentsCount || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          Создано: {article.createdAt ? new Date(article.createdAt).toLocaleDateString() : '-'}
                        </span>
                        <span className="flex items-center gap-1">
                          Обновлено: {article.updatedAt ? new Date(article.updatedAt).toLocaleDateString() : '-'}
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
              <Card
                key={category.name}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => {
                  setCategoryFilter(category.name)
                  setTab("articles")
                }}
              >
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
                  .sort((a, b) => (b.views || 0) - (a.views || 0))
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
