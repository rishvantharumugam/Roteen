export type FeedbackCategory =
  | "Product Experience"
  | "Learning Content"
  | "Dashboard"
  | "Support"
  | "Other";

export interface FeedbackRow {
  id?: string | number | null;
  user_id?: string | null;
  feedback?: string | null;
  category?: string | null;
  rating?: number | null;
  created_at?: string | null;
}

export interface FeedbackItem {
  id: string;
  name: string;
  email: string;
  rating: number;
  category: FeedbackCategory;
  comment: string;
  status: string;
  createdAt: string;
  createdAtLabel: string;
}

export interface FeedbackFormInput {
  name: string;
  email: string;
  rating: number;
  category: FeedbackCategory;
  comment: string;
  userId?: string | null;
}

export interface FeedbackStats {
  totalReviews: number;
  averageRating: number;
  satisfactionPercent: number;
  latestReviewLabel: string;
  ratingDistribution: Array<{
    rating: number;
    count: number;
    percent: number;
  }>;
}

export interface FeedbackPageData {
  feedback: FeedbackItem[];
  stats: FeedbackStats;
  categories: FeedbackCategory[];
}

export interface FeedbackSubmissionResult {
  feedback: FeedbackItem;
  pageData: FeedbackPageData;
}

export interface FeedbackServiceResult<T> {
  data: T;
  message: string;
}

export class FeedbackServiceError extends Error {
  statusCode: number;
  fieldErrors?: Partial<Record<keyof FeedbackFormInput, string>>;

  constructor(
    message: string,
    statusCode = 500,
    fieldErrors?: Partial<Record<keyof FeedbackFormInput, string>>,
  ) {
    super(message);
    this.name = "FeedbackServiceError";
    this.statusCode = statusCode;
    this.fieldErrors = fieldErrors;
  }
}

const fallbackCategory: FeedbackCategory = "Product Experience";

export const feedbackCategories: FeedbackCategory[] = [
  "Product Experience",
  "Learning Content",
  "Dashboard",
  "Support",
  "Other",
];

function trimValue(value: string | null | undefined) {
  return (value ?? "").trim();
}

function normalizeRating(value: unknown) {
  const rating = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(rating)) {
    return 0;
  }

  return Math.max(0, Math.min(5, Math.round(rating)));
}

function normalizeCategory(value: string | null | undefined): FeedbackCategory {
  const normalizedValue = trimValue(value);
  const category = feedbackCategories.find((item) => item === normalizedValue);

  return category ?? fallbackCategory;
}

function createSupabaseHeaders(
  supabaseAccessKey: string,
  extraHeaders?: HeadersInit,
) {
  return {
    apikey: supabaseAccessKey,
    Authorization: `Bearer ${supabaseAccessKey}`,
    ...extraHeaders,
  };
}

function getSupabaseConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const userId = process.env.NOTES_USER_ID;
  const feedbackTableName = process.env.FEEDBACK_TABLE_NAME || "feedbacks";

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new FeedbackServiceError(
      "Supabase feedback environment variables are missing.",
      500,
    );
  }

  return {
    supabaseUrl,
    supabaseAccessKey: supabaseServiceRoleKey || supabaseAnonKey,
    userId,
    feedbackTableName,
  };
}

function createFeedbackUrl(supabaseUrl: string, feedbackTableName: string) {
  return new URL(`/rest/v1/${feedbackTableName}`, supabaseUrl);
}

async function readErrorMessage(response: Response) {
  try {
    const payload = (await response.json()) as {
      message?: string;
      error?: string;
      details?: string;
    };

    return (
      payload.message ||
      payload.error ||
      payload.details ||
      "Supabase feedback request failed."
    );
  } catch {
    return "Supabase feedback request failed.";
  }
}

function normalizeFeedbackItem(row: FeedbackRow, index: number): FeedbackItem {
  const createdAt = row.created_at || new Date().toISOString();

  return {
    id: trimValue(String(row.id ?? "")) || `feedback-${index + 1}`,
    name: "Roteen Student",
    email: "",
    rating: normalizeRating(row.rating),
    category: normalizeCategory(row.category),
    comment: trimValue(row.feedback) || "Shared helpful product feedback.",
    status: "Saved",
    createdAt,
    createdAtLabel: "Saved feedback",
  };
}

function createStats(feedback: FeedbackItem[]): FeedbackStats {
  const totalReviews = feedback.length;
  const totalRating = feedback.reduce((sum, item) => sum + item.rating, 0);
  const averageRating = totalReviews
    ? Number((totalRating / totalReviews).toFixed(1))
    : 0;
  const positiveReviews = feedback.filter((item) => item.rating >= 4).length;
  const satisfactionPercent = totalReviews
    ? Math.round((positiveReviews / totalReviews) * 100)
    : 0;

  return {
    totalReviews,
    averageRating,
    satisfactionPercent,
    latestReviewLabel: feedback[0]?.createdAtLabel ?? "No reviews yet",
    ratingDistribution: [5, 4, 3, 2, 1].map((rating) => {
      const count = feedback.filter((item) => item.rating === rating).length;

      return {
        rating,
        count,
        percent: totalReviews ? Math.round((count / totalReviews) * 100) : 0,
      };
    }),
  };
}

