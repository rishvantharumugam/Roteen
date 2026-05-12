"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { UserMenu } from "@/store/landingpage/UserMenu";
import { appRoutes } from "@/navigation/AppRoutes";

type NavigationItem = {
  label: string;
  href: string;
  active?: boolean;
};

type LandingHeaderProps = {
  navigation: NavigationItem[];
  onAuthActionClick: () => void;
};

function HomeIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 stroke-current"
      fill="none"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="m3 10 9-7 9 7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 10v10h14V10" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 20v-6h6v6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DashboardIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 fill-current"
      viewBox="0 0 20 20"
    >
      <path d="M4 3.5h4.25v5H4a1.5 1.5 0 0 1-1.5-1.5V5A1.5 1.5 0 0 1 4 3.5Zm7.75 0H16A1.5 1.5 0 0 1 17.5 5v2A1.5 1.5 0 0 1 16 8.5h-4.25v-5ZM2.5 13A1.5 1.5 0 0 1 4 11.5h4.25v5H4A1.5 1.5 0 0 1 2.5 15v-2Zm9.25-1.5H16a1.5 1.5 0 0 1 1.5 1.5v2A1.5 1.5 0 0 1 16 16.5h-4.25v-5Z" />
    </svg>
  );
}

function RoteenWordmark() {
  return (
    <span className="relative inline-flex items-end font-heading text-[1.72rem] font-black italic leading-none tracking-normal sm:text-[1.9rem]">
      <span className="text-[#16110f]">Rot</span>
      <span className="relative text-[#0ea5a1]">
        <span className="absolute -top-3 left-1/2 hidden h-4 w-9 -translate-x-1/2 sm:block">
          <span className="absolute left-1 top-2 h-2.5 w-4 -rotate-12 rounded-t-full border-t-2 border-[#16110f]" />
          <span className="absolute right-1 top-2 h-2.5 w-4 rotate-12 rounded-t-full border-t-2 border-[#16110f]" />
        </span>
        een
      </span>
    </span>
  );
}

export function LandingHeader({
  navigation,
  onAuthActionClick,
}: LandingHeaderProps) {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const updateScrollState = () => {
      setIsScrolled(window.scrollY > 18);
    };

    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateScrollState);
    };
  }, []);

  const prefetchDashboard = () => {
    router.prefetch(appRoutes.dashboard);
  };

  return (
    <header
      className={`landing-header sticky top-0 z-40 px-4 transition-all duration-300 sm:px-6 lg:px-8 ${
        isScrolled ? "py-2" : "py-3"
      }`}
    >
      <div
        className={`landing-header-shell mx-auto grid max-w-7xl grid-cols-[auto_1fr] items-center gap-4 px-5 transition-all duration-300 md:grid-cols-[1fr_auto_1fr] lg:px-7 ${
          isScrolled ? "is-scrolled py-2.5" : "py-3.5"
        }`}
      >
        <Link href={appRoutes.home} className="flex items-center !text-slate-950">
          <RoteenWordmark />
        </Link>

        <nav className="landing-header-nav hidden items-center justify-center gap-8 md:flex">
          {navigation.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              prefetch
              onMouseEnter={item.href === appRoutes.dashboard ? prefetchDashboard : undefined}
              onFocus={item.href === appRoutes.dashboard ? prefetchDashboard : undefined}
              onTouchStart={item.href === appRoutes.dashboard ? prefetchDashboard : undefined}
              className={`inline-flex items-center gap-2 text-base transition ${
                item.active ? "font-semibold !text-slate-950" : "!text-slate-500 hover:!text-slate-950"
              }`}
            >
              {item.label === "Home" ? <HomeIcon /> : <DashboardIcon />}
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="col-span-2 flex items-center justify-end gap-3 md:col-span-1">
          <UserMenu
            loginClassName="!bg-[linear-gradient(135deg,#a78bfa_0%,#7c3aed_100%)] !text-white shadow-[0_14px_34px_rgba(124,58,237,0.28)] hover:!bg-[linear-gradient(135deg,#9877f7_0%,#6d28d9_100%)]"
            loginLabel="Get Started"
            onLoginClick={onAuthActionClick}
          />
        </div>
      </div>
    </header>
  );
}



