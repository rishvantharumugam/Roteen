"use client";

import { RefreshCw, Scale } from "lucide-react";
import { TermsButton } from "@/features/terms/components/TermsButton";

export interface EmptyStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  title,
  message,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className={`$"relative flex h-screen flex-col overflow-hidden bg-black text-slate-100" flex items-center justify-center p-4`}>
      <div className={`$"rounded-2xl border border-zinc-800 bg-[#121212]  backdrop-blur-xl" w-full max-w-md p-6 text-center`}>
        <Scale className="mx-auto h-11 w-11 text-violet-300" />
        <h1 className="mt-4 text-lg font-semibold text-white">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">{message}</p>
        {actionLabel && onAction ? (
          <TermsButton
            className="mt-5"
            icon={<RefreshCw className="h-4 w-4" />}
            onClick={onAction}
          >
            {actionLabel}
          </TermsButton>
        ) : null}
      </div>
    </div>
  );
}

