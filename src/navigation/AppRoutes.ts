export const appRoutes = {
  home: "/landingpage",
  signUp: "/sign-up",
  authCallback: "/auth/callback",
  dashboard: "/dashboardpage",
  account: "/account",
  notes: "/notes",
  revision: "/revision",
  sessions: "/sessions",
  news: "/news",
  bugReport: "/bug",
  profile: "/profile",
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
  { label: "Profile", href: appRoutes.profile },
] as const;
