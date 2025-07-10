"use client"
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/hooks/use-user";
import { UserForm } from "@/components/user-form";

export default function EditUserPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const { user, loading, error, loadUser, updateUser } = useUser(id);

  useEffect(() => { loadUser(); }, [loadUser]);

  if (loading && !user) return <div className="p-8 text-center text-muted-foreground">Загрузка...</div>;
  if (error && !user) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!user) return <div className="p-8 text-center text-muted-foreground">Пользователь не найден</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Редактирование пользователя</CardTitle>
        </CardHeader>
        <CardContent>
          <UserForm
            initial={user}
            loading={loading}
            onSubmit={async (fields) => {
              // Обновление пользователя с обработкой ошибок
              const res = await updateUser(fields);
              if (res.success) router.push(`/users/${id}`);
              return res;
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
} 