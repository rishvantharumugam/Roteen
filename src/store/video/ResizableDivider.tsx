interface ResizableDividerProps {
  isDragging: boolean;
  onMouseDown: (event: React.MouseEvent<HTMLDivElement>) => void;
}

export default function ResizableDivider({ isDragging, onMouseDown }: ResizableDividerProps) {
  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize panels"
      onMouseDown={onMouseDown}
      className={`h-full w-1 shrink-0 cursor-col-resize transition-colors ${isDragging ? "bg-purple-500" : "bg-transparent hover:bg-purple-500/60"}`}
    />
  );
}
