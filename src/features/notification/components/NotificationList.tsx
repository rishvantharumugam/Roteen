"use client";

import type { NotificationItem } from "@/features/notification/services/notificationService";
import { NotificationCard } from "@/features/notification/components/NotificationCard";

export interface NotificationListProps {
  notifications: NotificationItem[];
  onNotificationSelect: (notification: NotificationItem) => void;
}

export function NotificationList({
  notifications,
  onNotificationSelect,
}: NotificationListProps) {
  return (
    <div className="grid gap-3 sm:gap-3.5">
      {notifications.map((notification, index) => (
        <NotificationCard
          key={notification.id}
          notification={notification}
          index={index}
          onSelect={onNotificationSelect}
        />
      ))}
    </div>
  );
}


