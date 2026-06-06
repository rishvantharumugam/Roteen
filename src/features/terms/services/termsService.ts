import { termsAcceptanceStorageKey } from "@/features/terms/types/terms";

export interface TermsMetric {
  id: string;
  label: string;
  value: string;
  description: string;
}

export interface TermsListGroup {
  id: string;
  title: string;
  items: string[];
}

export interface TermsSection {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  highlights: string[];
  lists: TermsListGroup[];
}

export interface TermsAgreement {
  title: string;
  summary: string;
  confirmLabel: string;
  acceptedLabel: string;
}

export interface TermsPageData {
  title: string;
  subtitle: string;
  effectiveDate: string;
  version: string;
  owner: string;
  metrics: TermsMetric[];
  sections: TermsSection[];
  agreement: TermsAgreement;
  contactEmail: string;
}

export interface TermsServiceResult<T> {
  data: T;
  message: string;
}

export class TermsServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TermsServiceError";
  }
}

const termsPageData: TermsPageData = {
  title: "Terms & Conditions",
  subtitle:
    "Review the standards that keep the Roteen learning dashboard secure, reliable, and fair for every student.",
  effectiveDate: "May 28, 2026",
  version: "v2.4",
  owner: "Roteen Legal Operations",
  contactEmail: "legal@roteen.app",
  metrics: [
    {
      id: "coverage",
      label: "Coverage",
      value: "Global",
      description: "Applies to every Roteen dashboard, profile, tutorial, and feedback experience.",
    },
    {
      id: "review",
      label: "Review cycle",
      value: "90 days",
      description: "Terms are reviewed quarterly for product, security, and compliance updates.",
    },
    {
      id: "support",
      label: "Legal support",
      value: "24h",
      description: "Priority response window for account, access, and data-use questions.",
    },
  ],
  sections: [
    {
      id: "account-access",
      eyebrow: "01",
      title: "Account Access",
      description:
        "Your account gives you access to personalized learning tools, progress tracking, profile services, and product feedback features.",
      highlights: [
        "Keep login details private and accurate.",
        "Use the dashboard only for legitimate learning activity.",
        "Notify support if you suspect unauthorized access.",
      ],
      lists: [
        {
          id: "account-responsibilities",
          title: "Responsibilities",
          items: [
            "Maintain current profile and contact information.",
            "Avoid sharing sessions, credentials, or referral codes for misuse.",
            "Respect account limits and product access controls.",
          ],
        },
      ],
    },
    {
      id: "acceptable-use",
      eyebrow: "02",
      title: "Acceptable Use",
      description:
        "Roteen is designed for focused education, constructive collaboration, and safe product interaction.",
      highlights: [
        "Do not attempt to disrupt services or bypass access restrictions.",
        "Do not upload harmful, misleading, infringing, or abusive content.",
        "Use feedback channels to improve the product, not to harass others.",
      ],
      lists: [
        {
          id: "prohibited-actions",
          title: "Prohibited actions",
          items: [
            "Reverse engineering, scraping, or automated abuse of the platform.",
            "Submitting malicious files, scripts, or deceptive profile data.",
            "Impersonating another learner, institution, or Roteen representative.",
          ],
        },
      ],
    },
    {
      id: "learning-content",
      eyebrow: "03",
      title: "Learning Content",
      description:
        "Tutorials, lessons, UI materials, and dashboard resources are provided to support learning outcomes.",
      highlights: [
        "Content may evolve as curriculum and product capabilities improve.",
        "Progress indicators are informational and may depend on available data.",
        "Roteen content should not be redistributed without permission.",
      ],
      lists: [
        {
          id: "content-rights",
          title: "Content rights",
          items: [
            "Roteen and its licensors retain ownership of platform materials.",
            "You may use materials for personal study and authorized academic purposes.",
            "Feedback you submit may be used to improve dashboard features.",
          ],
        },
      ],
    },
    {
      id: "privacy-security",
      eyebrow: "04",
      title: "Privacy & Security",
      description:
        "We use profile, learning, and feedback data to operate the product and improve learner experience.",
      highlights: [
        "We apply access controls and operational safeguards to account data.",
        "Uploaded profile assets should belong to you or be approved for use.",
        "Security concerns should be reported quickly through official channels.",
      ],
      lists: [
        {
          id: "data-handling",
          title: "Data handling",
          items: [
            "Profile details support personalization and account administration.",
            "Feedback data helps prioritize product quality improvements.",
            "Local preferences may be stored in your browser for continuity.",
          ],
        },
      ],
    },
    {
      id: "changes-termination",
      eyebrow: "05",
      title: "Changes & Termination",
      description:
        "We may update these terms as the Roteen product, dashboard, and compliance requirements change.",
      highlights: [
        "Material updates will be reflected by a new version and effective date.",
        "Access may be limited for harmful behavior or unresolved violations.",
        "Continuing to use Roteen after updates means you accept the revised terms.",
      ],
      lists: [
        {
          id: "review-process",
          title: "Review process",
          items: [
            "We keep terms concise and aligned with current product behavior.",
            "Questions are reviewed by the Roteen operations team.",
            "Critical account issues are escalated through support workflows.",
          ],
        },
      ],
    },
  ],
  agreement: {
    title: "Agreement Status",
    summary:
      "Accepting confirms that you have reviewed these terms and understand the standards for using Roteen.",
    confirmLabel: "I have reviewed and accept the Terms & Conditions.",
    acceptedLabel: "Terms accepted for this browser.",
  },
};

export function readTermsAcceptance() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(termsAcceptanceStorageKey) === "true";
}

export function persistTermsAcceptance(accepted: boolean) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(termsAcceptanceStorageKey, String(accepted));
}

export function validateTermsAcceptance(accepted: boolean) {
  if (!accepted) {
    throw new TermsServiceError("Please confirm that you reviewed the terms.");
  }
}

export const termsService = {
  async fetchTermsPage(): Promise<TermsServiceResult<TermsPageData>> {
    return {
      data: {
        ...termsPageData,
        metrics: termsPageData.metrics.map((metric) => ({ ...metric })),
        sections: termsPageData.sections.map((section) => ({
          ...section,
          highlights: [...section.highlights],
          lists: section.lists.map((list) => ({
            ...list,
            items: [...list.items],
          })),
        })),
        agreement: { ...termsPageData.agreement },
      },
      message: "Terms loaded.",
    };
  },

  async acceptTerms(accepted: boolean): Promise<TermsServiceResult<{ accepted: true }>> {
    validateTermsAcceptance(accepted);
    persistTermsAcceptance(true);

    return {
      data: { accepted: true },
      message: "Terms accepted.",
    };
  },
};

