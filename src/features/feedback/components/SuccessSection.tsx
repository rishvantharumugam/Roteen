"use client";

import { CheckCircle2 } from "lucide-react";

export interface SuccessSectionProps {
  message?: string;
}

export function SuccessSection({ message }: SuccessSectionProps) {
  if (!message) {
    return null;
  }

  return (
    <section className={`border-emerald-500/35 bg-emerald-500/12 text-emerald-200 rounded-2xl border px-4 py-3 text-sm font-medium`}>
      <span className="flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4" />
        {message}
      </span>
    </section>
  );
}
