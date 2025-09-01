import React, { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Loader2, BotIcon, CheckCircle2, XCircle, Minus, X } from 'lucide-react';

const AI_API_URL = process.env.NEXT_PUBLIC_AI_API_URL || 'http://172.16.8.200:11434';

interface AiAssistantChatProps {
  open: boolean;
  onClose: () => void;
}

interface Message {
  role: 'user' | 'ai';
  text: string;
}

export const AiAssistantChat: React.FC<AiAssistantChatProps> = ({ open, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'checking' | 'ok' | 'fail'>('checking');
  const [minimized, setMinimized] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Сохраняем историю в памяти (session)
  useEffect(() => {
    if (open) {
      const saved = sessionStorage.getItem('ai-chat-history');
      if (saved) setMessages(JSON.parse(saved));
    }
  }, [open]);
  useEffect(() => {
    if (open) sessionStorage.setItem('ai-chat-history', JSON.stringify(messages));
  }, [messages, open]);

  useEffect(() => {
    if (!open) return;
    setStatus('checking');
    fetch(`/api/ai/tags`)
      .then(r => r.ok ? setStatus('ok') : setStatus('fail'))
      .catch(() => setStatus('fail'));
  }, [open]);

  useEffect(() => {
    if (open && inputRef.current && !minimized) inputRef.current.focus();
  }, [open, minimized]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, minimized]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const question = input.trim();
    setMessages(msgs => [...msgs, { role: 'user', text: question }]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch(`/api/ai/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'mistral', prompt: question, stream: false })
      });
      if (!res.ok) throw new Error('Ошибка AI');
      const data = await res.json();
      setMessages(msgs => [...msgs, { role: 'ai', text: data.response || 'Нет ответа' }]);
    } catch (e) {
      setMessages(msgs => [...msgs, { role: 'ai', text: 'Ошибка получения ответа от AI' }]);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;
  if (minimized) {
    return (
      <div className="fixed bottom-6 left-24 z-[100] animate-fade-in">
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-xl transition-all duration-200 outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
          title="Развернуть AI ассистент"
          aria-label="Развернуть AI ассистент"
          onClick={() => setMinimized(false)}
        >
          <BotIcon size={28} />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 w-full max-w-md z-[100] animate-fade-in">
      <div className="mx-auto my-8 bg-background rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden relative animate-fade-in">
        <div className="flex items-center gap-2 px-6 py-4 border-b bg-blue-50 dark:bg-blue-950/20">
          <BotIcon className="text-blue-600" />
          <div className="text-base font-bold text-foreground">AI ассистент</div>
          <span className="ml-auto flex items-center gap-1 text-xs text-foreground">
            {status === 'checking' && <Loader2 className="animate-spin w-4 h-4 text-muted-foreground" />}
            {status === 'ok' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
            {status === 'fail' && <XCircle className="w-4 h-4 text-red-500" />}
            {status === 'ok' ? 'Подключено' : status === 'fail' ? 'Нет связи' : 'Проверка...'}
          </span>
          <button className="ml-2 p-1 rounded hover:bg-blue-100 dark:hover:bg-blue-900/20" title="Свернуть" onClick={() => setMinimized(true)}><Minus size={18} /></button>
          <button className="ml-1 p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/20" title="Закрыть" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="flex flex-col h-96 px-6 py-4 overflow-y-auto bg-background transition-all duration-200">
          {messages.length === 0 && (
            <div className="text-muted-foreground text-center my-auto select-none">Введите вопрос для AI...</div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`mb-2 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`rounded-2xl px-4 py-2 max-w-[80%] text-sm shadow ${msg.role === 'user' ? 'bg-blue-100 text-blue-900 dark:bg-blue-950/20 dark:text-blue-100' : 'bg-muted text-foreground'}`}>{msg.text}</div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start mb-2">
              <div className="rounded-2xl px-4 py-2 max-w-[80%] text-sm bg-muted text-foreground flex items-center gap-2">
                <span className="block w-2 h-2 bg-blue-400 rounded-full animate-pulse mr-1" />
                <span className="block w-2 h-2 bg-blue-300 rounded-full animate-pulse mr-1 delay-100" />
                <span className="block w-2 h-2 bg-blue-200 rounded-full animate-pulse delay-200" />
                <span className="ml-2 text-xs text-muted-foreground">AI печатает...</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        <form
          className="flex gap-2 border-t px-6 py-4 bg-background"
          onSubmit={e => { e.preventDefault(); sendMessage(); }}
        >
          <Input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Введите вопрос..."
            disabled={loading || status !== 'ok'}
            className="flex-1"
            autoFocus
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          />
          <Button type="submit" disabled={loading || status !== 'ok' || !input.trim()}>
            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : 'Отправить'}
          </Button>
        </form>
      </div>
    </div>
  );
};
