"use client";

import type { ReactNode } from "react";

export interface NotificationHeaderSectionProps {
  children: ReactNode;
}

export function NotificationHeaderSection({
  children,
}: NotificationHeaderSectionProps) {
  return <>{children}</>;
}


