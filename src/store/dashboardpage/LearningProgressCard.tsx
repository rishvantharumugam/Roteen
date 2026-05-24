"use client";

import { useState } from "react";
import {
  ArrowRight,
  BarChart3,
  ChevronDown,
  Clock,
  Hourglass,
  Sparkles,
  Target,
  WandSparkles,
} from "lucide-react";
import { dashboardPageStyles } from "@/styles/DashboardPageStyles";

const DAILY_GOAL_MINUTES = 60;
const COMPLETED_MINUTES = 46;
const PROGRESS_PERCENT = Math.round((COMPLETED_MINUTES / DAILY_GOAL_MINUTES) * 100);
const MINS_REMAINING = DAILY_GOAL_MINUTES - COMPLETED_MINUTES;
const RING_RADIUS = 44;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const RING_OFFSET = RING_CIRCUMFERENCE - (PROGRESS_PERCENT / 100) * RING_CIRCUMFERENCE;

const STATS = [
  {
    label: "Time Spent",
    value: `${COMPLETED_MINUTES} min`,
    icon: Clock,
    chip: "Today",
    chipClassName: dashboardPageStyles.learningStatChipToday,
  },
  {
    label: "Daily Goal",
    value: `${DAILY_GOAL_MINUTES} min`,
    icon: Target,
    chip: "On Track",
    chipClassName: dashboardPageStyles.learningStatChipOnTrack,
  },
  {
    label: "Remaining",
    value: `${MINS_REMAINING} min`,
    icon: Hourglass,
    chip: "Keep Going",
    chipClassName: dashboardPageStyles.learningStatChipKeepGoing,
  },
] as const;

export function LearningProgressCard() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <section className={dashboardPageStyles.learningCard}>
      <header className={dashboardPageStyles.learningHeader}>
        <div className={dashboardPageStyles.learningHeaderLeft}>
          <div className={dashboardPageStyles.learningSparkle}>
            <Sparkles size={14} />
            <span>🚀 KEEP IT UP!</span>
          </div>
          <h2 className={dashboardPageStyles.learningTitle}>Today&apos;s Learning</h2>
          <p className={dashboardPageStyles.learningSubtitle}>Consistency today, success tomorrow.</p>
        </div>

        <div className={dashboardPageStyles.learningTopRight} aria-hidden>
          <div className={dashboardPageStyles.learningHeroBadgeWrap}>
            <Target size={52} className={dashboardPageStyles.learningHeroBadgeIcon} />
          </div>
          <div className={dashboardPageStyles.learningHeroBook} />
          <div className={dashboardPageStyles.learningHeroBars}>
            <span />
            <span />
            <span />
            <span />
          </div>
          <WandSparkles size={34} className={dashboardPageStyles.learningHeroFloatingIcon} />
          <BarChart3 size={20} className={dashboardPageStyles.learningHeroMicroIcon} />
        </div>

        <button
          type="button"
          aria-expanded={!collapsed}
          aria-label={collapsed ? "Expand section" : "Collapse section"}
          className={dashboardPageStyles.learningCollapseBtn}
          onClick={() => setCollapsed((value) => !value)}
        >
          <ChevronDown
            size={18}
            className={collapsed ? "transition-transform duration-300" : "rotate-180 transition-transform duration-300"}
          />
        </button>
      </header>

      {!collapsed && (
        <div className={dashboardPageStyles.learningBody}>
          <div className={dashboardPageStyles.learningBodyLeft}>
            <div className={dashboardPageStyles.learningRingWrap}>
              <div className={dashboardPageStyles.learningRingOuter}>
                <svg className={dashboardPageStyles.learningRingSvg} viewBox="0 0 110 110">
                  <defs>
                    <linearGradient id="learningRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#7c3aed" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                  <circle
                    cx="55"
                    cy="55"
                    r={RING_RADIUS}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className={dashboardPageStyles.learningRingTrack}
                  />
                  <circle
                    cx="55"
                    cy="55"
                    r={RING_RADIUS}
                    fill="none"
                    stroke="url(#learningRingGradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={RING_CIRCUMFERENCE}
                    strokeDashoffset={RING_OFFSET}
                  />
                </svg>
                <div className={dashboardPageStyles.learningRingCenter}>
                  <p className={dashboardPageStyles.learningRingPercent}>{PROGRESS_PERCENT}%</p>
                  <p className={dashboardPageStyles.learningRingLabel}>Complete</p>
                </div>
              </div>
            </div>

            <div className={dashboardPageStyles.learningStats}>
              {STATS.map((stat, index) => (
                <div key={stat.label} className="contents">
                  {index > 0 && <div className={dashboardPageStyles.learningStatDivider} />}
                  <div className={dashboardPageStyles.learningStatItem}>
                    <div className={dashboardPageStyles.learningStatIconWrap}>
                      <stat.icon size={20} className={dashboardPageStyles.learningStatIcon} />
                    </div>
                    <p className={dashboardPageStyles.learningStatValue}>{stat.value}</p>
                    <p className={dashboardPageStyles.learningStatLabel}>{stat.label}</p>
                    <span className={stat.chipClassName}>{stat.chip}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={dashboardPageStyles.learningBodyRight}>
            <p className={dashboardPageStyles.learningEstimate}>
              Estimated Time to Complete
              <span className={dashboardPageStyles.learningEstimateHighlight}>{MINS_REMAINING} min</span>
            </p>
            <button type="button" className={dashboardPageStyles.learningCtaBtn}>
              Continue Learning
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
