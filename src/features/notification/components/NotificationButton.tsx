"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

export interface NotificationButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode;
  variant?: "primary" | "secondary";
}

export function NotificationButton({
  children,
  icon,
  variant = "secondary",
  className = "",
  ...props
}: NotificationButtonProps) {
  return (
    <button
      type="button"
      className={`${variant === "primary" ? "flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#d946ef] to-[#7c3aed] px-4 py-3 text-[15px] font-semibold text-white shadow-[0_8px_20px_rgba(124,58,237,0.3)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_10px_25px_rgba(124,58,237,0.4)] disabled:opacity-50" : "flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}


