"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserForm } from "@/components/user-form"
import { fetchWithTimeout } from "@/lib/utils"

// Тип для пользователя
interface User {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  middleName?: string | undefined
  phone?: string | null
  department?: string | null
  position?: string | null
  password?: string | null
  // Добавьте другие поля, если они есть в вашем API
}

// Тип для ответа API /api/users/me
interface UserProfileResponse {
  user: User
  // Другие поля, если есть (например, permissions, roles и т.д.)
}

// Тип для полей, передаваемых в updateUser
interface UpdateUserFields {
  firstName?: string | null
  lastName?: string | null
  phone?: string | null
  department?: string | null
  position?: string | null
  currentPassword?: string
  newPassword?: string
  confirmPassword?: string
}

export default function ProfileSettingsPage() {
  const [user, setUser] = useState<UserProfileResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    async function loadUser() {
      setLoading(true)
      setError("")
      try {
        const res = await fetchWithTimeout("/api/users/me")
        if (!res.ok) throw new Error("Ошибка загрузки профиля")
        const data: UserProfileResponse = await res.json()
        setUser(data)
      } catch (e) {
        if (e instanceof Error) {
          setError(e.message)
        } else {
          setError("Неизвестная ошибка")
        }
      } finally {
        setLoading(false)
      }
    }
    loadUser()
  }, [])

  const updateUser = async (fields: UpdateUserFields) => {
    setLoading(true)
    setError("")
    try {
      const res = await fetchWithTimeout("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        throw new Error(data.error || "Ошибка сохранения")
      }

      setUser((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          user: { ...prev.user, ...fields },
        }
      })

      return { success: true }
    } catch (e) {
      let errorMessage = "Ошибка сохранения"
      if (e instanceof Error) {
        errorMessage = e.message
      }
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  if (loading && !user) {
    return <div className="p-8 text-center text-muted-foreground">Загрузка...</div>
  }

  if (error && !user) {
    return <div className="p-8 text-center text-red-500">{error}</div>
  }

  if (!user) {
    return <div className="p-8 text-center text-muted-foreground">Пользователь не найден</div>
  }

  const isLDAP = !user.user.password || user.user.password === ""

  return (
    <div className="max-w-xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Настройки профиля</CardTitle>
        </CardHeader>
        <CardContent>
        <UserForm
            initial={{
              email: user.user.email,
              firstName: user.user.firstName || undefined,
              lastName: user.user.lastName || undefined,
              middleName: user.user.middleName || undefined,
              phone: user.user.phone || undefined,
              department: user.user.department || undefined,
              position: user.user.position || undefined,
            }}
            loading={loading}
            onSubmit={updateUser}
            isLDAP={isLDAP}
          />
        </CardContent>
      </Card>
    </div>
  )
}