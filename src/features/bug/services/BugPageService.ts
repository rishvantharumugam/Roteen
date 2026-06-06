export const BUG_TABLE = "bugs";
export const DEFAULT_BUG_STATUS = "Not open";

export const bugCategories = ["Quiz", "Login Glitch", "Authentication", "UI / UX", "Video Not Clear", "Other"] as const;
export const bugPriorities = ["Low", "Medium", "High"] as const;

export const priorityDetails = {
  Low: { label: "Low - Small, harmless issues", colorClass: "text-green-500" },
  Medium: { label: "Medium - Affects usability", colorClass: "text-yellow-500" },
  High: { label: "High - Critical breakage", colorClass: "text-red-500" },
} as const;

export type BugCategory = (typeof bugCategories)[number];
export type BugPriority = (typeof bugPriorities)[number];

export type BugRecord = {
  id: string;
  title: string | null;
  category: string | null;
  priority: string | null;
  description: string | null;
  image_url: string | null;
  status: string | null;
  reported_at: string | null;
};

export type BugFormState = {
  title: string;
  category: BugCategory;
  priority: BugPriority;
  description: string;
};

export type BugStatus = typeof DEFAULT_BUG_STATUS | "In Progress" | "Resolved";

export const defaultFormState: BugFormState = {
  title: "",
  category: "Quiz",
  priority: "Low",
  description: "",
};

export const bugSelectColumns = "id, title, category, priority, description, image_url, status, reported_at";

export function validateBugForm(form: BugFormState) {
  if (!form.title.trim()) {
    return "Please enter a bug title.";
  }

  if (!form.description.trim()) {
    return "Please enter a bug description.";
  }

  return "";
}

export function formatBugCode(id: string) {
  return id.trim() || "Bug";
}

export function generateId() {
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `#RN-${randomPart}`;
}

export function formatDate(value: string | null) {
  if (!value) return "Recently";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Recently";
  return parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function getPriorityColor(priority: string | null) {
  const p = priority?.toLowerCase();
  if (p === "high") return "text-red-500";
  if (p === "medium") return "text-yellow-500";
  return "text-green-500";
}

export function getBugStatus(status: string | null): BugStatus {
  const normalized = status?.trim().toLowerCase().replace(/[_-]+/g, " ") ?? "";

  if (normalized === "in progress") return "In Progress";
  if (normalized === "resolved") return "Resolved";
  if (normalized === "open" || normalized === "not open") return DEFAULT_BUG_STATUS;
  return DEFAULT_BUG_STATUS;
}

export function getSafeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-");
}

export async function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(new Error("Could not read screenshot."));
    reader.readAsDataURL(file);
  });
}
