"use client";

import { Star } from "lucide-react";

export interface RatingStarsProps {
  value: number;
  onChange?: (rating: number) => void;
  readOnly?: boolean;
  size?: "sm" | "md";
}

export function RatingStars({
  value,
  onChange,
  readOnly = false,
  size = "md",
}: RatingStarsProps) {
  const iconClassName = size === "sm" ? "h-4 w-4" : "h-6 w-6";

  return (
    <div className="flex items-center gap-1" role={readOnly ? "img" : "radiogroup"}>
      {Array.from({ length: 5 }).map((_, index) => {
        const rating = index + 1;
        const isActive = rating <= value;

        return (
          <button
            key={rating}
            type="button"
            disabled={readOnly}
            aria-label={`${rating} star${rating === 1 ? "" : "s"}`}
            aria-checked={value === rating}
            role={readOnly ? undefined : "radio"}
            onClick={() => onChange?.(rating)}
            className={[
              "rounded-lg p-0.5 transition duration-200",
              readOnly ? "cursor-default" : "hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-violet-400/50",
              isActive ? "text-amber-300" : "text-slate-600",
            ].join(" ")}
          >
            <Star
              className={iconClassName}
              fill={isActive ? "currentColor" : "none"}
              strokeWidth={1.8}
            />
          </button>
        );
      })}
    </div>
  );
}
