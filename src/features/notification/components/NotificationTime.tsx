"use client";

export interface NotificationTimeProps {
  value: string;
}

export function NotificationTime({ value }: NotificationTimeProps) {
  return <time className="shrink-0 text-xs text-[#A1A1AA]">{value}</time>;
}


