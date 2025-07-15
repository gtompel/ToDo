import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Activity } from "lucide-react";

function formatDate(date?: string | Date | null) {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (!d || isNaN(d.getTime())) return '-';
  return d.toLocaleString('ru-RU');
}

export function UserActivityCard({ user }: { user: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Активность
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Последний вход:</span>
          <span className="text-sm font-medium">{formatDate(user.lastLogin)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Последняя активность:</span>
          <span className="text-sm font-medium">{formatDate(user.lastActivity)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Смена пароля:</span>
          <span className="text-sm font-medium">{formatDate(user.passwordLastChanged)}</span>
        </div>
      </CardContent>
    </Card>
  );
} 