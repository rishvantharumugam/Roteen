 "use client";

import { useTheme } from "next-themes";
import { videoStyles } from "@/styles/video";
import { HeaderSettingsMenu } from "@/store/shared/HeaderSettingsMenu";

interface NavbarProps {
  brand: string;
  menu: { id: string; label: string }[];
}

export default function Navbar({ brand, menu }: NavbarProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const activeTheme = theme === "system" ? resolvedTheme : theme;
  const isDark = activeTheme !== "light";

  return (
    <header className={videoStyles.navbar}>
      <div className={videoStyles.style_1da7023612fe2}>
        <div className={videoStyles.style_145e47bb1090bb}>R</div>
        <h1 className={videoStyles.style_11c7ba220cd9f1}>{brand}</h1>
      </div>
      <nav className={videoStyles.navMenu}>
        {menu.map((item) => (
          <button
            key={item.id}
            type="button"
            className={item.label === "Sessions" ? videoStyles.navItemActive : videoStyles.navItem}
          >
            {item.label}
          </button>
        ))}
      </nav>
      <div className={videoStyles.style_1da7023612fe2}>
        <button
          type="button"
          aria-label="Toggle theme"
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className={videoStyles.style_133113f7d3ca84}
        >
          {isDark ? (
            <svg className={videoStyles.style_1b7c5730a85a88} viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M21 12.79A9 9 0 1 1 11.21 3A7 7 0 0 0 21 12.79Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg className={videoStyles.style_1b7c5730a85a88} viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          )}
        </button>

        <button
          type="button"
          title="Notifications"
          aria-label="Notifications"
          className={videoStyles.style_bfa4d0a2442ef}
        >
          <svg className={videoStyles.style_1b7c5730a85a88} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 17H5l1.4-1.4A2 2 0 0 0 7 14.2V11a5 5 0 1 1 10 0v3.2a2 2 0 0 0 .6 1.4L19 17h-4Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10 19a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <span className={videoStyles.style_9b5441864637} />
        </button>

        <HeaderSettingsMenu />
      </div>
    </header>
  );
}
