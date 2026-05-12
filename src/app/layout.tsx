import type { Metadata } from "next";
import "./globals.css";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { AuthProvider } from "@/providers/AuthProvider";
import { ThemeSync } from "@/lib/ThemeSync";
import { RouteThemeScope } from "@/lib/RouteThemeScope";

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
  const { data: sessionData } = await supabase.auth.getSession();

  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-white text-slate-950 dark:bg-[#111111] dark:text-slate-100">
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {
  const pathname = window.location.pathname || "";
  const darkRoutes = ["/", "/video", "/news", "/dashboardpage", "/bug"];
  const shouldUseLegacyDark = darkRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"));
  document.body.classList.toggle("legacy-dark-route", shouldUseLegacyDark);
  document.documentElement.classList.toggle("dark", shouldUseLegacyDark);
})();`,
          }}
        />
        <ThemeSync />
        <RouteThemeScope />
        <AuthProvider
          initialSession={sessionData.session}
          initialUser={sessionData.session?.user ?? null}
        >
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

