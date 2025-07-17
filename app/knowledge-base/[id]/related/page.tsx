import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default async function RelatedArticlesPage({ params }: { params: { id: string } }) {
  const { id } = params
  const baseUrl = process.env.BASE_URL || "http://localhost:3000"
  const res = await fetch(`${baseUrl}/api/articles/${id}/related`, { cache: "no-store" })
  const data = await res.json()
  const related = data.articles || []

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Связанные статьи</h1>
      {related.length === 0 ? (
        <div className="text-muted-foreground">Нет связанных статей</div>
      ) : (
        <div className="grid gap-4">
          {related.map((article: any) => (
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
        </div>
      )}
      <div className="mt-6">
        <Link href={`/knowledge-base/${id}`} className="text-blue-600 hover:underline">Назад к статье</Link>
      </div>
    </div>
  )
} 