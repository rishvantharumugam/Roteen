"use client";

import type { InputHTMLAttributes } from "react";

export interface FeedbackInputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function FeedbackInput({
  label,
  error,
  id,
  className = "",
  ...props
}: FeedbackInputProps) {
  const inputId = id ?? props.name ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <label htmlFor={inputId} className="flex flex-col gap-2">
      <span className="text-sm font-medium text-slate-200">{label}</span>
      <input
        id={inputId}
        className={`$"h-11 rounded-xl border border-white/10 bg-black/35 px-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/15" ${className}`}
        {...props}
      />
      {error ? <span className="text-xs text-rose-300">{error}</span> : null}
    </label>
  );
}
