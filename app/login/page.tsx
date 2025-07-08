import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { loginAction } from "@/lib/actions/auth"

export default async function LoginPage({ searchParams }: { searchParams?: { error?: string } }) {
  const user = await getCurrentUser()
  if (user) redirect("/")
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Вход в систему</CardTitle>
          <CardDescription>Введите ваши учетные данные для входа в ITSM систему</CardDescription>
        </CardHeader>
        <CardContent>
          {searchParams?.error && <div className="text-red-500 text-sm mb-2">{searchParams.error}</div>}
          <form action={loginAction} className="space-y-4">
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
          <div className="mt-6 text-center">
            <a href="/register" className="text-blue-600 hover:underline">Нет аккаунта? Зарегистрироваться</a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}