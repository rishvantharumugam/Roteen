export const sessionStyles = {
  page: "min-h-screen bg-[radial-gradient(circle_at_12%_0%,rgba(34,21,82,0.34),rgba(3,6,16,0.97)_36%),linear-gradient(140deg,#02050f,#040814_48%,#02050f)] text-slate-100",
  shell: "mx-auto grid max-w-[1560px] gap-8 px-6 py-8 lg:gap-10 lg:px-12 lg:py-10",

  header: "rounded-none border-b border-slate-200/80 bg-white/90 px-4 py-5 shadow-sm backdrop-blur md:px-8",
  headerWrap: "mx-auto flex max-w-7xl flex-col gap-5 lg:flex-row lg:items-center lg:justify-between",
  welcome: "text-sm font-medium text-teal-700",
  title: "mt-1 text-3xl font-semibold tracking-normal text-slate-950 md:text-4xl",
  subtitle: "mt-2 max-w-2xl text-sm leading-6 text-slate-600 md:text-base",
  headerControls: "flex flex-col gap-3 sm:flex-row sm:items-center",
  searchWrap: "relative block sm:w-72",
  searchPrefix: "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400",
  searchInput:
    "h-11 w-full rounded-md border border-slate-200 bg-slate-50 pl-16 pr-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-100",
  headerActions: "flex items-center gap-3",
  iconButton:
    "relative grid h-11 w-11 place-items-center rounded-md border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-teal-300 hover:text-teal-700",
  iconDot: "absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white",
  avatar: "grid h-11 w-11 place-items-center rounded-md bg-slate-950 text-sm font-semibold text-white",
  topNav: "mx-auto mt-5 flex max-w-7xl gap-2 overflow-x-auto",
  topNavItemPrimary: "whitespace-nowrap rounded-md bg-slate-950 px-3 py-2 text-sm font-medium text-white transition",
  topNavItem: "whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950",

  statsGrid: "grid gap-5 sm:grid-cols-2 xl:grid-cols-4",
  statsCard:
    "group relative cursor-pointer overflow-hidden rounded-2xl border border-white/12 bg-[linear-gradient(160deg,rgba(23,24,54,.92),rgba(13,16,37,.92))] shadow-[0_14px_40px_rgba(0,0,0,.34)] transition-all duration-300 before:pointer-events-none before:absolute before:inset-0 before:bg-[linear-gradient(120deg,transparent_30%,rgba(255,255,255,.14)_50%,transparent_70%)] before:translate-x-[-140%] before:transition-transform before:duration-700 hover:-translate-y-2 hover:scale-[1.03] hover:border-violet-300/35 hover:shadow-[0_20px_52px_rgba(90,62,204,.38)] hover:before:translate-x-[140%]",
  statsCardAccent: "h-[3px] bg-gradient-to-r",
  statsCardBody: "p-5",
  statsCardTop: "flex items-start justify-between gap-4",
  statsLabel: "text-[15px] font-medium text-slate-300",
  statsValue: "mt-3 text-[42px] font-bold leading-none text-white",
  statsBadge:
    "grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br text-sm font-bold text-white shadow-[0_8px_20px_rgba(108,60,255,.42)] transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_12px_26px_rgba(108,60,255,.6)]",
  statsDetail: "mt-4 text-sm leading-5 text-slate-400",

  tableSection: "bg-transparent p-0 shadow-none",
  activeCoursesSection: "mb-8",
  activeCoursesGrid: "mt-4 grid gap-4 sm:grid-cols-2",
  activeCourseCard:
    "overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(160deg,#161a3a_0%,#12142f_100%)] shadow-[0_10px_28px_rgba(0,0,0,.3)]",
  activeCourseAccent: "h-1.5",
  activeCourseBody: "space-y-3 p-4",
  activeCourseRow: "flex items-center justify-between gap-3",
  activeCourseBadge:
    "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ring-1",
  activeCourseBadgeLive: "border-emerald-300/35 bg-emerald-500/20 text-emerald-200 ring-emerald-300/30",
  activeCourseBadgeUpcoming: "border-indigo-300/40 bg-indigo-500/20 text-indigo-200 ring-indigo-300/30",
  activeCourseDetail: "text-sm font-medium text-slate-300",
  tableHeader: "mb-1 flex flex-col gap-2 pb-2 sm:flex-row sm:items-center sm:justify-between",
  sectionTitle: "text-[32px] font-bold tracking-tight text-white sm:text-[36px]",
  sectionSubtitle: "mt-1 text-sm text-slate-400",
  tableCountBadge: "w-fit rounded-full border border-teal-300/25 bg-teal-500/12 px-4 py-1.5 text-sm font-semibold text-teal-300",
  successToast:
    "fixed right-4 top-4 z-50 rounded-md bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg ring-1 ring-emerald-500",
  errorText: "pt-5 text-sm font-medium text-rose-700",
  cardsGrid: "mt-5 grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]",
  activeCardsGrid:
    "mt-5 flex gap-5 overflow-x-auto pb-6 snap-x snap-mandatory [&>*]:snap-start [&>*]:shrink-0 [&>*]:w-[85vw] sm:[&>*]:w-[280px] xl:[&>*]:w-[calc(20%-16px)]",
  emptyState:
    "rounded-lg border border-white/10 bg-[#0e1226] p-5 text-sm text-slate-400 lg:col-span-2",

  sessionCard:
    "group flex h-full min-h-[390px] flex-col overflow-hidden rounded-[24px] border border-white/5 bg-[#171717] p-5 shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:border-white/10 hover:bg-[#1a1a1a]",
  cardTopRow: "mb-3 flex items-center justify-between gap-3",
  cardCountdown: "text-[15px] font-semibold tracking-wide text-[#d5deef]",
  cardCountdownValue: "font-extrabold text-[#ff3040]",
  cardTag:
    "w-fit rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-white ring-1 ring-white/15",
  activeCardTagLive:
    "border border-white/15 bg-[linear-gradient(135deg,#dc2626,#e11d48)] text-white shadow-[0_0_18px_rgba(225,29,72,0.5)]",
  activeCardTagUpcoming: "border-violet-300/45 bg-violet-500/25 text-violet-100 ring-violet-300/30",
  activeCardTagCompleted:
    "border border-emerald-300/40 bg-[linear-gradient(135deg,rgba(16,185,129,.35),rgba(34,197,94,.28))] text-emerald-100 ring-1 ring-emerald-300/35 shadow-[0_0_14px_rgba(16,185,129,0.28)]",
  cardCover:
    "relative mb-4 h-[150px] w-full overflow-hidden rounded-[14px] border border-white/10 text-left text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300/70",
  cardCoverImage: "absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105",
  cardCoverShade: "absolute inset-0 bg-slate-950/45",
  cardCoverGlow:
    "absolute inset-0 bg-[linear-gradient(135deg,rgba(124,58,237,.35),rgba(10,10,20,.65))]",
  cardCoverContent: "relative flex h-full w-full items-end p-3",
  cardThumbnailMeta: "text-xs font-medium text-white/75",
  cardTopicTitle: "line-clamp-2 text-[18px] font-bold leading-tight text-white",
  cardSubline: "mt-1 text-[13px] text-white/70",
  cardMetaList: "mt-3 grid gap-2 text-[13px] text-white/75",
  cardMetaRow: "flex items-center gap-2",
  cardMetaIcon: "text-violet-300",
  cardBottomRow: "mt-3 flex items-end justify-between gap-3",
  cardActionBase:
    "inline-grid place-items-center rounded-lg border-0 px-3.5 py-2 text-[13px] font-semibold text-white transition duration-300 disabled:cursor-not-allowed disabled:opacity-70",
  actionJoin:
    "bg-[linear-gradient(135deg,#7c3aed,#a855f7)] shadow-[0_8px_20px_rgba(124,58,237,0.35)] hover:scale-105",
  actionJoinLive:
    "bg-[linear-gradient(135deg,#7c3aed,#a855f7)] shadow-[0_8px_20px_rgba(124,58,237,0.35)] hover:scale-105",
  actionFinished:
    "bg-[linear-gradient(135deg,#7c3aed,#a855f7)] shadow-[0_8px_20px_rgba(124,58,237,0.35)] hover:scale-105",
  actionEnroll:
    "bg-[linear-gradient(135deg,#7c3aed,#a855f7)] shadow-[0_8px_20px_rgba(124,58,237,0.35)] hover:scale-105",

  sessionModalOverlay:
    "fixed inset-0 z-[80] grid place-items-center bg-slate-950/72 p-4 backdrop-blur-sm",
  sessionModal:
    "w-full max-w-xl rounded-2xl border border-white/15 bg-[linear-gradient(160deg,rgba(17,22,45,.98),rgba(10,14,34,.98))] p-5 text-slate-100 shadow-[0_28px_80px_rgba(0,0,0,.5)] md:p-6",
  sessionModalHeader: "mb-5 flex items-start justify-between gap-4",
  sessionModalTitle: "text-2xl font-bold tracking-tight text-white",
  sessionModalClose:
    "rounded-lg border border-white/20 bg-white/8 px-3 py-1.5 text-sm font-semibold text-slate-100 transition hover:bg-white/14",
  sessionModalBody: "grid gap-4 rounded-xl border border-white/10 bg-white/5 p-4 md:grid-cols-2",
  sessionModalValue: "mt-1 text-base font-medium text-slate-100",
  sessionModalActions: "mt-5",

  cardBody: "flex min-h-0 flex-col justify-between p-4 [grid-row:2]",
  cardHeaderRow: "flex items-start justify-between gap-3",
  cardLabel: "text-xs font-semibold uppercase tracking-wide text-slate-400",
  cardInstructor: "mt-1 line-clamp-1 text-3xl font-bold capitalize leading-tight text-white",
  cardStatusPill:
    "rounded-full border border-emerald-300/30 bg-emerald-500/14 px-3 py-1 text-xs font-semibold capitalize ring-1 ring-emerald-300/20 backdrop-blur",
  cardMetaTitle: "font-medium text-slate-400",
  cardMetaValue: "mt-1 line-clamp-2 capitalize text-slate-200",
  cardBottom: "grid gap-3",
  cardDateTimeGrid: "grid grid-cols-2 gap-3 border-t border-white/10 pt-3 text-sm",

  timelineSection: "rounded-lg border border-slate-200 bg-white p-5 shadow-sm",
  timelineList: "mt-6 space-y-5",
  timelineItem: "relative pl-8",
  timelineDot:
    "absolute left-0 top-1.5 h-4 w-4 rounded-full border-4 border-white bg-teal-500 shadow ring-1 ring-teal-200",
  timelineLine: "absolute bottom-[-18px] left-2 top-6 w-px bg-slate-200",
  timelineRow: "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between",
  timelineTitle: "font-medium text-slate-950",
  timelineTime: "mt-1 text-sm text-slate-500",
  timelineStatusPill: "w-fit rounded-md px-2.5 py-1 text-xs font-semibold ring-1",
  progressTrack: "mt-3 h-2 rounded-full bg-slate-100",
  progressFill: "h-2 rounded-full bg-teal-500",

  activitySection: "rounded-lg border border-slate-200 bg-white p-5 shadow-sm",
  activityList: "mt-5 divide-y divide-slate-100",
  activityItem: "flex gap-3 py-4 first:pt-0 last:pb-0",
  activityDot: "mt-1 h-2.5 w-2.5 shrink-0 rounded-full",
  activityMain: "min-w-0 flex-1",
  activityHead: "flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between",
  activityTitle: "font-medium text-slate-950",
  activityTime: "text-xs font-medium text-slate-400",
  activityDesc: "mt-1 text-sm leading-6 text-slate-600",

  quickSection: "rounded-lg border border-slate-200 bg-slate-950 p-5 text-white shadow-sm",
  quickGrid: "mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1",
  quickItem:
    "group flex min-h-20 items-center gap-4 rounded-md border border-white/10 bg-white/[0.08] p-4 text-left transition hover:border-teal-300/60 hover:bg-white/[0.12]",
  quickIcon:
    "grid h-11 w-11 shrink-0 place-items-center rounded-md bg-teal-400 text-xs font-bold text-slate-950",
  quickLabel: "block font-semibold",
  quickDesc: "mt-1 block text-sm leading-5 text-slate-300",

  footer: "rounded-lg border border-teal-100 bg-white p-5 shadow-sm md:p-6",
  footerWrap: "grid gap-5 md:grid-cols-[1fr_auto] md:items-center",
  footerSummary: "mt-2 text-sm leading-6 text-slate-600",
  footerMotivation: "mt-1 text-sm font-medium text-teal-700",
  footerProgressWrap: "min-w-48",
  footerProgressHeader: "flex items-center justify-between text-sm font-medium text-slate-600",
  footerProgressTrack: "mt-3 h-3 rounded-full bg-slate-100",
  footerProgressFill: "h-3 rounded-full bg-teal-500",

  detailPage: "min-h-screen bg-[radial-gradient(circle_at_12%_0%,rgba(34,21,82,0.34),rgba(3,6,16,0.97)_36%),linear-gradient(140deg,#02050f,#040814_48%,#02050f)] px-4 py-6 text-slate-950 md:px-8",
  detailShell: "mx-auto grid max-w-6xl gap-6",
  detailHead: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
  detailBackLink: "text-sm font-medium text-teal-700 transition hover:text-teal-900",
  detailTitle: "mt-2 text-3xl font-semibold capitalize tracking-normal",
  detailSubtitle: "mt-2 text-sm text-slate-600",
  detailStatus: "w-fit rounded-md bg-emerald-50 px-3 py-1 text-sm font-semibold capitalize text-emerald-700 ring-1 ring-emerald-200",
  detailGrid: "grid overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm lg:grid-cols-[1.4fr_0.6fr]",
  detailVideoWrap: "bg-slate-950 p-4",
  detailVideoFrame: "relative aspect-video overflow-hidden rounded-md border border-white/10 bg-slate-900",
  detailVideo: "h-full w-full bg-black object-contain",
  detailEmptyVideo:
    "grid h-full place-items-center bg-[radial-gradient(circle_at_30%_20%,rgba(20,184,166,0.32),transparent_30%),linear-gradient(135deg,#020617,#0f172a_55%,#134e4a)] text-center text-white",
  detailSidebar: "grid gap-5 p-5",
  detailFieldLabel: "text-xs font-semibold uppercase tracking-wide text-slate-500",
  detailFieldValue: "mt-1 text-slate-700",
} as const;
