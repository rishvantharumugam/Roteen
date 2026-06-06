"use client";

import { Check } from "lucide-react";

export interface TermsListProps {
  items: string[];
}

export function TermsList({ items }: TermsListProps) {
  return (
    <ul className="grid gap-2">
      {items.map((item) => (
        <li
          key={item}
          className="flex gap-3 rounded-xl border border-white/[0.06] bg-black/15 p-3 text-sm leading-6 text-slate-300"
        >
          <Check className="mt-1 h-4 w-4 shrink-0 text-violet-300" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

