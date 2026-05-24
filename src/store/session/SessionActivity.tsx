import { sessionStyles } from "@/style/session";
import type { SessionActivityItem } from "@/store/session/sessionStore";

type SessionActivityProps = {
  activities: SessionActivityItem[];
};

const toneStyles = {
  green: "bg-emerald-500",
  blue: "bg-sky-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
} as const;

export function SessionActivity({ activities }: SessionActivityProps) {
  return (
    <section className={sessionStyles.activitySection}>
      <h2 className={sessionStyles.sectionTitle}>Recent Activity</h2>
      <div className={sessionStyles.activityList}>
        {activities.map((activity) => (
          <article className={sessionStyles.activityItem} key={activity.id}>
            <span className={`${sessionStyles.activityDot} ${toneStyles[activity.tone]}`} />
            <div className={sessionStyles.activityMain}>
              <div className={sessionStyles.activityHead}>
                <p className={sessionStyles.activityTitle}>{activity.title}</p>
                <time className={sessionStyles.activityTime}>{activity.timestamp}</time>
              </div>
              <p className={sessionStyles.activityDesc}>{activity.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
