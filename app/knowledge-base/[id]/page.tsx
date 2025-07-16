"use client"

import { useState, useEffect, use as usePromise } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import {
  ArrowLeft,
  Edit,
  Star,
  ThumbsUp,
  ThumbsDown,
  Eye,
  Clock,
  User,
  MessageCircle,
  Share2,
  Bookmark,
} from "lucide-react"
import Link from "next/link"
import { useCurrentUser } from "@/hooks/use-user"
import { useToast } from "@/components/ui/use-toast"
import ReactMarkdown from "react-markdown"

// Компонент страницы статьи базы знаний
export default function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = usePromise(params)
  const { user: currentUser } = useCurrentUser()
  const [article, setArticle] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  // Состояния для рейтинга, комментария и полезности
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isHelpful, setIsHelpful] = useState<boolean | null>(null)
  const [comments, setComments] = useState<any[]>([])
  const [commentsLoading, setCommentsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    setLoading(true)
    fetch(`/api/articles/${id}`)
      .then(r => r.json())
      .then(data => setArticle(data.article))
      .catch(() => setError("Ошибка загрузки статьи"))
      .finally(() => setLoading(false))
    // Инкремент просмотров
    fetch(`/api/articles/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ view: true }) })
    // Получение комментариев
    setCommentsLoading(true)
    fetch(`/api/articles/${id}/comments`)
      .then(r => r.json())
      .then(data => setComments(data.comments || []))
      .catch(() => toast({ title: "Ошибка", description: "Не удалось загрузить комментарии", variant: "destructive" }))
      .finally(() => setCommentsLoading(false))
  }, [id])

  if (loading) return <div className="p-8 text-center text-muted-foreground">Загрузка статьи...</div>
  if (error || !article) return <div className="p-8 text-center text-red-500">{error || "Статья не найдена"}</div>

  const canEdit = currentUser && article && (currentUser.id === article.authorId || currentUser.role === "ADMIN")

  // Пример комментариев
  // const comments = [
  //   {
  //     id: 1,
  //     author: "Петров П.П.",
  //     date: "2024-01-16 10:30",
  //     content:
  //       "Отличная статья! Помогла решить проблему с подключением Outlook. Особенно полезен раздел про проверку портов.",
  //     helpful: 3,
  //   },
  //   {
  //     id: 2,
  //     author: "Сидоров С.С.",
  //     date: "2024-01-16 14:15",
  //     content: "Можно добавить информацию про настройку SSL сертификатов. Часто проблемы именно с ними.",
  //     helpful: 1,
  //   },
  // ]

  // Пример связанных статей

  // Обработчик выставления рейтинга
  const handleRating = (value: number) => {
    setRating(value)
    // Здесь будет отправка рейтинга на сервер
  }

  // Обработчик отметки полезности
  const handleHelpful = async (helpful: boolean) => {
    if (isHelpful !== null) return // Защита от повторного голосования
    setIsHelpful(helpful)
    try {
      const res = await fetch(`/api/articles/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ helpful }),
      })
      if (!res.ok) throw new Error("Ошибка отправки оценки")
      const data = await res.json()
      setArticle(data.article)
      toast({ title: "Спасибо за оценку!" })
    } catch {
      toast({ title: "Ошибка", description: "Не удалось отправить оценку", variant: "destructive" })
      setIsHelpful(null)
    }
  }

  // Добавление комментария
  const submitComment = async () => {
    if (!comment.trim()) return
    try {
      const res = await fetch(`/api/articles/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: comment })
      })
      if (!res.ok) {
        const data = await res.json()
        toast({ title: "Ошибка", description: data.error || "Не удалось добавить комментарий", variant: "destructive" })
        return
      }
      const data = await res.json()
      setComments((prev) => [...prev, data.comment])
      setComment("")
      toast({ title: "Комментарий добавлен" })
    } catch {
      toast({ title: "Ошибка", description: "Не удалось добавить комментарий", variant: "destructive" })
    }
  }

  // Удаление комментария (только для админа)
  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Удалить комментарий?")) return
    try {
      const res = await fetch(`/api/articles/${id}/comments`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId })
      })
      if (!res.ok) {
        const data = await res.json()
        toast({ title: "Ошибка", description: data.error || "Не удалось удалить комментарий", variant: "destructive" })
        return
      }
      setComments((prev) => prev.filter((c) => c.id !== commentId))
      toast({ title: "Комментарий удалён" })
    } catch {
      toast({ title: "Ошибка", description: "Не удалось удалить комментарий", variant: "destructive" })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/knowledge-base">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-blue-100 text-blue-800">{article.category}</Badge>
            <span className="text-sm text-muted-foreground">{article.id}</span>
          </div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            {article.title}
            {article.status === "draft" && (
              <span className="ml-2 px-2 py-0.5 rounded bg-orange-100 text-orange-800 text-xs font-semibold">Черновик</span>
            )}
          </h1>
          {article.description && (
            <div className="text-muted-foreground mt-1 prose prose-sm max-w-none">
              <ReactMarkdown>{article.description}</ReactMarkdown>
            </div>
          )}
        </div>
        <div className="flex gap-2 ml-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/knowledge-base/${article.id}`}>
              <Eye className="w-4 h-4" />
            </Link>
          </Button>
          {canEdit && (
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/knowledge-base/${article.id}/edit`}>
                <Edit className="w-4 h-4" />
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3 space-y-6">
          {/* Метаинформация */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {article.author?.lastName || ''} {article.author?.firstName || ''}{!article.author?.lastName && !article.author?.firstName ? article.author?.email : ''}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Обновлено: {article.updated}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {article.views} просмотров
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    {article.rating}
                  </span>
                  <span>({article.votes} оценок)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Содержание статьи */}
          <Card>
            <CardContent className="p-6">
              <div className="prose max-w-none">
                <ReactMarkdown>{article.content}</ReactMarkdown>
              </div>
            </CardContent>
          </Card>

          {/* Теги */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag: string) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Оценка полезности */}
          <Card>
            <CardHeader>
              <CardTitle>Была ли статья полезной?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Button
                  variant={isHelpful === true ? "default" : "outline"}
                  onClick={() => handleHelpful(true)}
                  className="flex items-center gap-2"
                >
                  <ThumbsUp className="w-4 h-4" />
                  Да ({article.helpful})
                </Button>
                <Button
                  variant={isHelpful === false ? "default" : "outline"}
                  onClick={() => handleHelpful(false)}
                  className="flex items-center gap-2"
                >
                  <ThumbsDown className="w-4 h-4" />
                  Нет ({article.notHelpful})
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Рейтинг */}
          <Card>
            <CardHeader>
              <CardTitle>Оцените статью</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} onClick={() => handleRating(star)} className="p-1">
                    <Star
                      className={`w-6 h-6 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm text-muted-foreground">
                  {rating > 0 ? `Ваша оценка: ${rating}` : "Нажмите на звезду"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Комментарии */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Комментарии ({comments.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Форма добавления комментария */}
              {currentUser ? (
                <div className="space-y-4">
                  <Textarea
                    placeholder="Поделитесь своим опытом или задайте вопрос..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                  />
                  <Button onClick={submitComment} disabled={!comment.trim()}>
                    Добавить комментарий
                  </Button>
                </div>
              ) : (
                <div className="text-muted-foreground">Войдите, чтобы оставить комментарий</div>
              )}

              <Separator />

              {/* Список комментариев */}
              {commentsLoading ? (
                <div className="text-muted-foreground">Загрузка комментариев...</div>
              ) : comments.length === 0 ? (
                <div className="text-muted-foreground">Комментариев пока нет</div>
              ) : (
                <div className="space-y-4">
                  {comments.map((c) => (
                    <div key={c.id} className="border-l-2 border-muted pl-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">{c.user?.lastName || ''} {c.user?.firstName || ''}{!c.user?.lastName && !c.user?.firstName ? c.user?.email : ''}</span>
                          <span className="text-muted-foreground">{new Date(c.createdAt).toLocaleString()}</span>
                        </div>
                        {currentUser && currentUser.role === "ADMIN" && (
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteComment(c.id)}>
                            Удалить
                          </Button>
                        )}
                      </div>
                      <p className="text-sm">{c.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Боковая панель */}
        <div className="space-y-6">
          {/* Информация */}
          <Card>
            <CardHeader>
              <CardTitle>Информация</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <div>Создано: {article.createdAt ? new Date(article.createdAt).toLocaleString() : '-'}</div>
              <div>Обновлено: {article.updatedAt ? new Date(article.updatedAt).toLocaleString() : '-'}</div>
              <div>Просмотры: {article.views || 0}</div>
              <div>Рейтинг: {article.rating || 0} / 5</div>
              <div>Оценок: {article.votes || 0}</div>
              <div>👍 {article.helpful || 0}  👎 {article.notHelpful || 0}</div>
              <div>Комментариев: {article.commentsCount || 0}</div>
            </CardContent>
          </Card>
          {/* Связанные статьи */}
          <Card>
            <CardHeader>
              <CardTitle>Связанные статьи</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {/* Примитивная реализация: по тегам */}
                {article.tags && article.tags.length > 0 && (
                  <>
                    {article.tags.map((tag: string) => (
                      <span key={tag} className="bg-gray-100 text-gray-800 rounded px-2 py-0.5 text-xs">{tag}</span>
                    ))}
                  </>
                )}
                {!article.tags?.length && <span className="text-muted-foreground">Нет связанных статей</span>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
