"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface ServiceFormValues {
  name: string;
  description: string;
  responsibleId: string;
  backupStaffIds: string[];
}

interface User {
  id: string;
  name: string;
  email: string;
  position: string | null;
}

export default function ServiceForm({ 
  initial, 
  onSuccess, 
  onCancel 
}: { 
  initial?: Partial<ServiceFormValues> & { id?: string };
  onSuccess: () => void;
  onCancel?: () => void;
}) {
  const [form, setForm] = useState<ServiceFormValues>({
    name: initial?.name || "",
    description: initial?.description || "",
    responsibleId: initial?.responsibleId || "",
    backupStaffIds: initial?.backupStaffIds || [],
  });
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  // Загружаем список пользователей
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/users?role=TECHNICIAN,ADMIN");
        const data = await res.json();
        setUsers(data.users);
      } catch (err) {
        console.error("Failed to fetch users:", err);
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить список пользователей",
          variant: "destructive",
        });
      }
    };

    fetchUsers();
  }, [toast]);

  const handleChange = (field: keyof ServiceFormValues, value: string | string[]) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const validate = () => {
    const requiredFields: (keyof ServiceFormValues)[] = ["name", "responsibleId"];
    for (const field of requiredFields) {
      if (!form[field]) return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ 
      name: true, 
      description: true, 
      responsibleId: true, 
      backupStaffIds: true 
    });
    
    if (!validate()) {
      setError("Пожалуйста, заполните все обязательные поля");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const method = initial ? "PUT" : "POST";
      const url = initial ? `/api/services/${initial.id}` : "/api/services";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Ошибка сохранения");
      }
      
      toast({
        title: initial ? "Сервис обновлён" : "Сервис создан",
        description: form.name,
      });
      
      onSuccess();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      toast({
        title: "Ошибка",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="block text-sm mb-1 font-medium" htmlFor="name">
          Наименование <span className="text-red-500">*</span>
        </label>
        <Input
          id="name"
          value={form.name}
          onChange={e => handleChange("name", e.target.value)}
          required
          aria-required
          className={touched.name && !form.name ? "border-red-500" : ""}
        />
        {touched.name && !form.name && (
          <div className="text-red-600 text-xs mt-1">Обязательное поле</div>
        )}
      </div>

      <div>
        <label className="block text-sm mb-1 font-medium" htmlFor="description">
          Описание
        </label>
        <Textarea
          id="description"
          value={form.description}
          onChange={e => handleChange("description", e.target.value)}
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm mb-1 font-medium" htmlFor="responsibleId">
          Ответственный <span className="text-red-500">*</span>
        </label>
        <Select
          value={form.responsibleId}
          onValueChange={value => handleChange("responsibleId", value)}
        >
          <SelectTrigger className={touched.responsibleId && !form.responsibleId ? "border-red-500" : ""}>
            <SelectValue placeholder="Выберите ответственного" />
          </SelectTrigger>
          <SelectContent>
            {users.map(user => (
              <SelectItem key={user.id} value={user.id}>
                {user.name} {user.position && `(${user.position})`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {touched.responsibleId && !form.responsibleId && (
          <div className="text-red-600 text-xs mt-1">Обязательное поле</div>
        )}
      </div>

      <div>
        <label className="block text-sm mb-1 font-medium" htmlFor="backupStaffIds">
          Дублирующие сотрудники
        </label>
        <Select
          value={form.backupStaffIds[0] || ""}
          onValueChange={value => handleChange("backupStaffIds", value ? [value] : [])}
        >
          <SelectTrigger>
            <SelectValue placeholder="Выберите дублирующего сотрудника" />
          </SelectTrigger>
          <SelectContent>
            {users.map(user => (
              <SelectItem key={user.id} value={user.id}>
                {user.name} {user.position && `(${user.position})`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="text-xs text-muted-foreground mt-1">
          Выберите сотрудника, который будет дублировать ответственного
        </div>
      </div>

      {error && <div className="text-red-600 text-sm">{error}</div>}

      <div className="flex gap-2 mt-4">
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Сохранение...
            </>
          ) : (
            "Сохранить"
          )}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Отмена
          </Button>
        )}
      </div>
    </form>
  );
}