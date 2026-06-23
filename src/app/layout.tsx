import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
import { createServerSupabaseClient, getCachedAuthUser } from '@/lib/supabase/server';
import { AuthProvider } from "@/providers/AuthProvider";
import { ThemeSync } from "@/lib/ThemeSync";
import { RouteThemeScope } from "@/lib/RouteThemeScope";
import Providers from "@/app/providers";

export const metadata: Metadata = {
  title: "Roteen",
  description: "Question-first exam preparation platform built with a clean controller-driven architecture.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createServerSupabaseClient();
  const sessionResult = await supabase.auth.getSession();
  const session = sessionResult.data.session;
  let user = null;

  if (session) {
    user = await getCachedAuthUser();
  }

  return (
    <html lang="en" className={`h-full antialiased ${inter.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-white text-slate-950 dark:bg-black dark:text-slate-100 font-sans">
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {
  const pathname = window.location.pathname || "";
  const darkRoutes = ["/", "/video", "/news", "/dashboard", "/bug", "/notes", "/revision", "/session", "/profile", "/progress", "/refer", "/feedback", "/notification", "/notifications", "/terms", "/tutorial"];
  const shouldUseLegacyDark = darkRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"));
  document.body.classList.toggle("legacy-dark-route", shouldUseLegacyDark);
  document.documentElement.classList.toggle("dark", shouldUseLegacyDark);
})();`,
          }}
        />
        <ThemeSync />
        <RouteThemeScope />
        <Providers>
          <AuthProvider
            initialSession={session}
            initialUser={user}
          >
            {children}
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
