import React from "react";

/**
 * Base Skeleton block
 */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`bg-[#1D1D1D] rounded-xl skeleton-shimmer ${className ?? ""}`}
      {...props}
    />
  );
}

/**
 * Skeleton for standard cards/panels (matches dark theme)
 */
export function SkeletonCard({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`bg-[#1A1A1A] rounded-2xl border border-[rgba(255,255,255,0.04)] ${className ?? ""}`}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Text placeholders (Soft Grey)
 */
export function SkeletonText({
  lines = 1,
  className,
  lastLineShort = true,
}: {
  lines?: number;
  className?: string;
  lastLineShort?: boolean;
}) {
  return (
    <div className={`flex flex-col gap-2 ${className ?? ""}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-4 rounded-md bg-[#242424] skeleton-shimmer ${lastLineShort && i === lines - 1 && lines > 1 ? "w-2/3" : "w-full"}`}
        />
      ))}
    </div>
  );
}

/**
 * Avatar placeholders
 */
export function SkeletonAvatar({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`bg-[#1D1D1D] rounded-full skeleton-shimmer ${className ?? ""}`}
      {...props}
    />
  );
}

/**
 * Button placeholders
 */
export function SkeletonButton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`h-10 w-24 bg-[#1D1D1D] rounded-lg skeleton-shimmer ${className ?? ""}`}
      {...props}
    />
  );
}

/**
 * List placeholder (vertical stack of blocks)
 */
export function SkeletonList({
  count = 3,
  className,
  itemClassName,
}: {
  count?: number;
  className?: string;
  itemClassName?: string;
}) {
  return (
    <div className={`flex flex-col gap-3 ${className ?? ""}`}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className={`h-16 w-full ${itemClassName ?? ""}`} />
      ))}
    </div>
  );
}

/**
 * Chart placeholder
 */
export function SkeletonChart({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`w-full h-48 bg-[#1D1D1D] rounded-xl flex items-end gap-2 p-4 skeleton-shimmer ${className ?? ""}`}
      {...props}
    >
      <div className="h-2/3 w-full bg-[#242424] rounded-t-sm" />
      <div className="h-full w-full bg-[#242424] rounded-t-sm" />
      <div className="h-1/2 w-full bg-[#242424] rounded-t-sm" />
      <div className="h-3/4 w-full bg-[#242424] rounded-t-sm" />
      <div className="h-1/4 w-full bg-[#242424] rounded-t-sm" />
    </div>
  );
}

/**
 * Table placeholder
 */
export function SkeletonTable({
  rows = 5,
  cols = 4,
  className,
}: {
  rows?: number;
  cols?: number;
  className?: string;
}) {
  return (
    <div className={`w-full overflow-hidden ${className ?? ""}`}>
      <div className="flex w-full gap-4 border-b border-[rgba(255,255,255,0.04)] pb-3">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-5 flex-1 rounded bg-[#242424]" />
        ))}
      </div>
      <div className="flex flex-col gap-4 pt-4">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex w-full gap-4">
            {Array.from({ length: cols }).map((_, colIndex) => (
              <Skeleton key={colIndex} className="h-4 flex-1 rounded bg-[#1D1D1D]" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
