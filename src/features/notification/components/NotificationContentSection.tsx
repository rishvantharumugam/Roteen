"use client";

import type { NotificationItem, NotificationsPageData } from "@/features/notification/services/notificationService";
import { NotificationHeroSection } from "@/features/notification/components/NotificationHeroSection";
import { NotificationListSection } from "@/features/notification/components/NotificationListSection";

export interface NotificationContentSectionProps {
  pageData: NotificationsPageData;
  onNotificationSelect: (notification: NotificationItem) => void;
}

export function NotificationContentSection({
  pageData,
  onNotificationSelect,
}: NotificationContentSectionProps) {
  return (
    <div className="flex flex-col gap-6">
      <NotificationHeroSection pageData={pageData} />
      <NotificationListSection
        notifications={pageData.notifications}
        onNotificationSelect={onNotificationSelect}
      />
    </div>
  );
}


