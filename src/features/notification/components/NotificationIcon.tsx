"use client";

import {
  Bell,
  BookOpen,
  FileText,
  Gift,
  GraduationCap,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import type { NotificationTone } from "@/features/notification/services/notificationService";

export interface NotificationIconProps {
  tone: NotificationTone;
  index: number;
}

interface ToneConfig {
  icon: LucideIcon;
}

const configs: Record<NotificationTone, ToneConfig> = {
  violet: { icon: GraduationCap },
  blue: { icon: FileText },
  emerald: { icon: BookOpen },
  amber: { icon: Gift },
  rose: { icon: ShieldCheck },
  cyan: { icon: Bell },
};

export function NotificationIcon({ tone }: NotificationIconProps) {
  const config = configs[tone];
  const Icon = config.icon;

  return (
    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[#0A0A0A] text-[#7C3AED]">
      <Icon className="h-5 w-5" strokeWidth={2} />
    </span>
  );
}

