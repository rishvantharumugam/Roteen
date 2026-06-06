"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

export interface TermsButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
}

export function TermsButton({
  children,
  icon,
  variant = "secondary",
  className = "",
  ...props
}: TermsButtonProps) {
  const variantClass =
    variant === "primary"
      ? "flex items-center justify-center gap-2 rounded-xl bg-[#8B5CF6] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#7C3AED]"
      : variant === "ghost"
        ? `$"inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 bg-white/[0.05] text-slate-200 transition hover:bg-white/[0.09] hover:text-white" px-4 w-auto`
        : "flex items-center justify-center gap-2 rounded-xl bg-white/5 px-5 py-2.5 text-sm font-semibold text-zinc-300 transition-all hover:bg-white/10";

  return (
    <button
      type="button"
      className={`${variantClass} $"focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-500/25" ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}

