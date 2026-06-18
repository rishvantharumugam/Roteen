import { supabase } from '@/lib/supabase/client';

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  date: string;
  time: string;
  publishedLabel: string;
}

interface NewsRow {
  id: string | number;
  title: string | null;
  content: string | null;
  created_at: string | null;
  posted_at?: string | null;
}

function formatNewsDateTime(date: Date): { date: string; time: string; publishedLabel: string } {
  const datePart = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(date);

  const timePart = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  }).format(date);

  return {
    date: datePart,
    time: timePart,
    publishedLabel: `${datePart} \u2022 ${timePart}`,
  };
}

export async function fetchNewsFromDB(): Promise<NewsItem[]> {
  const { data, error } = await supabase
    .from("news")
    .select("id, title, content, posted_at");

  if (error) {
    throw new Error(`Failed to fetch news: ${error.message}`);
  }

  const mappedItems = ((data ?? []) as NewsRow[]).map((row) => {
    const createdAt = row.created_at ?? row.posted_at ?? new Date().toISOString();
    const publishedDate = new Date(createdAt);
    const formattedDate = formatNewsDateTime(publishedDate);

    return {
      id: String(row.id),
      title: String(row.title ?? "Untitled"),
      content: String(row.content ?? ""),
      createdAt,
      date: formattedDate.date,
      time: formattedDate.time,
      publishedLabel: formattedDate.publishedLabel,
    };
  });

  return mappedItems.sort(
    (left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );
}
