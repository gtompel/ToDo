import { Badge } from "@/components/ui/badge"

export default function RelatedArticlesBlock({ tags }: { tags: string[] }) {
  // Здесь можно реализовать fetch связанных статей по тегам, пока просто выводим теги
  if (!tags || tags.length === 0) {
    return <div className="text-muted-foreground">Нет связанных статей</div>
  }
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <Badge key={tag} className="bg-gray-100 text-gray-800 rounded px-2 py-0.5 text-xs">{tag}</Badge>
      ))}
    </div>
  )
} 