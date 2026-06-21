"use client";

import { AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { navigateToNotifications } from "@/features/notification/constants/notificationNavigation";
import {
  notificationsService,
  type NotificationItem,
  type NotificationsPageData,
  type NotificationsServiceResult,
} from "@/features/notification/services/notificationService";
import { EmptyNotification } from "@/features/notification/components/EmptyNotification";
import { LoadingSkeleton } from "@/features/notification/components/LoadingSkeleton";
import { NotificationDetailBox } from "@/features/notification/components/NotificationDetailBox";
import { NotificationsHeaderStore } from "@/features/notification/components/NotificationsHeaderStore";
import { NotificationsPage } from "@/features/notification/components/NotificationsPage";

export function NotificationsStore() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedNotification, setSelectedNotification] =
    useState<NotificationItem | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.notifications,
    queryFn: () => notificationsService.fetchNotificationsPage(),
    staleTime: 1000 * 60, // 1 minute
  });

  const notificationsData = data?.data;

  useEffect(() => {
    if (!notificationsData) return;

    let targetId = new URLSearchParams(window.location.search).get("id");
    if (!targetId && window.location.hash) {
      targetId = decodeURIComponent(window.location.hash.substring(1));
    }

    if (targetId) {
      const match = notificationsData.notifications.find((n) => String(n.id) === targetId);
      if (match) {
        setSelectedNotification(match);
        if (!match.isRead) {
          handleMarkAsRead(match);
          void notificationsService.markAsRead(match.id);
        }
      }
    }
  }, [notificationsData]);

  function handleRetry() {
    navigateToNotifications(router, { replace: true });
    void refetch();
  }

  function handleNotificationSelect(notification: NotificationItem) {
    setSelectedNotification(notification);
    navigateToNotifications(router, { notificationId: notification.id });
    if (!notification.isRead) {
      handleMarkAsRead(notification);
      void notificationsService.markAsRead(notification.id);
    }
  }

  function handleMarkAsRead(notification: NotificationItem) {
    const readNotification = { ...notification, isRead: true };

    setSelectedNotification(readNotification);

    // Update React Query cache synchronously
    queryClient.setQueryData<NotificationsServiceResult<NotificationsPageData>>(
      queryKeys.notifications,
      (current) => {
        if (!current) return current;

        const notifications = current.data.notifications.map((item) =>
          item.id === notification.id ? readNotification : item,
        );

        return {
          ...current,
          data: {
            ...current.data,
            notifications,
            unreadCount: notifications.filter((item) => !item.isRead).length,
          },
        };
      }
    );
  }

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="bg-black min-h-screen  text-white font-sans">
        <div className="hidden" />
        <NotificationsHeaderStore />
        <main className="w-full max-w-5xl mx-auto px-6 py-8">
          <div className="flex flex-col gap-4">
            <EmptyNotification
              title="Error loading notifications"
              message={error instanceof Error ? error.message : "Something went wrong"}
              actionLabel="Retry"
              onAction={handleRetry}
            />
          </div>
        </main>
      </div>
    );
  }

  return (
    <>
      <NotificationsPage
        pageData={
          notificationsData ?? {
            notifications: [],
            unreadCount: 0,
            totalCount: 0,
          }
        }
        onNotificationSelect={handleNotificationSelect}
      />
      <AnimatePresence>
        {selectedNotification ? (
          <NotificationDetailBox
            key={selectedNotification.id}
            notification={selectedNotification}
            onClose={() => setSelectedNotification(null)}
            onMarkAsRead={handleMarkAsRead}
          />
        ) : null}
      </AnimatePresence>
    </>
  );
}

