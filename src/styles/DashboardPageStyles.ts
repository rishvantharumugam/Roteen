export const dashboardPageStyles = {
  page: "dark h-screen overflow-y-auto overflow-x-hidden no-scrollbar bg-[radial-gradient(circle_at_12%_0%,rgba(34,21,82,0.34),rgba(3,6,16,0.97)_36%),linear-gradient(140deg,#02050f,#040814_48%,#02050f)] text-slate-100",
  container: "mx-auto max-w-[1560px] px-4 py-8 lg:px-6 lg:py-10",

  // Today's Learning
  learningCard:
    "relative overflow-hidden rounded-[28px] border border-[#7c3aed]/55 bg-[radial-gradient(circle_at_12%_16%,rgba(124,58,237,.24),transparent_40%),linear-gradient(180deg,#101137_0%,#080a24_100%)] shadow-[0_20px_60px_rgba(8,9,38,.62)]",
  learningHeader:
    "relative grid grid-cols-1 items-start gap-5 border-b border-white/10 px-8 py-8 lg:grid-cols-[minmax(0,1fr)_minmax(380px,560px)]",
  learningHeaderLeft: "min-w-0",
  learningSparkle:
    "mb-4 inline-flex items-center gap-2 rounded-xl border border-fuchsia-400/30 bg-fuchsia-500/16 px-3 py-2 text-[13px] font-semibold tracking-wide text-fuchsia-200 shadow-[0_6px_18px_rgba(217,70,239,.25)]",
  learningTitle: "text-[48px] font-bold leading-[1.02] tracking-tight text-white sm:text-[56px]",
  learningSubtitle: "mt-2 text-[17px] font-semibold text-[#b3b9de] sm:text-[18px]",
  learningTopRight:
    "relative hidden h-[168px] lg:block",
  learningHeroBadgeWrap:
    "absolute left-[18%] top-[6px] flex h-24 w-24 items-center justify-center rounded-full border border-violet-200/30 bg-violet-500/30 text-violet-100",
  learningHeroBadgeIcon: "drop-shadow-[0_8px_20px_rgba(167,139,250,.56)]",
  learningHeroBook:
    "absolute left-[44%] top-[84px] h-16 w-56 -translate-x-1/2 rounded-2xl border border-violet-200/35 bg-gradient-to-r from-[#e8deff] via-[#d8c5ff] to-[#9f5dff] shadow-[0_10px_24px_rgba(13,13,33,.52)]",
  learningHeroBars:
    "absolute right-[8%] top-[52px] flex items-end gap-2 [&>span]:w-5 [&>span]:rounded-t-lg [&>span]:bg-gradient-to-t [&>span]:from-violet-600 [&>span]:to-fuchsia-400 [&>span]:shadow-[0_8px_18px_rgba(168,85,247,.5)] [&>span:nth-child(1)]:h-10 [&>span:nth-child(2)]:h-16 [&>span:nth-child(3)]:h-22 [&>span:nth-child(4)]:h-28",
  learningHeroFloatingIcon: "absolute right-[0%] top-[4px] text-fuchsia-300",
  learningHeroMicroIcon: "absolute right-[24%] top-[14px] text-violet-300",
  learningCollapseBtn:
    "absolute right-8 top-7 z-10 flex h-12 w-12 items-center justify-center rounded-xl border border-fuchsia-500/60 bg-[#17193f] text-gray-200 transition-all duration-300 hover:border-fuchsia-400 hover:bg-[#202353] hover:text-white",
  learningBody:
    "flex flex-col gap-8 px-8 py-7 lg:flex-row lg:items-center lg:justify-between lg:gap-10",
  learningBodyLeft: "flex min-w-0 flex-1 flex-col gap-8 lg:flex-row lg:items-center",
  learningRingWrap: "flex shrink-0",
  learningRingOuter: "relative flex h-[126px] w-[126px] items-center justify-center",
  learningRingSvg: "absolute inset-0 h-full w-full -rotate-90",
  learningRingTrack: "text-white/[0.11]",
  learningRingCenter: "flex flex-col items-center text-center",
  learningRingPercent: "text-[22px] font-bold leading-none text-white sm:text-[24px]",
  learningRingLabel: "mt-1 text-[11px] font-medium text-[#a7afd8]",
  learningStats: "flex min-w-0 flex-1 items-center justify-start gap-0",
  learningStatItem: "flex min-w-[170px] flex-1 flex-col items-start px-4",
  learningStatDivider: "h-[90px] w-px bg-white/12",
  learningStatIconWrap:
    "mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-300/20 bg-violet-500/18 text-violet-200 shadow-[0_10px_20px_rgba(124,58,237,.28)]",
  learningStatIcon: "text-violet-200",
  learningStatValue: "text-[20px] font-bold leading-none text-white sm:text-[22px]",
  learningStatLabel: "mt-2 text-[12px] font-medium text-[#aeb5da]",
  learningStatChipToday:
    "mt-3 inline-flex rounded-full border border-violet-400/35 bg-violet-500/22 px-4 py-2 text-[13px] font-semibold text-violet-200",
  learningStatChipOnTrack:
    "mt-3 inline-flex rounded-full border border-emerald-400/35 bg-emerald-500/20 px-4 py-2 text-[13px] font-semibold text-emerald-300",
  learningStatChipKeepGoing:
    "mt-3 inline-flex rounded-full border border-sky-400/35 bg-sky-500/20 px-4 py-2 text-[13px] font-semibold text-sky-300",
  learningBodyRight:
    "flex w-full max-w-[360px] flex-col items-stretch gap-4 border-t border-white/10 pt-6 lg:items-end lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0",
  learningEstimate: "text-[13px] text-[#bdc4e9] lg:text-right",
  learningEstimateHighlight: "mt-2 block text-[52px] font-bold leading-none text-white sm:text-[58px]",
  learningCtaBtn:
    "inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#d946ef] to-[#7c3aed] px-7 py-4 text-[17px] font-semibold text-white shadow-[0_8px_26px_rgba(124,58,237,.55)] transition-all duration-300 hover:from-[#c026d3] hover:to-[#6d28d9] hover:shadow-[0_10px_30px_rgba(124,58,237,.7)]",

  // Section Headers
  sectionHeader: "mb-5 flex flex-wrap items-end justify-between gap-4",
  sectionTitleWrap: "flex flex-col gap-1",
  sectionTitle: "text-[22px] font-bold tracking-tight text-white sm:text-[24px]",
  sectionSubtitle: "text-[14px] font-medium text-gray-500",
  sectionLink:
    "shrink-0 text-[14px] font-semibold text-purple-400 transition-colors hover:text-purple-300",

  // Carousels
  carouselWrap: "group relative w-full",
  carouselScroll:
    "no-scrollbar relative z-10 flex snap-x snap-mandatory items-stretch gap-5 overflow-x-auto overflow-y-hidden",
  navButtonRight:
    "absolute right-0 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-black/40 text-white opacity-0 shadow-xl backdrop-blur-md transition-colors hover:bg-black/60 group-hover:opacity-100",

  // Search
  searchInputWrap: "relative flex items-center w-full max-w-[340px] sm:w-[340px]",
  searchInput:
    "w-full rounded-xl border border-white/10 bg-[#121221] py-2.5 pl-10 pr-4 text-[14px] text-white placeholder-gray-500 focus:border-purple-500/40 focus:outline-none",
  searchIcon: "absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500",
} as const;
