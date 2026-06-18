import type { PointerEvent as ReactPointerEvent } from "react";

interface ResizableDividerProps {
  isDragging: boolean;
  onPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onDoubleClick: () => void;
}

export default function ResizableDivider({ isDragging, onPointerDown, onDoubleClick }: ResizableDividerProps) {
  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize panels"
      aria-valuemin={30}
      aria-valuemax={60}
      onPointerDown={onPointerDown}
      onDoubleClick={onDoubleClick}
      className={`group relative -mx-2 hidden h-full w-4 shrink-0 cursor-col-resize touch-none items-center justify-center md:flex ${isDragging ? "select-none" : ""}`}
    >
      <span
        className={`h-full w-1 rounded-full transition-colors duration-200 ${isDragging
          ? "bg-purple-500 shadow-[0_0_18px_rgba(168,85,247,0.55)]"
          : "bg-zinc-800 group-hover:bg-purple-500/70"
          }`}
      />
    </div>
  );
}
