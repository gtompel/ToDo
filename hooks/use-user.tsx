// Хук для работы с пользователем: загрузка, обновление, состояния
import { useState, useCallback, useEffect } from "react";
import { fetchWithTimeout } from "@/lib/utils";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error("Ошибка запроса");
  return res.json();
});

// Кастомный хук для получения и управления пользователем по id
export function useUser(userId?: string) {
  const { data, error, isLoading, mutate } = useSWR(userId ? `/api/users/${userId}` : null, fetcher);

  // Обновление пользователя
  const updateUser = async (fields: any) => {
    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fields, id: userId, action: "update" }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Ошибка сохранения");
      mutate(); // обновить кэш
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  };

  return { user: data, loading: isLoading, error: error?.message, updateUser, refresh: mutate };
}

// Хук для получения текущего пользователя по JWT (auth-token)
export function useCurrentUser() {
  const { data, error, isLoading, mutate } = useSWR("/api/auth/me", fetcher);
  return { user: data, loading: isLoading, error: error?.message, refresh: mutate };
} 