import { sessionStyles } from "@/style/session";
import type { SessionStat } from "@/store/session/sessionStore";
import { motion } from "framer-motion";

type SessionStatsCardProps = {
  stat: SessionStat;
};

export function SessionStatsCard({ stat }: SessionStatsCardProps) {
  return (
    <motion.article
      className={sessionStyles.statsCard}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div className={`${sessionStyles.statsCardAccent} ${stat.accent}`} />
      <div className={sessionStyles.statsCardBody}>
        <div className={sessionStyles.statsCardTop}>
          <div>
            <p className={sessionStyles.statsLabel}>{stat.label}</p>
            <p className={sessionStyles.statsValue}>{stat.value}</p>
          </div>
          <div className={`${sessionStyles.statsBadge} ${stat.accent}`}>
            {stat.label
              .split(" ")
              .map((word) => word[0])
              .join("")}
          </div>
        </div>
        <p className={sessionStyles.statsDetail}>{stat.detail}</p>
      </div>
    </motion.article>
  );
}
