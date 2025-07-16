"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, Eye, Plus, X, Upload, Bold, Italic, List, Link2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import ReactMarkdown from "react-markdown"
import { useToast } from "@/components/ui/use-toast"

// Страница создания новой статьи базы знаний
export default function NewArticlePage() {
  const router = useRouter()
  const { toast } = useToast()
  // Состояния формы, тегов и режима предпросмотра
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    content: "",
    tags: [] as string[],
    status: "draft",
  })
  const [newTag, setNewTag] = useState("")
  const [previewMode, setPreviewMode] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Категории для выбора
  const categories = [
    "Почта",
    "Сеть",
    "Безопасность",
    "Резервное копирование",
    "Оборудование",
    "ПО",
    "Active Directory",
    "Принтеры",
    "Мобильные устройства",
    "Другое",
  ]

  // Обработчик отправки формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    if (!formData.title || !formData.content) {
      setError("Заполните обязательные поля")
      setLoading(false)
      return
    }
    try {
      const res = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Ошибка создания статьи")
        toast({ title: "Ошибка", description: data.error || "Ошибка создания статьи", variant: "destructive" })
        setLoading(false)
        return
      }
      const data = await res.json()
      toast({ title: "Статья создана", description: "Статья успешно добавлена!" })
      router.push(`/knowledge-base/${data.article.id}`)
    } catch {
      setError("Ошибка создания статьи")
      toast({ title: "Ошибка", description: "Ошибка создания статьи", variant: "destructive" })
      setLoading(false)
    }
  }

  // Обработчик изменения поля формы
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Добавить тег
  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }))
      setNewTag("")
    }
  }

  // Удалить тег
  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  // Вставить форматирование
  const insertFormatting = (format: string) => {
    const textarea = document.getElementById("content") as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = textarea.value.substring(start, end)

    let replacement = ""
    switch (format) {
      case "bold":
        replacement = `**${selectedText || "жирный текст"}**`
        break
      case "italic":
        replacement = `*${selectedText || "курсив"}*`
        break
      case "list":
        replacement = `\n- ${selectedText || "элемент списка"}\n`
        break
      case "link":
        replacement = `[${selectedText || "текст ссылки"}](URL)`
        break
    }

    const newContent = textarea.value.substring(0, start) + replacement + textarea.value.substring(end)
    handleInputChange("content", newContent)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/knowledge-base">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Создание статьи базы знаний</h1>
          <p className="text-muted-foreground">Поделитесь знаниями с командой</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Основная информация */}
            <Card>
              <CardHeader>
                <CardTitle>Основная информация</CardTitle>
                <CardDescription>Заголовок и описание статьи</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Заголовок статьи *</Label>
                  <Input
                    id="title"
                    placeholder="Например: Решение проблем с подключением к Exchange Server"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    required
                    className={error && !formData.title ? "border-red-500" : ""}
                  />
                  {error && !formData.title && <p className="text-red-500 text-sm mt-1">Заголовок обязателен</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Краткое описание</Label>
                  <Textarea
                    id="description"
                    placeholder="Краткое описание содержания статьи для поиска и каталога"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Содержание */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Содержание статьи</CardTitle>
                    <CardDescription>Подробное описание решения</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={previewMode ? "outline" : "secondary"}
                      size="sm"
                      onClick={() => setPreviewMode(false)}
                    >
                      Редактор
                    </Button>
                    <Button
                      type="button"
                      variant={previewMode ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => setPreviewMode(true)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Предпросмотр
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {!previewMode ? (
                  <div className="space-y-4">
                    {/* Панель инструментов */}
                    <div className="flex gap-2 p-2 border rounded-md bg-muted/50">
                      <Button type="button" variant="ghost" size="sm" onClick={() => insertFormatting("bold")}>
                        <Bold className="w-4 h-4" />
                      </Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => insertFormatting("italic")}>
                        <Italic className="w-4 h-4" />
                      </Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => insertFormatting("list")}>
                        <List className="w-4 h-4" />
                      </Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => insertFormatting("link")}>
                        <Link2 className="w-4 h-4" />
                      </Button>
                      <Button type="button" variant="ghost" size="sm">
                        <Upload className="w-4 h-4" />
                      </Button>
                    </div>

                    <Textarea
                      id="content"
                      placeholder="Введите содержание статьи. Поддерживается Markdown форматирование:

**Жирный текст**
*Курсив*
- Списки
[Ссылки](URL)

## Заголовки

1. Нумерованные списки
2. Второй пункт"
                      rows={10}
                      value={formData.content}
                      onChange={(e) => handleInputChange("content", e.target.value)}
                      className={error && !formData.content ? "border-red-500" : ""}
                    />
                    {error && !formData.content && <p className="text-red-500 text-sm mt-1">Содержание обязательно</p>}
                  </div>
                ) : (
                  <div className="prose max-w-none border rounded p-4 bg-muted/50">
                    <ReactMarkdown>{formData.content || "_Нет содержимого_"}</ReactMarkdown>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Категория и теги */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Категория и теги</CardTitle>
                <CardDescription>Выберите категорию и добавьте теги для статьи</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Категория *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleInputChange("category", value)}
                    defaultValue=""
                    className={error && !formData.category ? "border-red-500" : ""}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите категорию" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {error && !formData.category && <p className="text-red-500 text-sm mt-1">Категория обязательна</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Теги</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="tags"
                      placeholder="Например: Exchange, Active Directory"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                    />
                    <Button type="button" variant="ghost" size="sm" onClick={addTag}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" onClick={() => removeTag(tag)}>
                        {tag}
                        <X className="w-4 h-4 ml-2 cursor-pointer" />
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Статус */}
            <Card>
              <CardHeader>
                <CardTitle>Статус</CardTitle>
                <CardDescription>Выберите статус статьи</CardDescription>
              </CardHeader>
              <CardContent>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange("status", value)}
                  defaultValue={formData.status}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите статус" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Черновик</SelectItem>
                    <SelectItem value="published">Опубликовано</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" className="flex-1 md:flex-none" disabled={loading}>
            {loading ? "Сохранение..." : "Сохранить статью"}
          </Button>
          <Button type="button" variant="outline" asChild disabled={loading}>
            <Link href="/knowledge-base">Отмена</Link>
          </Button>
        </div>
        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
      </form>
    </div>
  )
}
