"use client";

import { motion } from "framer-motion";
import type { NotificationItem } from "@/features/notification/services/notificationService";
import { NotificationBadge } from "@/features/notification/components/NotificationBadge";
import { NotificationDot } from "@/features/notification/components/NotificationDot";
import { NotificationHeader } from "@/features/notification/components/NotificationHeader";
import { NotificationIcon } from "@/features/notification/components/NotificationIcon";
import { NotificationTime } from "@/features/notification/components/NotificationTime";

export interface NotificationCardProps {
  notification: NotificationItem;
  index: number;
  onSelect: (notification: NotificationItem) => void;
}

export function NotificationCard({
  notification,
  index,
  onSelect,
}: NotificationCardProps) {
  return (
    <motion.article
      id={notification.id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay: index * 0.035 }}
      className="group relative overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[#101114] p-5 transition duration-300 hover:border-[#7C3AED]/30"
    >
      <button
        type="button"
        className="flex w-full min-w-0 items-center gap-4 text-left"
        onClick={() => onSelect(notification)}
      >
        <NotificationIcon tone={notification.tone} index={index} />

        <div className="flex-1 min-w-0">
          <NotificationHeader
            title={notification.title}
            badge={!notification.isRead && index === 0 ? <NotificationBadge>New</NotificationBadge> : undefined}
          />
          <p className="mt-1 text-sm text-[#A1A1AA]">
            {notification.description}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <NotificationTime value={notification.timeAgo} />
          {!notification.isRead ? <NotificationDot /> : <span className="w-2" />}
        </div>
      </button>
    </motion.article>
  );
}

