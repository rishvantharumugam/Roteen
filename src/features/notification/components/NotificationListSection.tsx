"use client";

import type { NotificationItem } from "@/features/notification/services/notificationService";
import { EmptyNotification } from "@/features/notification/components/EmptyNotification";
import { NotificationList } from "@/features/notification/components/NotificationList";

export interface NotificationListSectionProps {
  notifications: NotificationItem[];
  onNotificationSelect: (notification: NotificationItem) => void;
}

export function NotificationListSection({
  notifications,
  onNotificationSelect,
}: NotificationListSectionProps) {
  if (!notifications.length) {
    return (
      <EmptyNotification
        title="No notifications yet"
        message="Important announcements and activity updates will appear here when they are available."
      />
    );
  }

  return (
    <section className="mt-0">
      <NotificationList
        notifications={notifications}
        onNotificationSelect={onNotificationSelect}
      />
    </section>
  );
}

