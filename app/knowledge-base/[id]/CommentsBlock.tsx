import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useCurrentUser } from "@/hooks/use-user"
import { useToast } from "@/components/ui/use-toast"
import { useConfirm } from "@/components/ui/confirm-dialog"

// Интерфейсы
interface User {
  id: string
  firstName?: string | null
  lastName?: string | null
  email?: string | null
}

interface Comment {
  id: string
  content: string
  createdAt: string
  user: User | null
}

interface Article {
  id: string
}

export default function CommentsBlock({ article, comments }: { article: Article, comments: Comment[] }) {
  const { user: currentUser } = useCurrentUser()
  const [comment, setComment] = useState("")
  const { toast } = useToast()
  const [localComments, setLocalComments] = useState<Comment[]>(comments)
  const { confirm, dialog } = useConfirm()
  const [pending, setPending] = useState(false)

  // Добавление комментария (optimistic UI)
  const submitComment = async () => {
    if (!comment.trim() || !currentUser) return
    const optimistic = {
      id: "optimistic-" + Date.now(),
      content: comment,
      createdAt: new Date().toISOString(),
      user: currentUser
    }
    setLocalComments((prev) => [...prev, optimistic])
    setComment("")
    setPending(true)
    try {
      const res = await fetch(`/api/articles/${article.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: optimistic.content })
      })
      if (!res.ok) {
        setLocalComments((prev) => prev.filter((c) => c.id !== optimistic.id))
        const data = await res.json()
        toast({ title: "Ошибка", description: data.error || "Не удалось добавить комментарий", variant: "destructive" })
        return
      }
      const data = await res.json()
      setLocalComments((prev) => prev.map((c) => c.id === optimistic.id ? data.comment : c))
      toast({ title: "Комментарий добавлен" })
    } catch {
      setLocalComments((prev) => prev.filter((c) => c.id !== optimistic.id))
      toast({ title: "Ошибка", description: "Не удалось добавить комментарий", variant: "destructive" })
    } finally {
      setPending(false)
    }
  }

  // Удаление комментария (только для админа)
  const handleDeleteComment = async (commentId: string) => {
    const ok = await confirm({ title: "Удалить комментарий?" })
    if (!ok) return
    const prev = localComments
    setLocalComments((prev) => prev.filter((c) => c.id !== commentId))
    try {
      const res = await fetch(`/api/articles/${article.id}/comments`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId })
      })
      if (!res.ok) {
        setLocalComments(prev)
        const data = await res.json()
        toast({ title: "Ошибка", description: data.error || "Не удалось удалить комментарий", variant: "destructive" })
        return
      }
      toast({ title: "Комментарий удалён" })
    } catch {
      setLocalComments(prev)
      toast({ title: "Ошибка", description: "Не удалось удалить комментарий", variant: "destructive" })
    }
  }

  return (
    <>
      {dialog}
      {/* Форма добавления комментария */}
      {currentUser ? (
        <div className="space-y-4">
          <Textarea
            placeholder="Поделитесь своим опытом или задайте вопрос..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            disabled={pending}
          />
          <Button onClick={submitComment} disabled={!comment.trim() || pending}>
            {pending ? "Добавление..." : "Добавить комментарий"}
          </Button>
        </div>
      ) : (
        <div className="text-muted-foreground">Войдите, чтобы оставить комментарий</div>
      )}
      <Separator />
      {/* Список комментариев */}
      {localComments.length === 0 ? (
        <div className="text-muted-foreground">Комментариев пока нет</div>
      ) : (
        <div className="space-y-4">
          {localComments.map((c) => (
            <div key={c.id} className="border-l-2 border-muted pl-4 space-y-2 opacity-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">
                    {c.user?.lastName || ''} {c.user?.firstName || ''}
                    {!c.user?.lastName && !c.user?.firstName ? c.user?.email : ''}
                  </span>
                  <span className="text-muted-foreground">{new Date(c.createdAt).toLocaleString()}</span>
                </div>
                {currentUser && currentUser.role === "ADMIN" && (
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteComment(c.id)}>
                    Удалить
                  </Button>
                )}
              </div>
              <p className="text-sm">{c.content}</p>
            </div>
          ))}
        </div>
      )}
    </>
  )
} 