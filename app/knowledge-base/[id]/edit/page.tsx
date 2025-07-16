"use client"

import { useEffect, useState, use as usePromise } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import ReactMarkdown from "react-markdown"
import { useToast } from "@/components/ui/use-toast"

export default function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = usePromise(params)
  const router = useRouter()
  const [formData, setFormData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [deleteError, setDeleteError] = useState("")
  const [previewMode, setPreviewMode] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setLoading(true)
    fetch(`/api/articles/${id}`)
      .then(r => r.json())
      .then(data => setFormData(data.article))
      .catch(() => setError("Ошибка загрузки статьи"))
      .finally(() => setLoading(false))
  }, [id])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")
    if (!formData.title || !formData.content) {
      setError("Заполните обязательные поля")
      setSaving(false)
      return
    }
    // Приводим tags к массиву строк
    const submitData = {
      ...formData,
      tags: Array.isArray(formData.tags)
        ? formData.tags
        : (typeof formData.tags === "string" ? formData.tags.split(",").map((t: string) => t.trim()).filter(Boolean) : []),
    }
    try {
      const res = await fetch(`/api/articles/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Ошибка сохранения")
        toast({ title: "Ошибка", description: data.error || "Ошибка сохранения", variant: "destructive" })
        setSaving(false)
        return
      }
      toast({ title: "Сохранено", description: "Статья обновлена!" })
      router.push(`/knowledge-base/${id}`)
    } catch {
      setError("Ошибка сохранения")
      toast({ title: "Ошибка", description: "Ошибка сохранения", variant: "destructive" })
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Удалить статью?")) return
    setDeleteError("")
    setSaving(true)
    try {
      const res = await fetch(`/api/articles/${id}`, { method: "DELETE" })
      if (!res.ok) {
        const data = await res.json()
        setDeleteError(data.error || "Ошибка удаления")
        toast({ title: "Ошибка", description: data.error || "Ошибка удаления", variant: "destructive" })
        setSaving(false)
        return
      }
      toast({ title: "Удалено", description: "Статья удалена" })
      router.push("/knowledge-base")
    } catch {
      setDeleteError("Ошибка удаления")
      toast({ title: "Ошибка", description: "Ошибка удаления", variant: "destructive" })
      setSaving(false)
    }
  }

  if (loading) return <div className="p-8 text-center text-muted-foreground">Загрузка...</div>
  if (error || !formData) return <div className="p-8 text-center text-red-500">{error || "Статья не найдена"}</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/knowledge-base/${id}`}>
            ←
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Редактирование статьи</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Основная информация</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Заголовок *</Label>
              <Input id="title" value={formData.title} onChange={e => handleInputChange("title", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Описание</Label>
              <Textarea id="description" value={formData.description || ""} onChange={e => handleInputChange("description", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Категория</Label>
              <Input id="category" value={formData.category || ""} onChange={e => handleInputChange("category", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Теги (через запятую)</Label>
              <Input id="tags" value={Array.isArray(formData.tags) ? formData.tags.join(", ") : (formData.tags || "")} onChange={e => handleInputChange("tags", e.target.value.split(",").map((t: string) => t.trim()).filter(Boolean))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Статус</Label>
              <select
                id="status"
                className="border rounded px-2 py-1"
                value={formData.status || "draft"}
                onChange={e => handleInputChange("status", e.target.value)}
              >
                <option value="draft">Черновик</option>
                <option value="published">Опубликовано</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Содержание *</Label>
              <div className="flex gap-2 mb-2">
                <Button type="button" variant={previewMode ? "outline" : "secondary"} size="sm" onClick={() => setPreviewMode(false)}>Редактирование</Button>
                <Button type="button" variant={previewMode ? "secondary" : "outline"} size="sm" onClick={() => setPreviewMode(true)}>Предпросмотр</Button>
              </div>
              {!previewMode ? (
                <Textarea id="content" value={formData.content} onChange={e => handleInputChange("content", e.target.value)} rows={10} required />
              ) : (
                <div className="prose max-w-none border rounded p-4 bg-muted/50">
                  <ReactMarkdown>{formData.content || "_Нет содержимого_"}</ReactMarkdown>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        <div className="flex gap-4">
          <Button type="submit" disabled={saving}>{saving ? "Сохранение..." : "Сохранить"}</Button>
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={saving}>Удалить</Button>
          <Button type="button" variant="outline" asChild disabled={saving}>
            <Link href={`/knowledge-base/${id}`}>Отмена</Link>
          </Button>
        </div>
        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
        {deleteError && <div className="text-red-500 text-sm mt-2">{deleteError}</div>}
      </form>
    </div>
  )
} 