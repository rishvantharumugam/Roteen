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
      <main className="w-full max-w-5xl mx-auto px-6 py-8">
        <div className="flex flex-col gap-4">
          <NotificationContainer>
            <NotificationContentSection
              pageData={pageData}
              onNotificationSelect={onNotificationSelect}
            />
          </NotificationContainer>
        </div>
      </main>
    </div>
  );
}


