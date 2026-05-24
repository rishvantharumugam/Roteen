import { sessionStyles } from "@/style/session";

type SessionFooterProps = {
  weeklyProgress: number;
  weeklySummary: string;
  motivation: string;
};

export function SessionFooter({
  weeklyProgress,
  weeklySummary,
  motivation,
}: SessionFooterProps) {
  return (
    <footer className={sessionStyles.footer}>
      <div className={sessionStyles.footerWrap}>
        <div>
          <h2 className={sessionStyles.sectionTitle}>Weekly Progress</h2>
          <p className={sessionStyles.footerSummary}>{weeklySummary}</p>
          <p className={sessionStyles.footerMotivation}>{motivation}</p>
        </div>
        <div className={sessionStyles.footerProgressWrap}>
          <div className={sessionStyles.footerProgressHeader}>
            <span>Completion</span>
            <span>{weeklyProgress}%</span>
          </div>
          <div className={sessionStyles.footerProgressTrack}>
            <div
              className={sessionStyles.footerProgressFill}
              style={{ width: `${weeklyProgress}%` }}
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
