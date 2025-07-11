// Хук для работы с пользователем: загрузка, обновление, состояния
import { useState, useCallback } from "react";
import { fetchWithTimeout } from "@/lib/utils";

// Кастомный хук для получения и управления пользователем по id
export function useUser(userId?: string) {
  // Состояние пользователя
  const [user, setUser] = useState<any>(null);
  // Состояние загрузки
  const [loading, setLoading] = useState(false);
  // Состояние ошибки
  const [error, setError] = useState("");

  // Загрузка пользователя по id
  const loadUser = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetchWithTimeout(`/api/users/${userId}`);
      if (!res.ok) throw new Error("Ошибка загрузки пользователя");
      const data = await res.json();
      setUser(data);
    } catch (e: any) {
      setError(e.message || "Ошибка");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Обновление пользователя
  const updateUser = useCallback(async (fields: any) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchWithTimeout("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fields, id: userId, action: "update" }),
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
  }, [userId]);

  // Возвращаем состояния и методы для работы с пользователем
  return { user, loading, error, loadUser, updateUser };
} 