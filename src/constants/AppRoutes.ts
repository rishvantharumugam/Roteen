export const appRoutes = {
  home: "/",
  signUp: "/signup",
  authCallback: "/auth/callback",
  dashboard: "/dashboard",
  profile: "/profile",
  progress: "/progress",
  refer: "/refer",
  account: "/account",
  notes: "/notes",
  revision: "/revision",
  sessions: "/session",
  news: "/news",
  notifications: "/notification",
  feedback: "/feedback",
  terms: "/terms",
  tutorial: "/tutorial",
  bugReport: "/bug",

  curriculum: "#curriculum",
  mentors: "#mentors",
  pricing: "#pricing",
  resources: "#resources",
  signIn: "/login",
  getStarted: "#get-started",
} as const;

export const landingNavigation = [
  { label: "Home", href: appRoutes.home },
  { label: "Dashboard", href: appRoutes.dashboard },
] as const;

export const dashboardNavigation = [
  { label: "Dashboard", href: appRoutes.dashboard },
  { label: "Notes", href: appRoutes.notes },
  { label: "Revision", href: appRoutes.revision },
  { label: "Sessions", href: appRoutes.sessions },
  { label: "News", href: appRoutes.news },
] as const;
