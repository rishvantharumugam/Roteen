"use client";

import type { NotificationItem, NotificationsPageData } from "@/features/notification/services/notificationService";
import { NotificationsHeaderStore } from "@/features/notification/components/NotificationsHeaderStore";
import { NotificationContainer } from "@/features/notification/components/NotificationContainer";
import { NotificationContentSection } from "@/features/notification/components/NotificationContentSection";

export interface NotificationsPageProps {
  pageData: NotificationsPageData;
  onNotificationSelect: (notification: NotificationItem) => void;
}

export function NotificationsPage({
  pageData,
  onNotificationSelect,
}: NotificationsPageProps) {
  return (
    <div className="bg-black min-h-screen  text-white font-sans">
      <div className="hidden" />
      <div className="hidden" />
      <div className="hidden" />
      <NotificationsHeaderStore />
      <main className="mx-auto flex w-full max-w-[1260px] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <NotificationContainer>
          <NotificationContentSection
            pageData={pageData}
            onNotificationSelect={onNotificationSelect}
          />
        </NotificationContainer>
      </main>
    </div>
  );
}


