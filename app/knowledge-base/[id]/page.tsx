import ArticlePageClient from "./ArticlePageClient"

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || ""
  // Инкремент просмотров
  await fetch(`${baseUrl}/api/articles/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ view: true })
  })
  const res = await fetch(`${baseUrl}/api/articles/${id}/full`, { cache: 'no-store' })
  const data = await res.json()
  return <ArticlePageClient article={data.article} comments={data.comments} />
}
