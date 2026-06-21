import { notificationsApiPath } from "@/features/notification/types/notifications";

export type NotificationTone =
  | "violet"
  | "blue"
  | "emerald"
  | "amber"
  | "rose"
  | "cyan";

export interface NotificationRow {
  id?: string | number | null;
  user_id?: string | null;
  title?: string | null;
  content?: string | null;
  created_at?: string | null;
  posted_at?: string | null;
  is_read?: boolean | null;
  read_at?: string | null;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  timeAgo: string;
  isRead: boolean;
  tone: NotificationTone;
}

export interface NotificationsPageData {
  notifications: NotificationItem[];
  unreadCount: number;
  totalCount: number;
}

export interface NotificationsServiceResult<T> {
  data: T;
  message: string;
}

export class NotificationsServiceError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.name = "NotificationsServiceError";
    this.statusCode = statusCode;
  }
}

interface NotificationsApiSuccess {
  success: true;
  message: string;
  count: number;
  data: NotificationsPageData;
}

interface NotificationsApiFailure {
  success?: false;
  message?: string;
  error?: string;
}

const toneSequence: NotificationTone[] = [
  "violet",
  "blue",
  "emerald",
  "amber",
  "rose",
  "cyan",
];

function trimValue(value: string | null | undefined) {
  return (value ?? "").trim();
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

function getSupabaseConfig(userId: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new NotificationsServiceError(
      "Supabase notification environment variables are missing.",
      500,
    );
  }

  if (!userId) {
    throw new NotificationsServiceError(
      "Logged-in notification user id is missing.",
      401,
    );
  }

  return {
    supabaseUrl,
    supabaseAccessKey: supabaseServiceRoleKey || supabaseAnonKey,
    userId,
  };
}

function createNotificationsUrl(supabaseUrl: string) {
  return new URL("/rest/v1/notifications", supabaseUrl);
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
      "Supabase notifications request failed."
    );
  } catch {
    return "Supabase notifications request failed.";
  }
}

function resolveCreatedAt(row: NotificationRow, index: number) {
  const date = new Date(trimValue(row.posted_at ?? row.created_at));

  if (!Number.isNaN(date.getTime())) {
    return date.toISOString();
  }

  return new Date(Date.now() - index * 60 * 60 * 1000).toISOString();
}

function formatTimeAgo(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Just now";
  }

  const diffMs = Date.now() - date.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < minute) {
    return "Just now";
  }

  if (diffMs < hour) {
    const minutes = Math.max(1, Math.round(diffMs / minute));
    return `${minutes} min ago`;
  }

  if (diffMs < day) {
    const hours = Math.max(1, Math.round(diffMs / hour));
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  const days = Math.max(1, Math.round(diffMs / day));
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export function mapNotificationData(
  row: NotificationRow,
  index: number,
): NotificationItem {
  const createdAt = resolveCreatedAt(row, index);

  return {
    id: trimValue(String(row.id ?? "")) || `notification-${index + 1}`,
    title: trimValue(row.title) || "Notification",
    description: trimValue(row.content) || "You have a new update in your dashboard.",
    createdAt,
    timeAgo: formatTimeAgo(createdAt),
    isRead: Boolean(row.is_read || row.read_at),
    tone: toneSequence[index % toneSequence.length],
  };
}

export function sortNotifications(notifications: NotificationItem[]) {
  return [...notifications].sort(
    (first, second) =>
      new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime(),
  );
}

export function getUnreadNotifications(notifications: NotificationItem[]) {
  return notifications.filter((notification) => !notification.isRead);
}

export function formatNotifications(rows: NotificationRow[]) {
  return sortNotifications(rows.map(mapNotificationData));
}

function buildPageData(rows: NotificationRow[]): NotificationsPageData {
  const notifications = formatNotifications(rows);

  return {
    notifications,
    unreadCount: getUnreadNotifications(notifications).length,
    totalCount: notifications.length,
  };
}

async function fetchNotificationRowsWithOrder(
  userId: string,
  orderColumn: "posted_at" | "created_at" | "id",
) {
  const { supabaseUrl, supabaseAccessKey } = getSupabaseConfig(userId);
  const url = createNotificationsUrl(supabaseUrl);

  url.searchParams.set("select", "*");
  url.searchParams.set("user_id", `eq.${userId}`);
  url.searchParams.set("order", `${orderColumn}.desc`);
  url.searchParams.set("limit", "50");

  const response = await fetch(url, {
    method: "GET",
    headers: createSupabaseHeaders(supabaseAccessKey),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new NotificationsServiceError(
      await readErrorMessage(response),
      response.status,
    );
  }

  return (await response.json()) as NotificationRow[];
}

async function fetchNotificationRowsFromSupabase(userId: string) {
  try {
    return await fetchNotificationRowsWithOrder(userId, "posted_at");
  } catch (error) {
    if (
      error instanceof NotificationsServiceError &&
      error.message.toLowerCase().includes("posted_at")
    ) {
      return fetchNotificationRowsWithOrder(userId, "created_at");
    }

    if (
      error instanceof NotificationsServiceError &&
      error.message.toLowerCase().includes("created_at")
    ) {
      return fetchNotificationRowsWithOrder(userId, "id");
    }

    throw error;
  }
}

async function fetchNotificationsPageFromApi() {
  const response = await fetch(notificationsApiPath, {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    let message = "We could not load notifications.";

    try {
      const payload = (await response.json()) as NotificationsApiFailure;
      message = payload.message || payload.error || message;
    } catch {
      // Keep default message.
    }

    throw new NotificationsServiceError(message, response.status);
  }

  const payload = (await response.json()) as NotificationsApiSuccess;
  return payload.data;
}

export const notificationsService = {
  async fetchNotificationsPage(): Promise<
    NotificationsServiceResult<NotificationsPageData>
  > {
    const data = await fetchNotificationsPageFromApi();

    return {
      data,
      message: "Notifications loaded.",
    };
  },

  async fetchNotificationsPageFromSupabase(
    userId: string,
  ): Promise<
    NotificationsServiceResult<NotificationsPageData>
  > {
    const rows = await fetchNotificationRowsFromSupabase(userId);

    return {
      data: buildPageData(rows),
      message: "Notifications loaded from Supabase.",
    };
  },

  async markAsRead(notificationId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${notificationsApiPath}?id=${encodeURIComponent(notificationId)}`, {
        method: "PATCH",
      });
      if (!response.ok) {
        throw new Error("Failed to mark notification as read.");
      }
      return (await response.json()) as { success: boolean; error?: string };
    } catch (err: any) {
      return { success: false, error: err?.message || "Failed to mark notification as read." };
    }
  },
};


