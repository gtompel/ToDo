// Утилиты для проекта
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Универсальная функция для объединения классов tailwind и условных классов
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Функция для fetch с таймаутом
// Используется для предотвращения "зависания" запросов к серверу
export async function fetchWithTimeout(resource: RequestInfo, options: any = {}) {
  // Таймаут по умолчанию — 10 секунд
  const { timeout = 10000 } = options
  // Создаём AbortController для отмены запроса
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)
  try {
    // Выполняем fetch с поддержкой отмены
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal,
    })
    return response
  } finally {
    clearTimeout(id)
  }
}
