import { useState } from "react";
import type { FormEvent, ChangeEvent } from "react";
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
  role: z.enum(["USER", "TECHNICIAN", "MANAGER", "ADMIN"]).optional(),
});

type FormValues = z.infer<typeof userSchema>;

type SubmitResult = { success: boolean; error?: string };

type UserFormProps = {
  initial?: Partial<FormValues>;
  loading: boolean;
  onSubmit: (data: FormValues) => Promise<SubmitResult>;
  isLDAP?: boolean;
  canEditRole?: boolean;
};

export function UserForm({
  initial,
  loading,
  onSubmit,
  isLDAP = false,
  canEditRole = false,
}: UserFormProps) {
  const defaults: FormValues = {
    email: "",
    firstName: "",
    lastName: "",
    middleName: undefined,
    phone: undefined,
    position: undefined,
    department: undefined,
    password: undefined,
    role: "USER",
  };

  const [form, setForm] = useState<FormValues>({ ...defaults, ...(initial ?? {}) });
  const [error, setError] = useState<string>("");

  // универсальный сеттер поля
  const handleChange = <K extends keyof FormValues>(field: K, value: FormValues[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleInputChange = (field: keyof FormValues) => (e: ChangeEvent<HTMLInputElement>) => {
    // Все поля, которые приходят из <Input> — строковые
    handleChange(field, e.target.value as FormValues[typeof field]);
  };

  const handleSelectChange = (field: keyof FormValues) => (e: ChangeEvent<HTMLSelectElement>) => {
    handleChange(field, e.target.value as FormValues[typeof field]);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const parsed = userSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? "Ошибка валидации");
      return;
    }

    const res = await onSubmit(form);
    if (res.success) {
      toast({ title: "Успех", description: "Данные сохранены" });
    } else {
      setError(res.error ?? "Ошибка сохранения");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Email</Label>
        <Input
          value={form.email ?? ""}
          onChange={handleInputChange("email")}
          required
          readOnly={isLDAP}
        />
      </div>

      <div>
        <Label>Имя</Label>
        <Input
          value={form.firstName ?? ""}
          onChange={handleInputChange("firstName")}
          required
          readOnly={isLDAP}
        />
      </div>

      <div>
        <Label>Фамилия</Label>
        <Input
          value={form.lastName ?? ""}
          onChange={handleInputChange("lastName")}
          required
          readOnly={isLDAP}
        />
      </div>

      <div>
        <Label>Отчество</Label>
        <Input
          value={form.middleName ?? ""}
          onChange={handleInputChange("middleName")}
          readOnly={isLDAP}
        />
      </div>

      <div>
        <Label>Телефон</Label>
        <Input value={form.phone ?? ""} onChange={handleInputChange("phone")} readOnly={isLDAP} />
      </div>

      <div>
        <Label>Должность</Label>
        <Input
          value={form.position ?? ""}
          onChange={handleInputChange("position")}
          readOnly={isLDAP}
        />
      </div>

      <div>
        <Label>Отдел</Label>
        <Input
          value={form.department ?? ""}
          onChange={handleInputChange("department")}
          readOnly={isLDAP}
        />
      </div>

      {canEditRole && (
        <div>
          <Label>Роль</Label>
          <select
            className="border rounded px-2 py-1 w-full"
            value={form.role ?? "USER"}
            onChange={handleSelectChange("role")}
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
          <Input
            type="password"
            value={form.password ?? ""}
            onChange={handleInputChange("password")}
          />
        </div>
      )}

      {error && <div className="text-red-500 text-sm">{error}</div>}

      <div className="flex gap-4 mt-6">
        <Button type="submit" disabled={loading}>
          {loading ? "Сохранение..." : "Сохранить"}
        </Button>
      </div>
    </form>
  );
}
