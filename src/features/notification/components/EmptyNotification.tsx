"use client";

import { BellOff, RefreshCw } from "lucide-react";
import { NotificationButton } from "@/features/notification/components/NotificationButton";

export interface EmptyNotificationProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyNotification({
  title,
  message,
  actionLabel,
  onAction,
}: EmptyNotificationProps) {
  return (
    <div className={`group relative overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[#0A0A0A] p-5 transition duration-300 hover:border-[#7C3AED]/30 py-8 text-center sm:py-9`}>
      <BellOff className="mx-auto h-10 w-10 text-violet-300" />
      <h2 className="mt-3 text-base font-semibold text-white sm:text-lg">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
        {message}
      </p>
      {actionLabel && onAction ? (
        <NotificationButton
          className="mt-5"
          icon={<RefreshCw className="h-4 w-4" />}
          onClick={onAction}
        >
          {actionLabel}
        </NotificationButton>
      ) : null}
    </div>
  );
}

