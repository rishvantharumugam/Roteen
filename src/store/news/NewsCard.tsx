import { ChevronRight, Clock3 } from "lucide-react";
import type { NewsItem } from "@/service/newsService";
import { newsStyles } from "@/styles/newsStyles";

interface NewsCardProps {
  item: NewsItem;
  onClick: (item: NewsItem) => void;
}

export default function NewsCard({ item, onClick }: NewsCardProps) {
  return (
    <button
      type="button"
      className={`${newsStyles.card} ${newsStyles.cardInteractive}`}
      onClick={() => onClick(item)}
    >
      <div className={newsStyles.cardMain}>
        <span className={newsStyles.dot} aria-hidden="true" />
        <div className={newsStyles.cardContent}>
          <h3 className={newsStyles.cardTitle}>{item.title}</h3>
          <p className={newsStyles.cardDesc}>{item.content}</p>
          <div className={newsStyles.cardFooter}>
            <Clock3 className={newsStyles.footerIcon} aria-hidden="true" />
            <span>{item.publishedLabel}</span>
          </div>
        </div>
      </div>
      <ChevronRight className={newsStyles.cardArrow} aria-hidden="true" />
    </button>
  );
}
