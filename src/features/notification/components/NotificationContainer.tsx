"use client";

import type { ReactNode } from "react";

export interface NotificationContainerProps {
  children: ReactNode;
}

export function NotificationContainer({ children }: NotificationContainerProps) {
  return (
    <section className="w-full space-y-6">
      <div className="hidden" />
      <div className="relative">{children}</div>
    </section>
  );
}


