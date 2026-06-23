"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

export interface TutorialButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode;
  variant?: "primary" | "secondary" | "brand";
}

export function TutorialButton({
  children,
  icon,
  variant = "secondary",
  className = "",
  ...props
}: TutorialButtonProps) {
  let variantClasses = "";
  if (variant === "primary") {
    variantClasses = "flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#d946ef] to-[#7c3aed] px-4 py-3 text-[15px] font-semibold text-white shadow-[0_8px_20px_rgba(124,58,237,0.3)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_10px_25px_rgba(124,58,237,0.4)] disabled:opacity-50";
  } else if (variant === "brand") {
    variantClasses = "flex items-center justify-center gap-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(124,58,237,0.25)] transition-all duration-200 hover:scale-[1.01] disabled:opacity-50";
  } else {
    variantClasses = "flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10";
  }

  return (
    <button
      type="button"
      className={`${variantClasses} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}

