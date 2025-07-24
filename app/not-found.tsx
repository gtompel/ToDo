import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-8">
      <AlertTriangle className="w-20 h-20 text-primary mb-6" />
      <h1 className="text-4xl font-bold mb-2">Страница не найдена</h1>
      <p className="text-lg text-muted-foreground mb-6">Возможно, вы ошиблись адресом или страница была удалена.</p>
      <Link href="/" className="px-6 py-3 rounded bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition">На главную</Link>
    </div>
  );
} 