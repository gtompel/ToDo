import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

type PageProps = { params: { id: string } }
type RelatedArticle = { id: string; title: string; description?: string; tags: string[] }

export default async function RelatedArticlesPage(props: PageProps) {
  const { id } = props?.params || ({} as { id: string })
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || ""
  const res = await fetch(`${baseUrl}/api/articles/${id}/related`, { cache: "no-store" })
  const data = await res.json()
  const related: RelatedArticle[] = Array.isArray(data.articles) ? data.articles : []

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Связанные статьи</h1>
      {related.length === 0 ? (
        <div className="text-muted-foreground">Нет связанных статей</div>
      ) : (
        <div className="grid gap-4">
          {related.map((article) => (
            <Card key={article.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <Link href={`/knowledge-base/${article.id}`} className="font-medium hover:text-primary">
                  {article.title}
                </Link>
                <div className="text-muted-foreground text-xs mb-2 line-clamp-2">{article.description}</div>
                <div className="flex flex-wrap gap-1">
                  {article.tags.map((tag) => (
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