import { landingNavigation } from "@/constants/AppRoutes";

export type FeatureItem = {
  title: string;
  description: string;
  icon: string;
};

export type StatItem = {
  value: string;
  label: string;
};

export type LandingPageContent = {
  badge: string;
  title: string;
  description: string;
  primaryAction: string;
  secondaryAction: string;
  heroCardTitle: string;
  heroCardItems: string[];
  features: FeatureItem[];
  stats: StatItem[];
  footerLinks: string[];
};

export type LandingPageState = {
  navigation: { label: string; href: string; active?: boolean }[];
  heroMetrics: { label: string; value: string }[];
  content: LandingPageContent;
};

export function formatLandingPageData(): LandingPageContent {
  return {
    badge: "The Future Of Edtech",
    title: "Master Exams Through Questions, Not Just Theory",
    description:
      "Stop passive reading. Our AI-driven platform focuses on active retrieval with 10,000+ curated questions, instant video solutions, and a cosmic roadmap to your success.",
    primaryAction: "Start Solving Now",
    secondaryAction: "Explore Questions",
    heroCardTitle: "BSTB 2105",
    heroCardItems: [
      "Question selection",
      "Smart revision flow",
      "Performance analytics",
      "Daily streak tracker",
    ],
    features: [
      {
        title: "Question-Based Learning",
        description:
          "Retain 90% more information by solving targeted questions designed for neural recall.",
        icon: "QB",
      },
      {
        title: "Video Solutions",
        description:
          "Do not just see the answer. Understand the why with HD conceptual walkthroughs for every problem.",
        icon: "VS",
      },
      {
        title: "AI Doubt Solver",
        description:
          "Stuck on a problem? Our celestial AI explains complex concepts in seconds, 24/7.",
        icon: "AI",
      },
      {
        title: "Smart Notes",
        description:
          "Auto-generated summaries that focus only on what matters for your upcoming exams.",
        icon: "SN",
      },
      {
        title: "Interactive Discussion",
        description:
          "Join cosmic study pods and solve difficult challenges with peers worldwide.",
        icon: "ID",
      },
      {
        title: "Mock Tests",
        description:
          "Simulated exam environments with real-time pressure and ranking analysis.",
        icon: "MT",
      },
      {
        title: "Progress Tracking",
        description:
          "Visualized orbital charts that show your mastery of every topic in real time.",
        icon: "PT",
      },
      {
        title: "Live & Recorded",
        description:
          "Attend live mentor sessions or replay previous missions at your own pace.",
        icon: "LR",
      },
      {
        title: "Revision Playlists",
        description:
          "Curated sets of high-yield questions for the final 48 hours before your exam.",
        icon: "RP",
      },
      {
        title: "Chapter-wise Flow",
        description:
          "Logical progression through syllabus milestones with mastery gates.",
        icon: "CF",
      },
      {
        title: "Exam Updates",
        description:
          "Stay updated on pattern shifts, dates, and notification alerts instantly.",
        icon: "EU",
      },
    ],
    stats: [
      { value: "100K+", label: "Active users" },
      { value: "500+", label: "Master chapters" },
      { value: "10K+", label: "Questions solved" },
      { value: "2K+", label: "HD videos" },
    ],
    footerLinks: ["About Us", "Privacy Policy", "Terms of Service", "Careers", "Contact"],
  };
}

export function createLandingPageState(): LandingPageState {
  return {
    navigation: landingNavigation.map((item, index) => ({
      ...item,
      active: index === 1,
    })),
    heroMetrics: [
      { label: "Weekly missions", value: "24" },
      { label: "Accuracy trend", value: "+18%" },
      { label: "Solved today", value: "143" },
    ],
    content: formatLandingPageData(),
  };
}

export function getLandingAuthRedirectFlags(params: {
  authMode: string | null;
  step: string | null;
  source: string | null;
}) {
  const shouldOpenSignUp = params.authMode === "signUp" && params.step !== "3";
  const shouldOpenSignIn = params.authMode === "signIn";
  const shouldOpenStudentDetails = params.authMode === "signUp" && params.step === "3";
  const shouldShowGoogleMessage = shouldOpenStudentDetails && params.source === "google";

  return {
    shouldOpenSignUp,
    shouldOpenSignIn,
    shouldOpenStudentDetails,
    shouldShowGoogleMessage,
  };
}
