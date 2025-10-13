"use client";
import { useEffect } from "react";
import { Bug } from "lucide-react";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-8">
      <Bug className="w-20 h-20 text-primary mb-6" />
      <h1 className="text-4xl font-bold mb-2">Что-то пошло не так</h1>
      <p className="text-lg text-muted-foreground mb-6">Произошла непредвиденная ошибка. Попробуйте обновить страницу или вернуться на главную.</p>
      <div className="flex gap-4">
        <button onClick={() => reset()} className="px-6 py-3 rounded bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition">Обновить страницу</button>
        <a href="/" className="px-6 py-3 rounded bg-muted text-foreground font-semibold hover:bg-muted/80 transition">На главную</a>
      </div>
    </div>
  );
} 