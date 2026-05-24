import { sessionStyles } from "@/style/session";
import type { SessionTimelineItem } from "@/store/session/sessionStore";

type SessionTimelineProps = {
  items: SessionTimelineItem[];
};

const statusStyles = {
  Completed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  "In Progress": "bg-sky-50 text-sky-700 ring-sky-200",
  Upcoming: "bg-slate-100 text-slate-600 ring-slate-200",
} as const;

export function SessionTimeline({ items }: SessionTimelineProps) {
  return (
    <section className={sessionStyles.timelineSection}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className={sessionStyles.sectionTitle}>Session Timeline</h2>
          <p className={sessionStyles.sectionSubtitle}>Progress across today&apos;s key sessions</p>
        </div>
        <span className={sessionStyles.tableCountBadge}>Live</span>
      </div>

      <div className={sessionStyles.timelineList}>
        {items.map((item, index) => (
          <article className={sessionStyles.timelineItem} key={item.id}>
            <span className={sessionStyles.timelineDot} />
            {index < items.length - 1 ? <span className={sessionStyles.timelineLine} /> : null}
            <div className={sessionStyles.timelineRow}>
              <div>
                <p className={sessionStyles.timelineTitle}>{item.title}</p>
                <p className={sessionStyles.timelineTime}>{item.time}</p>
              </div>
              <span className={`${sessionStyles.timelineStatusPill} ${statusStyles[item.status]}`}>
                {item.status}
              </span>
            </div>
            <div className={sessionStyles.progressTrack}>
              <div className={sessionStyles.progressFill} style={{ width: `${item.progress}%` }} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
