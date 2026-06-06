 "use client";

import { useTheme } from "next-themes";

import { HeaderSettingsMenu } from "@/components/layout/HeaderSettingsMenu";

interface NavbarProps {
  brand: string;
  menu: { id: string; label: string }[];
}

export default function Navbar({ brand, menu }: NavbarProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const activeTheme = theme === "system" ? resolvedTheme : theme;
  const isDark = activeTheme !== "light";

  return (
    <header className="sticky top-0 z-20 flex h-[72px] w-full items-center justify-between bg-black px-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#a855f7] text-lg font-bold text-white">R</div>
        <h1 className="text-lg font-semibold tracking-tight text-[#a855f7]">{brand}</h1>
      </div>
      <nav className="flex items-center gap-6">
        {menu.map((item) => (
          <button
            key={item.id}
            type="button"
            className={
              item.label === "Dashboard"
                ? "rounded-full border border-zinc-800 bg-white/5 px-5 py-1.5 text-sm font-medium text-white"
                : "rounded-full px-4 py-1.5 text-sm font-medium text-zinc-400 transition hover:text-zinc-200"
            }
          >
            {item.label}
          </button>
        ))}
      </nav>
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Toggle theme"
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className="rounded-full p-2 text-zinc-400 transition hover:bg-zinc-800/50 hover:text-white"
        >
          {isDark ? (
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M21 12.79A9 9 0 1 1 11.21 3A7 7 0 0 0 21 12.79Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          )}
        </button>

        <button
          type="button"
          title="Notifications"
          aria-label="Notifications"
          className="relative rounded-full p-2 text-zinc-400 transition hover:bg-zinc-800/50 hover:text-white"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 17H5l1.4-1.4A2 2 0 0 0 7 14.2V11a5 5 0 1 1 10 0v3.2a2 2 0 0 0 .6 1.4L19 17h-4Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10 19a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
        </button>

        <HeaderSettingsMenu />
      </div>
    </header>
  );
}
