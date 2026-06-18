import { Clock3 } from "lucide-react";
import type { NewsItem } from "@/features/news/services/newsService";


interface NewsModalProps {
  data: NewsItem;
  onClose: () => void;
}

export default function NewsModal({ data, onClose }: NewsModalProps) {
  return (
    <div className="fixed inset-0 z-[120]" onClick={onClose} role="presentation">
      <div className="flex h-full w-full items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-sm">
        <section
          className="relative flex w-full max-w-4xl min-h-[420px] flex-col rounded-xl border border-zinc-800 bg-[#101114] p-8 shadow-[0_0_30px_rgba(0,0,0,0.5)]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="news-modal-title"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 text-lg text-zinc-200 transition hover:bg-zinc-800 hover:text-white"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
          <h3 id="news-modal-title" className="pr-10 text-2xl font-bold text-white">
            {data.title}
          </h3>
          <p className="mt-4 text-sm leading-relaxed text-zinc-300">{data.content}</p>

          <div className="mt-auto pt-6 flex items-center gap-2 text-xs text-zinc-400">
            <Clock3 className="h-3 w-3" aria-hidden="true" />
            <span>{data.publishedLabel}</span>
          </div>
        </section>
      </div>
    </div>
  );
}
