"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { registerUser } from "@/lib/actions/auth"
import { useState } from "react"

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)

  async function handleRegister(formData: FormData) {
    setError(null)
    setSuccess(false)
    const password = formData.get("password") as string
    const confirm = formData.get("confirm") as string
    if (password !== confirm) {
      setError("Пароли не совпадают")
      return
    }
    const res = await registerUser(formData)
    if (res?.error) setError(res.error)
    else setSuccess(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Регистрация</CardTitle>
          <CardDescription>Создайте новый аккаунт для доступа к ITSM системе</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="user@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="firstName">Имя</Label>
              <Input id="firstName" name="firstName" type="text" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Фамилия</Label>
              <Input id="lastName" name="lastName" type="text" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Подтверждение пароля</Label>
              <Input id="confirm" name="confirm" type="password" required />
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            {success && <div className="text-green-600 text-sm">Регистрация успешна! Теперь вы можете войти.</div>}
            <Button type="submit" className="w-full">
              Зарегистрироваться
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 