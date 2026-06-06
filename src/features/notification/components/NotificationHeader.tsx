"use client";

import type { ReactNode } from "react";

export interface NotificationHeaderProps {
  title: string;
  badge?: ReactNode;
}

export function NotificationHeader({ title, badge }: NotificationHeaderProps) {
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-3">
      {badge}
      <h3 className="min-w-0 text-sm font-bold text-white">
        {title}
      </h3>
    </div>
  );
}


