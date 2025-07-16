"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useCurrentUser } from "@/hooks/use-user"

export default function DraftsPage() {
  const { user: currentUser } = useCurrentUser()
  const [drafts, setDrafts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    setLoading(true)
    fetch("/api/articles")
      .then(r => r.json())
      .then(data => {
        let allDrafts = (data.articles || []).filter((a: any) => a.status === "draft")
        if (currentUser?.role !== "ADMIN") {
          allDrafts = allDrafts.filter((a: any) => a.authorId === currentUser?.id)
        }
        setDrafts(allDrafts)
      })
      .catch(() => setError("Ошибка загрузки черновиков"))
      .finally(() => setLoading(false))
  }, [currentUser])

  if (!currentUser) return <div className="p-8 text-center text-red-500">Требуется авторизация</div>
  if (loading) return <div className="p-8 text-center text-muted-foreground">Загрузка черновиков...</div>
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Мои черновики</h1>
        <Button asChild>
          <Link href="/knowledge-base/new">Создать статью</Link>
        </Button>
      </div>
      {drafts.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">Черновиков нет</CardContent></Card>
      ) : (
        <div className="grid gap-4">
          {drafts.map((article) => (
            <Card key={article.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-orange-100 text-orange-800">Черновик</Badge>
                  <span className="text-sm text-muted-foreground">{article.id}</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  <Link href={`/knowledge-base/${article.id}/edit`} className="hover:text-primary">
                    {article.title}
                  </Link>
                </h3>
                <div className="text-muted-foreground text-sm mb-2 line-clamp-2">{article.description}</div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {article.tags.map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                  ))}
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Обновлено: {article.updatedAt || article.updated}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 