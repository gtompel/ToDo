import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function RelatedArticlesBlock({ articleId, tags }: { articleId: string, tags: string[] }) {
  const [related, setRelated] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!tags || tags.length === 0) {
      setRelated([])
      setLoading(false)
      return
    }
    setLoading(true)
    fetch(`/api/articles/${articleId}/related`)
      .then(r => r.json())
      .then(data => setRelated(data.articles || []))
      .finally(() => setLoading(false))
  }, [articleId, tags])

  if (loading) return <div className="text-muted-foreground">Загрузка связанных статей...</div>
  if (!related || related.length === 0) return <div className="text-muted-foreground">Нет связанных статей</div>

  const showAllUrl = `/knowledge-base/${articleId}/related`

  return (
    <div className="grid gap-3">
      {related.slice(0, 5).map(article => (
        <Card key={article.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <Link href={`/knowledge-base/${article.id}`} className="font-medium hover:text-primary">
              {article.title}
            </Link>
            <div className="text-muted-foreground text-xs mb-2 line-clamp-2">{article.description}</div>
            <div className="flex flex-wrap gap-1">
              {article.tags.map((tag: string) => (
                <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
      {related.length > 5 && (
        <Link href={showAllUrl} className="text-blue-600 hover:underline text-sm mt-2">Показать все связанные статьи</Link>
      )}
    </div>
  )
} 