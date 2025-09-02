"use client";
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';

const IncidentsListClient = dynamic(() => import('./IncidentsListClient'), {
  loading: () => <div className="flex items-center justify-center h-64"><div className="text-center"><span className="animate-spin mr-2">⏳</span>Загрузка инцидентов...</div></div>,
});

function parseIntOrDefault(val: any, def: number) {
  const n = parseInt(val, 10);
  return isNaN(n) ? def : n;
}

export default function IncidentsListWrapper({ isAdmin, assignableUsers }: any) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = parseIntOrDefault(searchParams.get('page'), 1);
  const pageSize = parseIntOrDefault(searchParams.get('pageSize'), 10);

  const [incidents, setIncidents] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Обработка URL параметров для показа уведомлений
  const currentSuccess = searchParams.get('success');
  const currentMessage = searchParams.get('message');
  const shownRef = useRef(false);

  useEffect(() => {
  if (shownRef.current) return;
  if (currentSuccess === 'true' && currentMessage) {
  shownRef.current = true;
  toast.success('Успешно!', { description: currentMessage });
  router.replace('/incidents', { scroll: false });
  }
  }, [currentSuccess, currentMessage, router]);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/incidents?page=${page}&pageSize=${pageSize}`)
      .then(res => res.json())
      .then(({ data, total }) => {
        setIncidents(data);
        setTotal(total);
        setLoading(false);
      });
  }, [page, pageSize]);

  const pageCount = Math.ceil(total / pageSize);

  const handlePageChange = (newPage: number) => {
    router.push(`/incidents?page=${newPage}&pageSize=${pageSize}`);
  };
  const handlePageSizeChange = (newSize: number) => {
    router.push(`/incidents?page=1&pageSize=${newSize}`);
  };

  return (
    <div>
      {loading ? (
        <div className="flex items-center justify-center h-64">Загрузка...</div>
      ) : (
        <IncidentsListClient 
          incidents={incidents} 
          isAdmin={isAdmin} 
          assignableUsers={assignableUsers} 
        />
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