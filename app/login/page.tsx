import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import LoginForm from "./LoginForm"
import { headers } from "next/headers"

export default async function LoginPage() {
  const user = await getCurrentUser()
  if (user) redirect("/")

  // Получаем searchParams из URL через headers (headers() теперь async)
  const hdrs = await headers()
  const urlHeader = hdrs.get("x-url")
  let error = ""
  if (urlHeader) {
    try {
      const url = new URL(urlHeader, "http://localhost")
      error = url.searchParams.get("error") || ""
    } catch {}
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Вход в систему</CardTitle>
          <CardDescription>Введите ваши учетные данные для входа в ITSM систему</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm initialError={error} />
          <div className="mt-6 text-center">
            <a href="/register" className="text-blue-600 hover:underline">Нет аккаунта? Зарегистрироваться</a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}