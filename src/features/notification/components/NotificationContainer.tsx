"use client";

import type { ReactNode } from "react";

export interface NotificationContainerProps {
  children: ReactNode;
}

export function NotificationContainer({ children }: NotificationContainerProps) {
  return (
    <section className={"w-full max-w-2xl mx-auto space-y-4"}>
      <div className="hidden" />
      <div className="relative">{children}</div>
    </section>
  );
}


