export const landingPageStyles = {
  page: "academy-landing-page min-h-screen !bg-[linear-gradient(180deg,#ddd6ff_0%,#f7f4ff_42%,#ffffff_100%)] !text-slate-950",
  content: (hasModalOpen: boolean) =>
    `transition duration-300 ${hasModalOpen ? "pointer-events-none select-none blur-md" : ""}`,
} as const;
