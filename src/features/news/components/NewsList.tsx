import { memo } from "react";
import type { NewsItem } from "@/features/news/services/newsService";
import NewsCard from "@/features/news/components/NewsCard";


interface NewsListProps {
  items: NewsItem[];
  onSelect: (item: NewsItem) => void;
  isLoading?: boolean;
}

function NewsList({ items, onSelect, isLoading }: NewsListProps) {
  if (isLoading) {
    return <div className="bg-black min-h-[60vh]" />;
  }

  if (items.length === 0) {
    return <div className="rounded-2xl border border-zinc-800 bg-[#121212] px-5 py-12 text-center text-zinc-400">No news available.</div>;
  }

  return (
    <section className="flex flex-col gap-4">
      {items.map((item) => (
        <NewsCard key={item.id} item={item} onClick={onSelect} />
      ))}
    </section>
  );
}

export default memo(NewsList);
