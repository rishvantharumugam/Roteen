import { ChevronRight, Clock3 } from "lucide-react";
import type { NewsItem } from "@/features/news/services/newsService";


interface NewsCardProps {
  item: NewsItem;
  onClick: (item: NewsItem) => void;
}

export default function NewsCard({ item, onClick }: NewsCardProps) {
  return (
    <button
      type="button"
      className="group relative flex w-full items-center gap-4 rounded-xl border border-zinc-800 bg-[#121212] p-4 transition duration-300 hover:border-zinc-700 text-left"
      onClick={() => onClick(item)}
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-transparent text-[#7C3AED]">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-newspaper"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/></svg>
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-semibold text-white">{item.title}</h3>
        <p className="mt-1 text-sm text-[#A1A1AA] line-clamp-2">{item.content}</p>
      </div>
    </button>
  );
}
