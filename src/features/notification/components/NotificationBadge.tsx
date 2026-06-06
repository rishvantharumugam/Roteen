"use client";


export interface NotificationBadgeProps {
  children: string;
}

export function NotificationBadge({ children }: NotificationBadgeProps) {
  return <span className="inline-flex h-6 items-center justify-center rounded bg-[#7C3AED] px-2 text-[11px] font-bold text-white">{children}</span>;
}


