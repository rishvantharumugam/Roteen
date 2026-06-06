"use client";

import type { TextareaHTMLAttributes } from "react";

export interface FeedbackTextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export function FeedbackTextarea({
  label,
  error,
  id,
  className = "",
  ...props
}: FeedbackTextareaProps) {
  const inputId = id ?? props.name ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <label htmlFor={inputId} className="flex flex-col gap-2">
      <span className="text-sm font-medium text-slate-200">{label}</span>
      <textarea
        id={inputId}
        className={`$"min-h-32 resize-none rounded-xl border border-white/10 bg-black/35 px-3 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-500 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/15" ${className}`}
        {...props}
      />
      {error ? <span className="text-xs text-rose-300">{error}</span> : null}
    </label>
  );
}
