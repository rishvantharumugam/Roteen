import { dashboardPageStyles } from "@/styles/DashboardPageStyles";

export function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className={dashboardPageStyles.searchIcon} fill="none" strokeWidth="2" aria-hidden="true">
      <circle cx="11" cy="11" r="6" stroke="currentColor" />
      <path d="m20 20-4.2-4.2" stroke="currentColor" />
    </svg>
  );
}
