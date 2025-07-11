import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import LoginForm from "./LoginForm"

export default async function LoginPage({ searchParams }: { searchParams?: URLSearchParams }) {
  const user = await getCurrentUser()
  if (user) redirect("/")

  let error = ""
  if (searchParams && typeof searchParams.get === "function") {
    error = searchParams.get("error") || ""
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
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