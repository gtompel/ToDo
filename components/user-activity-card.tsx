import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Activity } from "lucide-react";

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
          <span className="text-sm font-medium">{user.lastLogin || "-"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Последняя активность:</span>
          <span className="text-sm font-medium">{user.lastActivity || "-"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Смена пароля:</span>
          <span className="text-sm font-medium">{user.passwordLastChanged || "-"}</span>
        </div>
      </CardContent>
    </Card>
  );
} 