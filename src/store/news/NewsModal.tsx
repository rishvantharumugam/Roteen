import { Clock3 } from "lucide-react";
import type { NewsItem } from "@/service/newsService";
import { newsStyles } from "@/styles/newsStyles";

interface NewsModalProps {
  data: NewsItem;
  onClose: () => void;
}

export default function NewsModal({ data, onClose }: NewsModalProps) {
  return (
    <div className={newsStyles.modalOverlay} onClick={onClose} role="presentation">
      <div className={newsStyles.modalBackdrop}>
        <section
          className={newsStyles.modalContainer}
          role="dialog"
          aria-modal="true"
          aria-labelledby="news-modal-title"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            className={newsStyles.modalClose}
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
          <h3 id="news-modal-title" className={newsStyles.modalTitle}>
            {data.title}
          </h3>
          <p className={newsStyles.modalDesc}>{data.content}</p>

          <div className={newsStyles.modalFooter}>
            <Clock3 className={newsStyles.footerIcon} aria-hidden="true" />
            <span>{data.publishedLabel}</span>
          </div>
        </section>
      </div>
    </div>
  );
}
