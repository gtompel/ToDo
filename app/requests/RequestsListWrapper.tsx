"use client";
import dynamic from 'next/dynamic';
import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';
import type { RequestItem } from './RequestsListClient';

const RequestsListClient = dynamic(() => import('./RequestsListClient'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-64"><div className="text-center"><span className="animate-spin mr-2">⏳</span>Загрузка таблицы заявок...</div></div>,
});

type UserLite = { id: string; firstName: string; lastName: string; email: string }

type RequestsListWrapperProps = {
  requests: RequestItem[];
  isAdmin: boolean;
  assignableUsers: UserLite[];
  total: number;
  page: number;
  pageSize: number;
}

export default function RequestsListWrapper({ requests, isAdmin, assignableUsers, total, page, pageSize }: RequestsListWrapperProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageCount = Math.ceil(total / pageSize);

  // Обработка URL параметров для показа уведомлений
  const currentSuccess = searchParams.get('success');
  const currentMessage = searchParams.get('message');
  const shownRef = useRef(false);

  useEffect(() => {
  if (shownRef.current) return;
  if (currentSuccess === 'true' && currentMessage) {
  shownRef.current = true;
  toast({ title: 'Успешно!', description: currentMessage });
  router.replace('/requests', { scroll: false });
  }
  }, [currentSuccess, currentMessage, router]);

  const handlePageChange = (newPage: number) => {
    router.push(`/requests?page=${newPage}&pageSize=${pageSize}`);
  };
  const handlePageSizeChange = (newSize: number) => {
    router.push(`/requests?page=1&pageSize=${newSize}`);
  };

  return (
    <div>
      <RequestsListClient
        requests={requests}
        isAdmin={isAdmin}
        assignableUsers={assignableUsers}
        total={total}
        pageSize={pageSize}
      />
      <div className="flex items-center justify-between px-6 py-4 border-t bg-muted">
        <div className="text-sm text-gray-600">
          {total === 0 ? 'Нет записей' : `${(page - 1) * pageSize + 1}-${Math.min(page * pageSize, total)} из ${total} записей`}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => handlePageChange(1)} disabled={page === 1} className="px-2 py-1 border rounded disabled:opacity-50">«</button>
          <button onClick={() => handlePageChange(Math.max(1, page - 1))} disabled={page === 1} className="px-2 py-1 border rounded disabled:opacity-50">‹</button>
          <span className="text-sm">{page} / {pageCount}</span>
          <button onClick={() => handlePageChange(Math.min(pageCount, page + 1))} disabled={page === pageCount} className="px-2 py-1 border rounded disabled:opacity-50">›</button>
          <button onClick={() => handlePageChange(pageCount)} disabled={page === pageCount} className="px-2 py-1 border rounded disabled:opacity-50">»</button>
          <select value={pageSize} onChange={e => handlePageSizeChange(Number(e.target.value))} className="ml-2 px-2 py-1 border rounded">
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span className="text-sm text-gray-600">/ стр.</span>
        </div>
      </div>
    </div>
  );
} 