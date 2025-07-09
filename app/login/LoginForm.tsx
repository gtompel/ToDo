"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { loginAction } from "@/lib/actions/auth"
import { useRouter, useSearchParams } from "next/navigation"

export default function LoginForm({ initialError }: { initialError?: string }) {
  const [error, setError] = useState(initialError || "")
  const router = useRouter()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    const formData = new FormData(event.currentTarget)
    // @ts-ignore
    const res = await loginAction(formData)
    if (res?.error) {
      setError(res.error)
    }
    // если нет ошибки — редирект произойдёт на сервере, ничего делать не надо
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" placeholder="admin@example.com" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Пароль</Label>
        <Input id="password" name="password" type="password" placeholder="password" required />
      </div>
      <Button type="submit" className="w-full">
        Войти
      </Button>
    </form>
  )
} 