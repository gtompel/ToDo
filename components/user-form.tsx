import { useState } from "react";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

const userSchema = z.object({
  email: z.string().email("Некорректный email"),
  firstName: z.string().min(2, "Имя слишком короткое"),
  lastName: z.string().min(2, "Фамилия слишком короткая"),
  middleName: z.string().optional(),
  phone: z.string().optional(),
  position: z.string().optional(),
  department: z.string().optional(),
  password: z.string().min(6, "Минимум 6 символов").optional(),
});

// Форма пользователя (создание/редактирование)
export function UserForm({ initial, loading, onSubmit, isLDAP, canEditRole }: { initial: any, loading: boolean, onSubmit: (data: any) => Promise<any>, isLDAP?: boolean, canEditRole?: boolean }) {
  // Состояния формы и ошибок
  const [form, setForm] = useState(initial || {});
  const [error, setError] = useState("");

  // Обработчик изменения поля
  const handleChange = (field: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [field]: value }));
  };

  // Обработчик отправки формы
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError("");
    const parsed = userSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.errors[0].message);
      return;
    }
    const res = await onSubmit(form);
    if (res.success) {
      toast({ title: "Успех", description: "Данные сохранены" });
    } else {
      setError(res.error || "Ошибка сохранения");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Email</Label>
        <Input value={form.email || ""} onChange={e => handleChange("email", e.target.value)} required readOnly={isLDAP} />
      </div>
      <div>
        <Label>Имя</Label>
        <Input value={form.firstName || ""} onChange={e => handleChange("firstName", e.target.value)} required readOnly={isLDAP} />
      </div>
      <div>
        <Label>Фамилия</Label>
        <Input value={form.lastName || ""} onChange={e => handleChange("lastName", e.target.value)} required readOnly={isLDAP} />
      </div>
      <div>
        <Label>Отчество</Label>
        <Input value={form.middleName || ""} onChange={e => handleChange("middleName", e.target.value)} readOnly={isLDAP} />
      </div>
      <div>
        <Label>Телефон</Label>
        <Input value={form.phone || ""} onChange={e => handleChange("phone", e.target.value)} readOnly={isLDAP} />
      </div>
      <div>
        <Label>Должность</Label>
        <Input value={form.position || ""} onChange={e => handleChange("position", e.target.value)} readOnly={isLDAP} />
      </div>
      <div>
        <Label>Отдел</Label>
        <Input value={form.department || ""} onChange={e => handleChange("department", e.target.value)} readOnly={isLDAP} />
      </div>
      {canEditRole && (
        <div>
          <Label>Роль</Label>
          <select
            className="border rounded px-2 py-1 w-full"
            value={form.role || "USER"}
            onChange={e => handleChange("role", e.target.value)}
          >
            <option value="USER">Пользователь</option>
            <option value="TECHNICIAN">Техник</option>
            <option value="MANAGER">Менеджер</option>
            <option value="ADMIN">Администратор</option>
          </select>
        </div>
      )}
      {!isLDAP && (
        <div>
          <Label>Пароль</Label>
          <Input type="password" value={form.password || ""} onChange={e => handleChange("password", e.target.value)} />
        </div>
      )}
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <div className="flex gap-4 mt-6">
        <Button type="submit" disabled={loading}>{loading ? "Сохранение..." : "Сохранить"}</Button>
      </div>
    </form>
  );
} 