"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import {
  ArrowLeft, Edit, Star, ThumbsUp, ThumbsDown, Eye, Clock, User, MessageCircle
} from "lucide-react"
import Link from "next/link"
import { useCurrentUser } from "@/hooks/use-user"
import { useToast } from "@/components/ui/use-toast"
import ReactMarkdown from "react-markdown"
import dynamic from "next/dynamic"
import { useRef, useEffect, useState } from "react"

const CommentsBlock = dynamic(() => import("./CommentsBlock"), { ssr: false, loading: () => <div className="text-muted-foreground">Загрузка комментариев...</div> })
const RelatedArticlesBlock = dynamic(() => import("./RelatedArticlesBlock"), { ssr: false, loading: () => <div className="text-muted-foreground">Загрузка связанных статей...</div> })

export default function ArticlePageClient({ article, comments }: { article: any, comments: any[] }) {
  const { user: currentUser } = useCurrentUser()
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isHelpful, setIsHelpful] = useState<boolean | null>(null)
  const { toast } = useToast()
  const commentsRef = useRef<HTMLDivElement>(null)
  const [showComments, setShowComments] = useState(false)
  const relatedRef = useRef<HTMLDivElement>(null)
  const [showRelated, setShowRelated] = useState(false)

  useEffect(() => {
    if (!commentsRef.current) return
    const observer = new window.IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) setShowComments(true)
      },
      { threshold: 0.1 }
    )
    observer.observe(commentsRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!relatedRef.current) return
    const observer = new window.IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) setShowRelated(true)
      },
      { threshold: 0.1 }
    )
    observer.observe(relatedRef.current)
    return () => observer.disconnect()
  }, [])

  const canEdit = currentUser && article && (currentUser.id === article.authorId || currentUser.role === "ADMIN")

  let ratingTimeout: NodeJS.Timeout | null = null

  // Обработчик выставления рейтинга с debounce
  const handleRating = (value: number) => {
    setRating(value)
    if (ratingTimeout) clearTimeout(ratingTimeout)
    ratingTimeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/articles/${article.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rating: value }),
        })
        if (!res.ok) throw new Error("Ошибка отправки рейтинга")
        toast({ title: "Спасибо за оценку!" })
      } catch {
        toast({ title: "Ошибка", description: "Не удалось отправить оценку", variant: "destructive" })
      }
    }, 600)
  }

  // Обработчик отметки полезности
  const handleHelpful = async (helpful: boolean) => {
    if (isHelpful !== null) return
    setIsHelpful(helpful)
    try {
      const res = await fetch(`/api/articles/${article.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ helpful }),
      })
      if (!res.ok) throw new Error("Ошибка отправки оценки")
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
      const res = await fetch(`/api/articles/${article.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: comment })
      })
      if (!res.ok) {
        const data = await res.json()
        toast({ title: "Ошибка", description: data.error || "Не удалось добавить комментарий", variant: "destructive" })
        return
      }
      setComment("")
      toast({ title: "Комментарий добавлен. Обновите страницу для просмотра." })
    } catch {
      toast({ title: "Ошибка", description: "Не удалось добавить комментарий", variant: "destructive" })
    }
  }

  // Удаление комментария (только для админа)
  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Удалить комментарий?")) return
    try {
      const res = await fetch(`/api/articles/${article.id}/comments`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId })
      })
      if (!res.ok) {
        const data = await res.json()
        toast({ title: "Ошибка", description: data.error || "Не удалось удалить комментарий", variant: "destructive" })
        return
      }
      toast({ title: "Комментарий удалён. Обновите страницу для просмотра." })
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
          <Card ref={commentsRef}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Комментарии ({comments.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {showComments ? (
                <CommentsBlock article={article} comments={comments} />
              ) : (
                <div className="text-muted-foreground">Комментарии будут загружены при прокрутке...</div>
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
          <Card ref={relatedRef}>
            <CardHeader>
              <CardTitle>Связанные статьи</CardTitle>
            </CardHeader>
            <CardContent>
              {showRelated ? (
                <RelatedArticlesBlock articleId={article.id} tags={article.tags} />
              ) : (
                <div className="text-muted-foreground">Связанные статьи будут загружены при прокрутке...</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 