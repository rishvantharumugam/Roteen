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
    chipClassName: "mt-4 inline-block rounded-lg bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-[#d8c5ff]",
  },
  {
    label: "Daily Goal",
    value: `${DAILY_GOAL_MINUTES} min`,
    icon: Target,
    chip: "On Track",
    chipClassName: "mt-4 inline-block rounded-lg bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-[#d8c5ff]",
  },
  {
    label: "Remaining",
    value: `${MINS_REMAINING} min`,
    icon: Hourglass,
    chip: "Keep Going",
    chipClassName: "mt-4 inline-block rounded-lg bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-[#d8c5ff]",
  },
] as const;

export function LearningProgressCard() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-[#7c3aed]/55 bg-[radial-gradient(circle_at_12%_16%,rgba(124,58,237,.24),transparent_40%),linear-gradient(180deg,#101137_0%,#080a24_100%)] shadow-[0_20px_60px_rgba(8,9,38,.62)]">
      <header className="relative grid grid-cols-1 items-start gap-5 border-b border-white/10 px-8 py-8 lg:grid-cols-[minmax(0,1fr)_minmax(380px,560px)]">
        <div className="min-w-0">
          <div className="mb-4 inline-flex items-center gap-2 rounded-xl border border-fuchsia-400/30 bg-fuchsia-500/16 px-3 py-2 text-[13px] font-semibold tracking-wide text-fuchsia-200 shadow-[0_6px_18px_rgba(217,70,239,.25)]">
            <Sparkles size={14} />
            <span>🚀 KEEP IT UP!</span>
          </div>
          <h2 className="text-[48px] font-bold leading-[1.02] tracking-tight text-white sm:text-[56px]">Today&apos;s Learning</h2>
          <p className="mt-2 text-[17px] font-semibold text-[#b3b9de] sm:text-[18px]">Consistency today, success tomorrow.</p>
        </div>

        <div className="relative hidden h-[168px] lg:block" aria-hidden>
          <div className="absolute left-[18%] top-[6px] flex h-24 w-24 items-center justify-center rounded-full border border-violet-200/30 bg-violet-500/30 text-violet-100">
            <Target size={52} className="drop-shadow-[0_8px_20px_rgba(167,139,250,.56)]" />
          </div>
          <div className="absolute left-[44%] top-[84px] h-16 w-56 -translate-x-1/2 rounded-2xl border border-violet-200/35 bg-gradient-to-r from-[#e8deff] via-[#d8c5ff] to-[#9f5dff] shadow-[0_10px_24px_rgba(13,13,33,.52)]" />
          <div className="absolute right-[8%] top-[52px] flex items-end gap-2 [&>span]:w-5 [&>span]:rounded-t-lg [&>span]:bg-gradient-to-t [&>span]:from-violet-600 [&>span]:to-fuchsia-400 [&>span]:shadow-[0_8px_18px_rgba(168,85,247,.5)] [&>span:nth-child(1)]:h-10 [&>span:nth-child(2)]:h-16 [&>span:nth-child(3)]:h-22 [&>span:nth-child(4)]:h-28">
            <span />
            <span />
            <span />
            <span />
          </div>
          <WandSparkles size={34} className="absolute right-[0%] top-[4px] text-fuchsia-300" />
          <BarChart3 size={20} className="absolute right-[24%] top-[14px] text-violet-300" />
        </div>

        <button
          type="button"
          aria-expanded={!collapsed}
          aria-label={collapsed ? "Expand section" : "Collapse section"}
          className="absolute right-8 top-7 z-10 flex h-12 w-12 items-center justify-center rounded-xl border border-fuchsia-500/60 bg-[#17193f] text-gray-200 transition-all duration-300 hover:border-fuchsia-400 hover:bg-[#202353] hover:text-white"
          onClick={() => setCollapsed((value) => !value)}
        >
          <ChevronDown
            size={18}
            className={collapsed ? "transition-transform duration-300" : "rotate-180 transition-transform duration-300"}
          />
        </button>
      </header>

      {!collapsed && (
        <div className="flex flex-col gap-8 px-8 py-7 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
          <div className="flex min-w-0 flex-1 flex-col gap-8 lg:flex-row lg:items-center">
            <div className="flex shrink-0">
              <div className="relative flex h-[126px] w-[126px] items-center justify-center">
                <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 110 110">
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
                    className="text-white/[0.11]"
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
                <div className="flex flex-col items-center text-center">
                  <p className="text-[22px] font-bold leading-none text-white sm:text-[24px]">{PROGRESS_PERCENT}%</p>
                  <p className="mt-1 text-[11px] font-medium text-[#a7afd8]">Complete</p>
                </div>
              </div>
            </div>

            <div className="flex min-w-0 flex-1 items-center justify-start gap-0">
              {STATS.map((stat, index) => (
                <div key={stat.label} className="contents">
                  {index > 0 && <div className="h-[90px] w-px bg-white/12" />}
                  <div className="flex min-w-[170px] flex-1 flex-col items-start px-4">
                    <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-300/20 bg-violet-500/18 text-violet-200 shadow-[0_10px_20px_rgba(124,58,237,.28)]">
                      <stat.icon size={20} className="text-violet-200" />
                    </div>
                    <p className="text-[20px] font-bold leading-none text-white sm:text-[22px]">{stat.value}</p>
                    <p className="mt-2 text-[12px] font-medium text-[#aeb5da]">{stat.label}</p>
                    <span className={stat.chipClassName}>{stat.chip}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex w-full max-w-[360px] flex-col items-stretch gap-4 border-t border-white/10 pt-6 lg:items-end lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
            <p className="text-[13px] text-[#bdc4e9] lg:text-right">
              Estimated Time to Complete
              <span className="mt-2 block text-[52px] font-bold leading-none text-white sm:text-[58px]">{MINS_REMAINING} min</span>
            </p>
            <button type="button" className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#d946ef] to-[#7c3aed] px-7 py-4 text-[17px] font-semibold text-white shadow-[0_8px_26px_rgba(124,58,237,.55)] transition-all duration-300 hover:from-[#c026d3] hover:to-[#6d28d9] hover:shadow-[0_10px_30px_rgba(124,58,237,.7)]">
              Continue Learning
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
