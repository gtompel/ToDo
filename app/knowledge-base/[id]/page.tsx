"use client"

import { useState } from "react"
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

// Компонент страницы статьи базы знаний
export default function ArticlePage({ params }: { params: { id: string } }) {
  // Состояния для рейтинга, комментария и полезности
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isHelpful, setIsHelpful] = useState<boolean | null>(null)

  // Пример данных статьи (в реальном приложении будет загрузка по ID)
  const article = {
    id: params.id,
    title: "Решение проблем с подключением к Exchange Server",
    description: "Пошаговое руководство по диагностике и устранению проблем подключения к почтовому серверу",
    category: "Почта",
    tags: ["Exchange", "Outlook", "Подключение", "Диагностика"],
    author: "Иванов И.И.",
    created: "2024-01-10",
    updated: "2024-01-15",
    views: 245,
    rating: 4.8,
    votes: 12,
    helpful: 18,
    notHelpful: 2,
    status: "Опубликовано",
    content: `# Решение проблем с подключением к Exchange Server

## Описание проблемы

Пользователи могут столкнуться с различными проблемами при подключении к Exchange Server через Outlook или другие почтовые клиенты.

## Типичные симптомы

- Outlook не может подключиться к серверу
- Ошибки аутентификации
- Медленная синхронизация почты
- Периодические разрывы соединения

## Диагностика

### Шаг 1: Проверка сетевого подключения

1. Откройте командную строку (cmd)
2. Выполните команду: \`ping exchange.company.com\`
3. Убедитесь, что сервер отвечает

### Шаг 2: Проверка портов

Убедитесь, что следующие порты открыты:
- **443** - HTTPS (Exchange Web Services)
- **993** - IMAPS
- **587** - SMTP с TLS

### Шаг 3: Проверка учетных данных

1. Попробуйте войти через веб-интерфейс OWA
2. Убедитесь, что пароль не истек
3. Проверьте блокировку учетной записи

## Решение проблем

### Проблема: Ошибка аутентификации

**Решение:**
1. Перезапустите службу Microsoft Exchange Information Store
2. Проверьте настройки автообнаружения
3. Очистите кэш учетных данных Windows

### Проблема: Медленная синхронизация

**Решение:**
1. Уменьшите размер почтового ящика
2. Настройте кэширование в режиме Exchange
3. Проверьте пропускную способность сети

### Проблема: Периодические разрывы

**Решение:**
1. Обновите Outlook до последней версии
2. Отключите антивирусную проверку почты
3. Настройте параметры тайм-аута

## Дополнительные ресурсы

- [Официальная документация Microsoft Exchange](https://docs.microsoft.com/exchange)
- [Инструменты диагностики Exchange](https://testconnectivity.microsoft.com)

## Связанные статьи

- KB-005: Настройка автообнаружения Exchange
- KB-012: Резервное копирование почтовых ящиков
- KB-018: Мониторинг производительности Exchange`,
  }

  // Пример комментариев
  const comments = [
    {
      id: 1,
      author: "Петров П.П.",
      date: "2024-01-16 10:30",
      content:
        "Отличная статья! Помогла решить проблему с подключением Outlook. Особенно полезен раздел про проверку портов.",
      helpful: 3,
    },
    {
      id: 2,
      author: "Сидоров С.С.",
      date: "2024-01-16 14:15",
      content: "Можно добавить информацию про настройку SSL сертификатов. Часто проблемы именно с ними.",
      helpful: 1,
    },
  ]

  // Пример связанных статей
  const relatedArticles = [
    { id: "KB-005", title: "Настройка автообнаружения Exchange", views: 156 },
    { id: "KB-012", title: "Резервное копирование почтовых ящиков", views: 89 },
    { id: "KB-018", title: "Мониторинг производительности Exchange", views: 134 },
  ]

  // Обработчик выставления рейтинга
  const handleRating = (value: number) => {
    setRating(value)
    // Здесь будет отправка рейтинга на сервер
  }

  // Обработчик отметки полезности
  const handleHelpful = (helpful: boolean) => {
    setIsHelpful(helpful)
    // Здесь будет отправка оценки полезности
  }

  // Обработчик отправки комментария
  const submitComment = () => {
    if (comment.trim()) {
      // Здесь будет отправка комментария
      console.log("Новый комментарий:", comment)
      setComment("")
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
          <h1 className="text-3xl font-bold">{article.title}</h1>
          <p className="text-muted-foreground mt-1">{article.description}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <Share2 className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Bookmark className="w-4 h-4" />
          </Button>
          <Button asChild>
            <Link href={`/knowledge-base/${article.id}/edit`}>
              <Edit className="w-4 h-4 mr-2" />
              Редактировать
            </Link>
          </Button>
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
                    {article.author}
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
                <div className="whitespace-pre-wrap">{article.content}</div>
              </div>
            </CardContent>
          </Card>

          {/* Теги */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag) => (
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

              <Separator />

              {/* Список комментариев */}
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="border-l-2 border-muted pl-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">{comment.author}</span>
                        <span className="text-muted-foreground">{comment.date}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <ThumbsUp className="w-3 h-3" />
                        {comment.helpful}
                      </div>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Боковая панель */}
        <div className="space-y-6">
          {/* Связанные статьи */}
          <Card>
            <CardHeader>
              <CardTitle>Связанные статьи</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {relatedArticles.map((related) => (
                <div key={related.id} className="space-y-1">
                  <Link
                    href={`/knowledge-base/${related.id}`}
                    className="text-sm font-medium hover:text-primary line-clamp-2"
                  >
                    {related.title}
                  </Link>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Eye className="w-3 h-3" />
                    {related.views} просмотров
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Информация о статье */}
          <Card>
            <CardHeader>
              <CardTitle>Информация</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Создано:</span>
                <span>{article.created}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Обновлено:</span>
                <span>{article.updated}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Просмотры:</span>
                <span>{article.views}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Рейтинг:</span>
                <span>{article.rating}/5</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
