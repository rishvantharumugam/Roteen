import { fetchNewsFromDB, type NewsItem } from "@/features/news/services/newsService";

export interface NewsResponse {
  items: NewsItem[];
}

export async function getAllNewsResponse(): Promise<NewsResponse> {
  const items = await fetchNewsFromDB();
  return { items };
}
