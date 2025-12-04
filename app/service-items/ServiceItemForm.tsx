"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface ServiceItemFormValues {
  code: string;
  owner: string;
  systemName: string;
  supportCode: string;
  supportName: string;
  card: string;
  passport: string;
  note: string;
}

export default function ServiceItemForm({ 
  initial, 
  onSuccess, 
  onCancel 
}: { 
  initial?: Partial<ServiceItemFormValues> & { id?: string };
  onSuccess: () => void;
  onCancel?: () => void;
}) {
  const [form, setForm] = useState<ServiceItemFormValues>({
    code: initial?.code || "",
    owner: initial?.owner || "",
    systemName: initial?.systemName || "",
    supportCode: initial?.supportCode || "",
    supportName: initial?.supportName || "",
    card: initial?.card || "",
    passport: initial?.passport || "",
    note: initial?.note || "",
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const handleChange = (field: keyof ServiceItemFormValues, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const validate = () => {
    const requiredFields: (keyof ServiceItemFormValues)[] = ["code", "owner", "systemName"];
    for (const field of requiredFields) {
      if (!form[field]) return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ 
      code: true, 
      owner: true, 
      systemName: true, 
      supportCode: true, 
      supportName: true, 
      card: true, 
      passport: true, 
      note: true 
    });
    
    if (!validate()) {
      setError("Пожалуйста, заполните все обязательные поля");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const method = initial ? "PUT" : "POST";
      const url = initial ? `/api/service-items/${initial.id}` : "/api/service-items";
      
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
        title: initial ? "Услуга обновлена" : "Услуга создана",
        description: `Код: ${form.code}`,
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
        <label className="block text-sm mb-1 font-medium" htmlFor="code">
          Код <span className="text-red-500">*</span>
        </label>
        <Input
          id="code"
          value={form.code}
          onChange={e => handleChange("code", e.target.value)}
          required
          aria-required
          className={touched.code && !form.code ? "border-red-500" : ""}
        />
        {touched.code && !form.code && (
          <div className="text-red-600 text-xs mt-1">Обязательное поле</div>
        )}
      </div>

      <div>
        <label className="block text-sm mb-1 font-medium" htmlFor="owner">
          Владелец <span className="text-red-500">*</span>
        </label>
        <Input
          id="owner"
          value={form.owner}
          onChange={e => handleChange("owner", e.target.value)}
          required
          aria-required
          className={touched.owner && !form.owner ? "border-red-500" : ""}
        />
        {touched.owner && !form.owner && (
          <div className="text-red-600 text-xs mt-1">Обязательное поле</div>
        )}
      </div>

      <div>
        <label className="block text-sm mb-1 font-medium" htmlFor="systemName">
          Наименование системы <span className="text-red-500">*</span>
        </label>
        <Input
          id="systemName"
          value={form.systemName}
          onChange={e => handleChange("systemName", e.target.value)}
          required
          aria-required
          className={touched.systemName && !form.systemName ? "border-red-500" : ""}
        />
        {touched.systemName && !form.systemName && (
          <div className="text-red-600 text-xs mt-1">Обязательное поле</div>
        )}
      </div>

      <div>
        <label className="block text-sm mb-1 font-medium" htmlFor="supportCode">
          Код сопровождения
        </label>
        <Input
          id="supportCode"
          value={form.supportCode}
          onChange={e => handleChange("supportCode", e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm mb-1 font-medium" htmlFor="supportName">
          Наименование сопровождения
        </label>
        <Input
          id="supportName"
          value={form.supportName}
          onChange={e => handleChange("supportName", e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm mb-1 font-medium" htmlFor="card">
          Карточка
        </label>
        <Input
          id="card"
          value={form.card}
          onChange={e => handleChange("card", e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm mb-1 font-medium" htmlFor="passport">
          Паспорт
        </label>
        <Input
          id="passport"
          value={form.passport}
          onChange={e => handleChange("passport", e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm mb-1 font-medium" htmlFor="note">
          Примечание
        </label>
        <Textarea
          id="note"
          value={form.note}
          onChange={e => handleChange("note", e.target.value)}
          rows={3}
        />
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