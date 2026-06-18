"use client";

import { motion } from "framer-motion";
import { ArrowLeft, X, Reply } from "lucide-react";
import { useMemo } from "react";
import type { NotificationItem } from "@/features/notification/services/notificationService";
import { NotificationIcon } from "@/features/notification/components/NotificationIcon";

export interface NotificationDetailBoxProps {
  notification: NotificationItem;
  onClose: () => void;
  onMarkAsRead: (notification: NotificationItem) => void;
}

export function NotificationDetailBox({
  notification,
  onClose,
  onMarkAsRead,
}: NotificationDetailBoxProps) {
  const timestamp = useMemo(() => {
    const date = new Date(notification.createdAt);

    if (Number.isNaN(date.getTime())) {
      return "Just now";
    }

    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  }, [notification.createdAt]);

  const timeAgo = notification.timeAgo;

  return (
    <>
      <div 
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" 
        onClick={onClose}
      />
      <motion.aside
        role="dialog"
        aria-live="polite"
        aria-label={`Notification: ${notification.title}`}
        initial={{ opacity: 0, y: 18, x: "-50%", scale: 0.98 }}
        animate={{ opacity: 1, y: "-50%", x: "-50%", scale: 1 }}
        exit={{ opacity: 0, y: 18, x: "-50%", scale: 0.98 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="fixed left-1/2 top-1/2 z-50 flex w-[min(calc(100vw-2.5rem),36rem)] flex-col rounded-2xl border border-[#7C3AED]/30 bg-[#101114] p-6 text-left shadow-[0_0_80px_rgba(124,58,237,0.15)]"
      >
        <div className="flex items-center justify-between mb-4">
          {/* Invisible spacer to maintain center alignment of the icon */}
          <div className="h-8 w-8 shrink-0" />

          <div className="flex flex-col items-center flex-1 justify-center relative">
             <div className="scale-125 mb-4">
                <NotificationIcon tone={notification.tone} index={0} />
             </div>
             {!notification.isRead && (
               <span className="inline-flex h-6 items-center justify-center rounded bg-[#7C3AED] px-2.5 text-[11px] font-bold text-white mb-4">
                 New
               </span>
             )}
          </div>

          <button
            type="button"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#18181B] border border-[#27272A] text-[#A1A1AA] transition hover:text-white"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            {notification.title}
          </h2>
          <p className="text-sm text-[#A1A1AA]">
            {timeAgo} • {timestamp}
          </p>
        </div>

        <div className="rounded-xl border border-[#27272A] bg-[#101114] p-6 mb-6">
          {notification.description.split('\n').map((paragraph, index) => (
             <p key={index} className="text-sm leading-6 text-[#A1A1AA] mb-4 last:mb-0">
               {paragraph}
             </p>
          ))}
        </div>


      </motion.aside>
    </>
  );
}

