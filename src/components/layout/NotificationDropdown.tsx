"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MessageSquare, Calendar, CheckCircle, Bell, Loader2 } from "lucide-react";
import { appRoutes } from "@/constants/AppRoutes";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { notificationsService } from "@/features/notification/services/notificationService";

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.notifications,
    queryFn: () => notificationsService.fetchNotificationsPage(),
    staleTime: 1000 * 60, // 1 minute
  });

  const notifications = data?.data?.notifications ?? [];
  const unreadCount = data?.data?.unreadCount ?? 0;

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Node) || menuRef.current?.contains(target)) {
        return;
      }
      setIsOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const getIcon = (tone: string) => {
    switch (tone) {
      case "violet":
        return (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-purple-400">
            <MessageSquare className="h-5 w-5" />
          </div>
        );
      case "rose":
      case "red":
      case "amber":
        return (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-red-400">
            <Calendar className="h-5 w-5" />
          </div>
        );
      case "emerald":
      case "green":
      case "cyan":
        return (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
            <CheckCircle className="h-5 w-5" />
          </div>
        );
      default:
        return (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-blue-400">
            <Bell className="h-5 w-5" />
          </div>
        );
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        aria-label="Notifications"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative text-[#A1A1AA] transition-colors hover:text-white"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-[380px] overflow-hidden rounded-xl border border-zinc-800 bg-[#121212] shadow-2xl">
          <div className="flex items-center justify-between border-b border-zinc-800/50 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">Notifications</span>
              {unreadCount > 0 && (
                <span className="flex h-5 items-center justify-center rounded-full bg-[#7C3AED] px-2 text-[11px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </div>
            <Link
              href={appRoutes.notifications}
              onClick={() => setIsOpen(false)}
              className="text-xs font-medium text-[#7C3AED] hover:text-[#9353d3] transition-colors"
            >
              View all
            </Link>
          </div>

          <div className="flex max-h-[400px] flex-col overflow-y-auto no-scrollbar">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
                <Loader2 className="mb-2 h-6 w-6 animate-spin text-[#7C3AED]" />
                <p className="text-sm font-medium text-zinc-300">Loading notifications...</p>
              </div>
            ) : notifications.length > 0 ? (
              notifications.slice(0, 3).map((notification) => (
                <Link
                  href={`${appRoutes.notifications}?id=${notification.id}`}
                  onClick={() => setIsOpen(false)}
                  key={notification.id}
                  className="flex items-start gap-4 border-b border-zinc-800/50 p-4 transition-colors hover:bg-zinc-800/20 last:border-0 cursor-pointer"
                >
                  {getIcon(notification.tone)}
                  <div className="flex flex-1 flex-col gap-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-zinc-100 line-clamp-1">{notification.title}</p>
                      <span className="shrink-0 text-[11px] font-medium text-zinc-500">
                        {notification.timeAgo}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed text-zinc-400 line-clamp-2">
                      {notification.description}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <div className="mt-1.5 flex shrink-0 items-center justify-center">
                      <span className="h-2 w-2 rounded-full bg-[#7C3AED]" />
                    </div>
                  )}
                </Link>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
                <Bell className="mb-2 h-8 w-8 text-zinc-600" />
                <p className="text-sm font-medium text-zinc-300">No notifications</p>
                <p className="mt-1 text-xs text-zinc-500">You're all caught up!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
