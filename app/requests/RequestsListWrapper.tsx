'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';
import type { RequestItem } from './RequestsListClient';

const RequestsListClient = dynamic(() => import('./RequestsListClient'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <span className="animate-spin mr-2">⏳</span>Загрузка таблицы заявок...
      </div>
    </div>
  ),
});

interface UserLite { id: string; firstName: string; lastName: string; email: string }

interface RequestsListWrapperProps {
  requests: RequestItem[];
  isAdmin: boolean;
  assignableUsers: UserLite[];
  total: number;
  page: number;
  pageSize: number;
}

export default function RequestsListWrapper({
  requests,
  isAdmin,
  assignableUsers,
  total,
  page,
  pageSize,
}: RequestsListWrapperProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const shownRef = useRef(false);

  const pageCount = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  // Показ toast один раз и удаление параметров success/message из URL (с сохранением остальных параметров)
  useEffect(() => {
    if (shownRef.current) return;

    const currentSuccess = searchParams.get('success');
    const currentMessage = searchParams.get('message');

    if (currentSuccess === 'true' && currentMessage) {
      shownRef.current = true;
      toast({ title: 'Успешно!', description: currentMessage });

      // удалить success/message из url, сохранив остальные параметры
      const params = new URLSearchParams(Array.from(searchParams.entries()));
      params.delete('success');
      params.delete('message');

      const query = params.toString();
      const target = `/requests${query ? `?${query}` : ''}`;
      router.replace(target);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Если текущая страница вышла за пределы (например, после смены pageSize), перенаправляем на последний доступный
  useEffect(() => {
    if (page > pageCount) {
      const params = new URLSearchParams(Array.from(searchParams.entries()));
      params.set('page', String(pageCount));
      params.set('pageSize', String(pageSize));
      router.replace(`/requests?${params.toString()}`);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageCount, pageSize]);

  const updateQuery = useCallback(
    (next: { page?: number; pageSize?: number }) => {
      const params = new URLSearchParams(Array.from(searchParams.entries()));
      if (next.page != null) params.set('page', String(next.page));
      if (next.pageSize != null) params.set('pageSize', String(next.pageSize));
      router.push(`/requests?${params.toString()}`);
    },
    [searchParams, router]
  );

  const handlePageChange = useCallback((newPage: number) => updateQuery({ page: newPage }), [updateQuery]);
  const handlePageSizeChange = useCallback((newSize: number) => updateQuery({ page: 1, pageSize: newSize }), [updateQuery]);

  const visibleFrom = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const visibleTo = Math.min(page * pageSize, total);

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
          {total === 0 ? 'Нет записей' : `${visibleFrom}-${visibleTo} из ${total} записей`}
        </div>

        <div className="flex items-center gap-2">
          <button
            aria-label="Первая страница"
            onClick={() => handlePageChange(1)}
            disabled={page === 1}
            className="px-2 py-1 border rounded disabled:opacity-50"
          >
            «
          </button>

          <button
            aria-label="Предыдущая страница"
            onClick={() => handlePageChange(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-2 py-1 border rounded disabled:opacity-50"
          >
            ‹
          </button>

          <span className="text-sm">
            {page} / {pageCount}
          </span>

          <button
            aria-label="Следующая страница"
            onClick={() => handlePageChange(Math.min(pageCount, page + 1))}
            disabled={page === pageCount}
            className="px-2 py-1 border rounded disabled:opacity-50"
          >
            ›
          </button>

          <button
            aria-label="Последняя страница"
            onClick={() => handlePageChange(pageCount)}
            disabled={page === pageCount}
            className="px-2 py-1 border rounded disabled:opacity-50"
          >
            »
          </button>

          <select
            aria-label="Размер страницы"
            value={pageSize}
            onChange={e => handlePageSizeChange(Number(e.target.value))}
            className="ml-2 px-2 py-1 border rounded"
          >
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
