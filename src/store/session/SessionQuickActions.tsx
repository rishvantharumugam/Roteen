import { sessionStyles } from "@/style/session";
import type { SessionQuickAction } from "@/store/session/sessionStore";

type SessionQuickActionsProps = {
  actions: SessionQuickAction[];
};

export function SessionQuickActions({ actions }: SessionQuickActionsProps) {
  return (
    <section className={sessionStyles.quickSection}>
      <h2 className={sessionStyles.sectionTitle}>Quick Actions</h2>
      <div className={sessionStyles.quickGrid}>
        {actions.map((action) => (
          <button className={sessionStyles.quickItem} key={action.id} type="button">
            <span className={sessionStyles.quickIcon}>{action.icon}</span>
            <span className="min-w-0">
              <span className={sessionStyles.quickLabel}>{action.label}</span>
              <span className={sessionStyles.quickDesc}>{action.description}</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
