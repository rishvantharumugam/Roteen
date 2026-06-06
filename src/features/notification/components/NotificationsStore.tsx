"use client";

import { AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getNotificationsController } from "@/features/notification/actions/notificationController";
import { navigateToNotifications } from "@/features/notification/constants/notificationNavigation";
import type {
  NotificationItem,
  NotificationsPageData,
} from "@/features/notification/services/notificationService";
import { EmptyNotification } from "@/features/notification/components/EmptyNotification";
import { LoadingSkeleton } from "@/features/notification/components/LoadingSkeleton";
import { NotificationDetailBox } from "@/features/notification/components/NotificationDetailBox";
import { NotificationsHeaderStore } from "@/features/notification/components/NotificationsHeaderStore";
import { NotificationsPage } from "@/features/notification/components/NotificationsPage";

export function NotificationsStore() {
  const router = useRouter();
  const [pageData, setPageData] = useState<NotificationsPageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNotification, setSelectedNotification] =
    useState<NotificationItem | null>(null);

  useEffect(() => {
    let isSubscribed = true;

    async function loadNotifications() {
      setIsLoading(true);
      setError(null);

      const response = await getNotificationsController();

      if (!isSubscribed) {
        return;
      }

      if (!response.ok) {
        setError(response.message);
        setIsLoading(false);
        return;
      }

      setPageData(response.data);
      setIsLoading(false);
    }

    void loadNotifications();

    return () => {
      isSubscribed = false;
    };
  }, []);

  function handleRetry() {
    navigateToNotifications(router, { replace: true });
    window.location.reload();
  }

  function handleNotificationSelect(notification: NotificationItem) {
    setSelectedNotification(notification);
    navigateToNotifications(router, { notificationId: notification.id });
  }

  function handleMarkAsRead(notification: NotificationItem) {
    const readNotification = { ...notification, isRead: true };

    setSelectedNotification(readNotification);
    setPageData((current) => {
      if (!current) {
        return current;
      }

      const notifications = current.notifications.map((item) =>
        item.id === notification.id ? readNotification : item,
      );

      return {
        ...current,
        notifications,
        unreadCount: notifications.filter((item) => !item.isRead).length,
      };
    });
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
              message={error}
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
          pageData ?? {
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

