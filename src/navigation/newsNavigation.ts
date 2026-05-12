import { getAllNewsResponse, type NewsResponse } from "@/controller/newsController";

export async function getAllNews(): Promise<NewsResponse> {
  return getAllNewsResponse();
}
