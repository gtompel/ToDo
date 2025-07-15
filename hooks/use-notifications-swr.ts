import useSWR from 'swr';

export type Notification = {
  id: string;
  title: string;
  message: string;
  type?: string;
  priority?: string;
  status?: string;
  timestamp?: string;
  sender?: string;
  recipient?: string;
  channels?: string[];
  read?: boolean;
  createdAt?: string;
};

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useNotificationsSWR() {
  const { data, error, isLoading, mutate } = useSWR<Notification[]>('/api/notifications', fetcher, {
    refreshInterval: 10000, // автообновление каждые 10 сек
  });
  return {
    notifications: data || [],
    isLoading,
    isError: !!error,
    mutate,
  };
} 