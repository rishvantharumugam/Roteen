export const newsStyles = {
  container:
    "h-screen overflow-hidden bg-[radial-gradient(circle_at_12%_-20%,rgba(124,58,237,0.22),transparent_45%),linear-gradient(180deg,#0b0b1a_0%,#050510_100%)] text-white",
  navbar:
    "fixed left-0 right-0 top-0 z-20 flex h-[72px] w-full items-center justify-between border-b border-zinc-800/80 bg-[linear-gradient(180deg,rgba(8,10,16,0.95),rgba(3,5,11,0.96))] px-4 backdrop-blur",
  brandGroup: "flex items-center gap-3",
  logoBadge:
    "flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-[#7c3aed] to-[#a855f7] text-lg font-bold text-white",
  brandText: "text-lg font-semibold tracking-tight text-[#a855f7]",
  navMenu:
    "flex items-center gap-6",
  navItem:
    "rounded-full px-3 py-1.5 text-sm font-medium text-zinc-300 transition hover:text-zinc-100",
  navItemActive:
    "rounded-full border border-purple-400/35 bg-gradient-to-r from-[#7c3aed] to-[#a855f7] px-6 py-1.5 text-sm font-medium text-white shadow-[0_8px_20px_rgba(124,58,237,0.35)]",
  navActions: "flex items-center gap-3",
  iconButton:
    "rounded-full p-2 text-zinc-400 transition hover:bg-zinc-800/50 hover:text-white",
  iconSize: "h-5 w-5",
  bellButton:
    "relative rounded-full p-2 text-zinc-400 transition hover:bg-zinc-800/50 hover:text-white",
  bellDot: "absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500",
  avatar:
    "flex h-8 w-8 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 text-xs font-semibold text-zinc-200",
  pageBody:
    "news-scrollbar mt-[72px] h-[calc(100vh-72px)] w-full overflow-y-auto px-0 pb-6 pt-4",
  headerRow: "mb-4 flex flex-col gap-4 px-3 lg:flex-row lg:items-end lg:justify-between lg:px-5",
  headerLeft: "space-y-2",
  headerTitleRow: "flex items-center gap-3",
  pageIcon:
    "flex h-8 w-8 items-center justify-center rounded-lg border border-purple-500/30 bg-purple-500/10 text-[#a855f7]",
  pageTitle: "text-2xl font-semibold tracking-tight text-white",
  pageSubtitle: "max-w-3xl text-sm text-zinc-400",
  searchWrap:
    "flex h-10 w-full items-center gap-2 rounded-xl border border-purple-900/50 bg-[#090c1e]/90 px-3 shadow-[inset_0_0_0_1px_rgba(124,58,237,0.06)] lg:mt-1 lg:max-w-lg",
  searchIcon: "h-4 w-4 text-zinc-500",
  searchInput:
    "w-full bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none",
  list: "space-y-3 px-3 lg:px-5",
  card:
    "group flex w-full items-start justify-between rounded-lg border border-purple-900/40 bg-[linear-gradient(120deg,rgba(12,16,35,0.95),rgba(8,10,26,0.98))] p-2.5 shadow-[0_10px_30px_rgba(0,0,0,0.45)] transition duration-300 hover:scale-[1.005] hover:border-purple-500/70 hover:shadow-[0_0_34px_rgba(124,58,237,0.2)] md:p-3",
  cardInteractive: "w-full cursor-pointer text-left",
  cardMain: "flex min-w-0 flex-1 items-start",
  dot: "mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#7c3aed] shadow-[0_0_10px_rgba(124,58,237,0.85)]",
  cardContent: "ml-2.5 min-w-0 flex-1",
  cardTitle: "text-base font-semibold text-white",
  cardDesc: "mt-1 max-w-4xl text-xs leading-relaxed text-zinc-400 line-clamp-2",
  cardFooter: "mt-2 flex items-center gap-1.5 text-xs text-zinc-400",
  footerIcon: "h-3 w-3",
  cardArrow:
    "mt-0.5 h-5 w-5 shrink-0 text-zinc-500 transition group-hover:translate-x-1 group-hover:text-purple-300",
  emptyState:
    "rounded-2xl border border-purple-900/40 bg-[#090c1f]/90 px-5 py-12 text-center text-zinc-400",
  modalOverlay: "fixed inset-0 z-[120]",
  modalBackdrop: "flex h-full w-full items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-sm",
  modalContainer:
    "relative flex w-full max-w-4xl min-h-[420px] flex-col rounded-xl border border-purple-500/40 bg-[#11112b] p-8 shadow-[0_0_30px_rgba(124,58,237,0.2)]",
  modalTitle: "pr-10 text-2xl font-bold text-white",
  modalDesc: "mt-4 text-sm leading-relaxed text-zinc-300",
  modalFooter: "mt-auto pt-6 flex items-center gap-2 text-xs text-zinc-400",
  modalClose:
    "absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-purple-500/40 bg-[#1b1b3b] text-lg text-zinc-200 transition hover:bg-[#27275a] hover:text-white",
} as const;
