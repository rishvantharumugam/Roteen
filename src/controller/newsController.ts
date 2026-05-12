import { fetchNewsFromDB, type NewsItem } from "@/service/newsService";

export interface NewsResponse {
  items: NewsItem[];
}

export async function getAllNewsResponse(): Promise<NewsResponse> {
  const items = await fetchNewsFromDB();
  return { items };
}