function buildPageData(rows: FeedbackRow[]): FeedbackPageData {
  const feedback = rows.map(normalizeFeedbackItem);

  return {
    feedback,
    stats: createStats(feedback),
    categories: [...feedbackCategories],
  };
}

function normalizeSubmissionInput(input: FeedbackFormInput): FeedbackFormInput {
  return {
    name: trimValue(input.name).replace(/\s+/g, " "),
    email: trimValue(input.email).toLowerCase(),
    rating: normalizeRating(input.rating),
    category: normalizeCategory(input.category),
    comment: trimValue(input.comment).replace(/\s+/g, " "),
    userId: input.userId,
  };
}

export function validateFeedbackInput(input: FeedbackFormInput) {
  const normalizedInput = normalizeSubmissionInput(input);
  const fieldErrors: Partial<Record<keyof FeedbackFormInput, string>> = {};

  if (
    normalizedInput.email &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedInput.email)
  ) {
    fieldErrors.email = "Enter a valid email address.";
  }

  if (normalizedInput.comment.length < 12) {
    fieldErrors.comment = "Share at least 12 characters of feedback.";
  }

  if (normalizedInput.comment.length > 600) {
    fieldErrors.comment = "Keep feedback under 600 characters.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    throw new FeedbackServiceError(
      "Please fix the highlighted feedback fields.",
      400,
      fieldErrors,
    );
  }

  return normalizedInput;
}

function createInsertPayload(input: FeedbackFormInput) {
  const { userId } = getSupabaseConfig();

  return {
    user_id: input.userId || userId || null,
    feedback: input.comment,
    category: input.category,
    rating: input.rating,
  };
}

async function fetchFeedbackRowsFromSupabase() {
  const { supabaseUrl, supabaseAccessKey, feedbackTableName } = getSupabaseConfig();
  const url = createFeedbackUrl(supabaseUrl, feedbackTableName);

  url.searchParams.set("select", "id,user_id,feedback,category,rating,created_at");
  url.searchParams.set("order", "created_at.desc");
  url.searchParams.set("limit", "24");

  const response = await fetch(url, {
    method: "GET",
    headers: createSupabaseHeaders(supabaseAccessKey),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new FeedbackServiceError(await readErrorMessage(response), response.status);
  }

  return (await response.json()) as FeedbackRow[];
}

async function insertFeedbackRowToSupabase(input: FeedbackFormInput) {
  const { supabaseUrl, supabaseAccessKey, feedbackTableName } = getSupabaseConfig();
  const response = await fetch(createFeedbackUrl(supabaseUrl, feedbackTableName), {
    method: "POST",
    headers: createSupabaseHeaders(supabaseAccessKey, {
      "Content-Type": "application/json",
      Prefer: "return=representation",
    }),
    body: JSON.stringify(createInsertPayload(input)),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new FeedbackServiceError(await readErrorMessage(response), response.status);
  }

  const payload = (await response.json()) as FeedbackRow[] | FeedbackRow | null;

  if (Array.isArray(payload)) {
    return payload[0] ?? null;
  }

  return payload;
}

export const feedbackService = {
  async fetchFeedbackPageFromSupabase(): Promise<
    FeedbackServiceResult<FeedbackPageData>
  > {
    const rows = await fetchFeedbackRowsFromSupabase();

    return {
      data: buildPageData(rows),
      message: "Feedback loaded from Supabase.",
    };
  },

  async submitFeedbackToSupabase(
    input: FeedbackFormInput,
  ): Promise<FeedbackServiceResult<FeedbackSubmissionResult>> {
    const normalizedInput = validateFeedbackInput(input);
    const submittedRow = await insertFeedbackRowToSupabase(normalizedInput);
    const rows = await fetchFeedbackRowsFromSupabase();
    const pageData = buildPageData(rows);
    const submittedFeedback =
      pageData.feedback.find(
        (item) =>
          item.id === trimValue(String(submittedRow?.id ?? "")) ||
          item.comment === normalizedInput.comment &&
            item.category === normalizedInput.category,
      ) ??
      normalizeFeedbackItem(
        submittedRow ?? {
          feedback: normalizedInput.comment,
          category: normalizedInput.category,
        },
        0,
      );

    return {
      data: {
        feedback: submittedFeedback,
        pageData,
      },
      message: "Feedback submitted successfully.",
    };
  },
};
