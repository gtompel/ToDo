"use client";
import dynamic from 'next/dynamic';
import { useState } from 'react';

const RequestsListClient = dynamic(() => import('./RequestsListClient'), {
  loading: () => <div className="flex items-center justify-center h-64"><div className="text-center"><span className="animate-spin mr-2">⏳</span>Загрузка таблицы заявок...</div></div>,
});

export default function RequestsListWrapper({ requests, isAdmin, assignableUsers }: any) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const pageCount = Math.ceil(requests.length / pageSize);
  const pagedRequests = requests.slice((page - 1) * pageSize, page * pageSize);
  return (
    <div>
      <RequestsListClient requests={pagedRequests} isAdmin={isAdmin} assignableUsers={assignableUsers} />
      <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
        <div className="text-sm text-gray-600">
          {requests.length === 0 ? 'Нет записей' : `${(page - 1) * pageSize + 1}-${Math.min(page * pageSize, requests.length)} из ${requests.length} записей`}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setPage(1)} disabled={page === 1} className="px-2 py-1 border rounded disabled:opacity-50">«</button>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-2 py-1 border rounded disabled:opacity-50">‹</button>
          <span className="text-sm">{page} / {pageCount}</span>
          <button onClick={() => setPage(p => Math.min(pageCount, p + 1))} disabled={page === pageCount} className="px-2 py-1 border rounded disabled:opacity-50">›</button>
          <button onClick={() => setPage(pageCount)} disabled={page === pageCount} className="px-2 py-1 border rounded disabled:opacity-50">»</button>
          <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }} className="ml-2 px-2 py-1 border rounded">
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