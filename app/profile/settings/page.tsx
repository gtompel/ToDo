"use client"
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserForm } from "@/components/user-form";
import { fetchWithTimeout } from "@/lib/utils";

// Страница настроек профиля пользователя
export default function ProfileSettingsPage() {
  // Состояния пользователя, загрузки и ошибки
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Загрузка данных текущего пользователя при монтировании
  useEffect(() => {
    async function loadUser() {
      setLoading(true);
      setError("");
      try {
        // Получение данных текущего пользователя
        const res = await fetchWithTimeout("/api/users/me");
        if (!res.ok) throw new Error("Ошибка загрузки профиля");
        const data = await res.json();
        setUser(data);
      } catch (e: any) {
        setError(e.message || "Ошибка");
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  // Обновление профиля пользователя
  const updateUser = async (fields: any) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchWithTimeout("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Ошибка сохранения");
      setUser((prev: any) => ({ ...prev, ...fields }));
      return { success: true };
    } catch (e: any) {
      setError(e.message || "Ошибка сохранения");
      return { success: false, error: e.message };
    } finally {
      setLoading(false);
    }
  };

  if (loading && !user) return <div className="p-8 text-center text-muted-foreground">Загрузка...</div>;
  if (error && !user) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!user) return <div className="p-8 text-center text-muted-foreground">Пользователь не найден</div>;

  // Признак LDAP-пользователя: пароль пустой
  const isLDAP = !user?.user?.password || user?.user?.password === '';

  return (
    <div className="max-w-xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Настройки профиля</CardTitle>
        </CardHeader>
        <CardContent>
          <UserForm
            initial={user.user}
            loading={loading}
            onSubmit={updateUser}
            isLDAP={isLDAP}
          />
        </CardContent>
      </Card>
    </div>
  );
} 