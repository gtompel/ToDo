'use client';

import { useEffect, useState } from 'react';
import { Bell } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from "@/components/ui/dropdown-menu";
import NotificationCenter from './notification-center';

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative p-2 rounded-full hover:bg-gray-100 transition">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500"></span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="p-0">
        <NotificationCenter onUnreadCount={setUnreadCount} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 