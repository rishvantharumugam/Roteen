
interface TheoryFullPageViewProps {
  isOpen: boolean;
  title: string;
  description: string;
  onClose: () => void;
}

export default function TheoryFullPageView({
  isOpen,
  title,
  description,
  onClose,
}: TheoryFullPageViewProps) {
  return (
    <div
      className={`fixed inset-0 z-50 bg-[radial-gradient(circle_at_12%_0%,rgba(34,21,82,0.34),rgba(3,6,16,0.97)_36%),linear-gradient(140deg,#02050f,#040814_48%,#02050f)] transition-all duration-300 ease-out ${isOpen ? "opacity-100 scale-100" : "pointer-events-none opacity-0 scale-95"}`}
      aria-hidden={!isOpen}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 rounded-lg border border-zinc-700 bg-zinc-900/80 px-3 py-1.5 text-sm text-zinc-200 hover:border-purple-500"
      >
        X
      </button>

      <div className="flex h-full w-full items-center justify-center p-8">
        <div className="w-full max-w-4xl rounded-2xl border border-zinc-800 bg-[radial-gradient(circle_at_10%_7%,rgba(62,43,138,0.22),rgba(8,12,24,0.96)_42%),linear-gradient(160deg,#050915,#040710)] p-8">
          <h2 className="text-3xl font-semibold text-zinc-100">{title}</h2>
          <p className="mt-4 text-base leading-relaxed text-zinc-300">{description}</p>
        </div>
      </div>
    </div>
  );
}
