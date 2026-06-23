"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { TutorialButton } from "@/features/tutorial/components/TutorialButton";

export interface EmptyStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  actionIcon?: React.ReactNode;
  actionVariant?: "primary" | "secondary" | "brand";
}

export function EmptyState({
  title,
  message,
  actionLabel,
  onAction,
  icon,
  actionIcon,
  actionVariant = "secondary",
}: EmptyStateProps) {
  return (
    <div className={`relative flex h-screen flex-col overflow-hidden bg-black text-slate-100 flex items-center justify-center p-4`}>
      <div className={`rounded-2xl border border-zinc-800 bg-[#121212]  backdrop-blur-xl w-full max-w-md p-6 text-center`}>
        {icon !== undefined ? icon : <AlertCircle className="mx-auto h-11 w-11 text-amber-300" />}
        <h1 className="mt-4 text-lg font-semibold text-white">{title}</h1>
        {message ? <p className="mt-2 text-sm leading-6 text-slate-400">{message}</p> : null}
        {actionLabel && onAction ? (
          <div className="mt-5 flex justify-center">
            <TutorialButton
              variant={actionVariant}
              icon={actionIcon || <RefreshCw className="h-4 w-4" />}
              onClick={onAction}
            >
              {actionLabel}
            </TutorialButton>
          </div>
        ) : null}
      </div>
    </div>
  );
}

