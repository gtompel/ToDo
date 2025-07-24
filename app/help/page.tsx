"use client";
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export default function HelpPage() {
  const [helpText, setHelpText] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/help').then(res => res.json()).then(data => {
      setHelpText(data.text || '');
      setLoading(false);
    });
    fetch('/api/users/me').then(res => res.json()).then(data => {
      setIsAdmin(data?.user?.role === 'ADMIN');
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    const res = await fetch('/api/help', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: helpText }),
    });
    if (!res.ok) {
      setError('Ошибка сохранения');
    } else {
      setEditMode(false);
    }
    setSaving(false);
  };

  if (loading) return <div className="p-8 text-center">Загрузка...</div>;

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">Справка</h1>
      {editMode ? (
        <>
          <Textarea
            className="w-full min-h-[300px] mb-4"
            value={helpText}
            onChange={e => setHelpText(e.target.value)}
          />
          {error && <div className="text-red-500 mb-2">{error}</div>}
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Сохранение...' : 'Сохранить'}</Button>
            <Button variant="ghost" onClick={() => setEditMode(false)} disabled={saving}>Отмена</Button>
          </div>
        </>
      ) : (
        <>
          <div className="prose whitespace-pre-line mb-6">{helpText || 'Справка пока не заполнена.'}</div>
          {isAdmin && (
            <Button onClick={() => setEditMode(true)}>Редактировать</Button>
          )}
        </>
      )}
    </div>
  );
} 