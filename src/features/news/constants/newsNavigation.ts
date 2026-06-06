import { getAllNewsResponse, type NewsResponse } from "@/features/news/actions/newsController";

export async function getAllNews(): Promise<NewsResponse> {
  return getAllNewsResponse();
}
