"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { loginAction } from "@/lib/actions/auth"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"

export default function LoginForm({ initialError }: { initialError?: string }) {
  const [error, setError] = useState(initialError || "")
  const [authType, setAuthType] = useState<'local' | 'ldap'>('local')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setLoading(true)
    const formData = new FormData(event.currentTarget)
    if (authType === 'local') {
      // @ts-ignore
      const res = await loginAction(formData)
      if (res?.error) setError(res.error)
      else if (res?.success) router.push("/")
    } else {
      // LDAP
      const login = formData.get('login') as string
      const password = formData.get('password') as string
      try {
        const res = await fetch('/api/auth/ldap-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ login, password })
        })
        const data = await res.json()
        if (!data.success) {
          // Логируем весь ответ для диагностики
          console.log('LDAP login error:', data)
        }
        if (res.ok && data.success) {
          window.location.href = "/"
        } else {
          setError(data.error || "Ошибка LDAP авторизации")
        }
      } catch (e: any) {
        setError(e?.message || "Ошибка LDAP авторизации")
      }
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} method="post" className="space-y-4">
      {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
      <div className="flex gap-4 mb-2">
        <label className="flex items-center gap-1">
          <input type="radio" name="authType" value="local" checked={authType === 'local'} onChange={() => setAuthType('local')} />
          Локальная учётная запись
        </label>
        <label className="flex items-center gap-1">
          <input type="radio" name="authType" value="ldap" checked={authType === 'ldap'} onChange={() => setAuthType('ldap')} />
          LDAP
        </label>
      </div>
      {authType === 'local' ? (
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="admin@example.com" autoComplete="email" required={authType === 'local'} autoFocus={authType === 'local'} />
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="login">Логин или email</Label>
          <Input id="login" name="login" type="text" autoComplete="username" placeholder="user или user@OIT.INT" required disabled={loading} autoFocus={authType === 'ldap'} />
        </div>
      )}
      <div className="space-y-2 relative">
        <Label htmlFor="password">Пароль</Label>
        <Input
          id="password"
          name="password"
          type={showPassword ? "text" : "password"}
          placeholder="password"
          autoComplete="current-password"
          required
        />
        <button
          type="button"
          tabIndex={-1}
          className="absolute right-2 top-9 text-gray-400 hover:text-gray-700"
          onClick={() => setShowPassword(v => !v)}
          aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      <Button type="submit" className="w-full" disabled={loading} aria-disabled={loading} aria-busy={loading}>
        {loading ? "Вход..." : "Войти"}
      </Button>
    </form>
  )
} 