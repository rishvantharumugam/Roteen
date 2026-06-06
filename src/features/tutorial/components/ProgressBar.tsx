"use client";

export interface ProgressBarProps {
  value: number;
  label?: string;
  compact?: boolean;
}

export function ProgressBar({ value, label, compact = false }: ProgressBarProps) {
  const normalizedValue = Math.max(0, Math.min(100, Math.round(value)));

  return (
    <div className="w-full">
      {label ? (
        <div className="mb-2 flex items-center justify-between text-xs font-medium text-slate-400">
          <span>{label}</span>
          <span className="text-slate-200">{normalizedValue}%</span>
        </div>
      ) : null}
      <div
        className={`${compact ? "h-1.5" : "h-2"} overflow-hidden rounded-full bg-white/[0.08]`}
      >
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,#7C3AED,#8B5CF6,#A855F7)] shadow-[0_14px_28px_-24px_rgba(168,85,247,0.65)] transition-all duration-500"
          style={{ width: `${normalizedValue}%` }}
        />
      </div>
    </div>
  );
}
