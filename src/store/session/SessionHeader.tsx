import Link from "next/link";
import type { MouseEvent } from "react";
import { sessionStyles } from "@/style/session";
import type { SessionRouteLink } from "@/store/session/sessionStore";

type SessionHeaderProps = {
  userName: string;
  title: string;
  subtitle: string;
  routes: SessionRouteLink[];
  onRouteClick?: (href: string, event: MouseEvent<HTMLAnchorElement>) => void;
};

export function SessionHeader({
  userName,
  title,
  subtitle,
  routes,
  onRouteClick,
}: SessionHeaderProps) {
  return (
    <header className={sessionStyles.header}>
      <div className={sessionStyles.headerWrap}>
        <div className="min-w-0">
          <p className={sessionStyles.welcome}>Welcome back, {userName}</p>
          <h1 className={sessionStyles.title}>{title}</h1>
          <p className={sessionStyles.subtitle}>{subtitle}</p>
        </div>

        <div className={sessionStyles.headerControls}>
          <label className={sessionStyles.searchWrap}>
            <span className={sessionStyles.searchPrefix}>Search</span>
            <input
              className={sessionStyles.searchInput}
              placeholder="sessions, notes, hosts"
              type="search"
            />
          </label>
          <div className={sessionStyles.headerActions}>
            <button
              className={sessionStyles.iconButton}
              type="button"
              aria-label="Notifications"
            >
              <span className="text-lg">!</span>
              <span className={sessionStyles.iconDot} />
            </button>
            <div className={sessionStyles.avatar}>{userName.slice(0, 2).toUpperCase()}</div>
          </div>
        </div>
      </div>
      <nav className={sessionStyles.topNav}>
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            prefetch
            onClick={(event) => onRouteClick?.(route.href, event)}
            className={route.isPrimary ? sessionStyles.topNavItemPrimary : sessionStyles.topNavItem}
          >
            {route.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
