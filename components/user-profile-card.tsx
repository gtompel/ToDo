import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Phone, Building } from "lucide-react";

export interface User {
  id?: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  middleName?: string | null;
  phone?: string | null;
  position?: string | null;
  department?: string | null;
  role?: string | null;
  status?: string | null;
  isActive?: boolean;
  avatarUrl?: string | null;
}

type Props = {
  user: User;
};

export function UserProfileCard({ user }: Props) {
  const nameParts = [user.lastName, user.firstName, user.middleName].filter(
    (p): p is string => Boolean(p && p.trim())
  );

  const fullName = nameParts.join(" ");
  const initials = nameParts
    .map((n) => n.trim()[0]?.toUpperCase())
    .filter(Boolean)
    .join("");

  const avatarSrc = user.avatarUrl?.trim() || "/placeholder-user.jpg";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Профиль</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={avatarSrc} alt={fullName || user.email} />
            <AvatarFallback>{initials || user.email[0]?.toUpperCase() || "?"}</AvatarFallback>
          </Avatar>

          <div>
            <div className="text-xl font-bold">{fullName || user.email}</div>

            <div className="text-muted-foreground text-sm flex items-center gap-2">
              <Mail className="w-4 h-4" /> {user.email}
            </div>

            {user.phone && (
              <div className="text-muted-foreground text-sm flex items-center gap-2">
                <Phone className="w-4 h-4" /> {user.phone}
              </div>
            )}

            {user.department && (
              <div className="text-muted-foreground text-sm flex items-center gap-2">
                <Building className="w-4 h-4" /> {user.department}
              </div>
            )}

            {user.position && (
              <div className="text-muted-foreground text-sm">{user.position}</div>
            )}

            <div className="text-xs mt-2">
              Статус: <span className="font-semibold">{user.status ?? "—"}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
