import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Phone, Building } from "lucide-react";

export function UserProfileCard({ user }: { user: any }) {
  const fullName = [user.lastName, user.firstName, user.middleName].filter(Boolean).join(" ");
  const initials = [user.lastName, user.firstName, user.middleName].filter(Boolean).map((n: string) => n[0]).join("");
  return (
    <Card>
      <CardHeader>
        <CardTitle>Профиль</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.avatarUrl || "/placeholder-user.jpg"} alt={fullName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <div className="text-xl font-bold">{fullName}</div>
            <div className="text-muted-foreground text-sm flex items-center gap-2">
              <Mail className="w-4 h-4" /> {user.email}
            </div>
            {user.phone && <div className="text-muted-foreground text-sm flex items-center gap-2"><Phone className="w-4 h-4" /> {user.phone}</div>}
            {user.department && <div className="text-muted-foreground text-sm flex items-center gap-2"><Building className="w-4 h-4" /> {user.department}</div>}
            {user.position && <div className="text-muted-foreground text-sm">{user.position}</div>}
            <div className="text-xs mt-2">Статус: <span className="font-semibold">{user.status}</span></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 