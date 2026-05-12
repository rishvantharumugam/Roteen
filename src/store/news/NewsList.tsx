import { memo } from "react";
import type { NewsItem } from "@/service/newsService";
import NewsCard from "@/store/news/NewsCard";
import { newsStyles } from "@/styles/newsStyles";

interface NewsListProps {
  items: NewsItem[];
  onSelect: (item: NewsItem) => void;
}

function NewsList({ items, onSelect }: NewsListProps) {
  if (items.length === 0) {
    return <div className={newsStyles.emptyState}>No news matched your search.</div>;
  }

  return (
    <section className={newsStyles.list}>
      {items.map((item) => (
        <NewsCard key={item.id} item={item} onClick={onSelect} />
      ))}
    </section>
  );
}

export default memo(NewsList);
