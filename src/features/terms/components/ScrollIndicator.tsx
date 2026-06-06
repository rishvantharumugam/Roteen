"use client";

export interface ScrollIndicatorProps {
  progress: number;
}

export function ScrollIndicator({ progress }: ScrollIndicatorProps) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-16 z-40 h-px bg-white/[0.06]">
      <div
        className="h-full bg-[linear-gradient(90deg,#7C3AED,#8B5CF6,#A855F7)] transition-[width] duration-150"
        style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
      />
    </div>
  );
}
