// app/changes/ChangesListWrapper.tsx
"use client";
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import ChangesListClient from './ChangesListClient';
import type { Change, User } from '@/app/types/change';

export default function ChangesListWrapper({
  isAdmin,
  assignees,
}: {
  isAdmin: boolean;
  assignees: User[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);

  const [changes, setChanges] = useState<Change[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/changes?page=${page}&pageSize=${pageSize}`)
      .then(res => res.json())
      .then(({ data, total }) => {
        setChanges(data);
        setTotal(total);
        setLoading(false);
      });
  }, [page, pageSize]);

  const pageCount = Math.ceil(total / pageSize);

  const handlePageChange = (newPage: number) => {
    router.push(`/changes?page=${newPage}&pageSize=${pageSize}`);
  };
  
  const handlePageSizeChange = (newSize: number) => {
    router.push(`/changes?page=1&pageSize=${newSize}`);
  };

  return (
    <div>
      {loading ? (
        <div className="flex items-center justify-center h-64">Загрузка...</div>
      ) : (
        <ChangesListClient changes={changes} isAdmin={isAdmin} assignees={assignees} />
      )}
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