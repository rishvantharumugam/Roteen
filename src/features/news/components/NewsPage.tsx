"use client";

import { useEffect, useMemo, useState } from "react";
import { Newspaper, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAllNews } from "@/features/news/constants/newsNavigation";
import { appRoutes } from "@/constants/AppRoutes";
import { prefetchCoreRoutes } from "@/constants/prefetch";
import type { NewsItem } from "@/features/news/services/newsService";
import NewsList from "@/features/news/components/NewsList";
import NewsModal from "@/features/news/components/NewsModal";
import { HeaderSettingsMenu } from "@/components/layout/HeaderSettingsMenu";
import { applyRouteThemeClass } from "@/lib/RouteThemeScope";
import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader";


const menuItems = [
  "Home",
  "Dashboard",
  "Notes",
  "Revision",
  "Sessions",
  "News",
];
const newsCacheKey = "roteen_news_cache";
const newsMemoryCache: { items: NewsItem[]; expiresAt: number } = { items: [], expiresAt: 0 };
const NEWS_CACHE_TTL_MS = 60_000;

const menuRouteMap: Record<string, string> = {
  Home: appRoutes.home,
  Dashboard: appRoutes.dashboard,
  Notes: appRoutes.notes,
  Revision: appRoutes.revision,
  Sessions: appRoutes.sessions,
  News: appRoutes.news,
};

function readNewsCacheFromLocalStorage() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const cached = localStorage.getItem(newsCacheKey);
    if (!cached) {
      return [];
    }

    const parsed = JSON.parse(cached) as NewsItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function NewsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [items, setItems] = useState<NewsItem[]>([]);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    prefetchCoreRoutes(router);
  }, [router]);

  useEffect(() => {
    let isActive = true;

    const fetchPageData = async () => {
      const now = Date.now();

      const localCachedItems = readNewsCacheFromLocalStorage();
      if (localCachedItems.length > 0 && isActive) {
        setItems(localCachedItems);
        newsMemoryCache.items = localCachedItems;
        newsMemoryCache.expiresAt = now + NEWS_CACHE_TTL_MS;
      }

      if (newsMemoryCache.items.length > 0 && newsMemoryCache.expiresAt > now) {
        setItems(newsMemoryCache.items);
        if (isActive) setIsLoading(false);
        return;
      }

      try {
        const response = await getAllNews();
        if (isActive) {
          setItems(response.items);
          newsMemoryCache.items = response.items;
          newsMemoryCache.expiresAt = now + NEWS_CACHE_TTL_MS;
          localStorage.setItem(newsCacheKey, JSON.stringify(response.items));
        }
      } catch {
        // Keep cached items for fast fallback when network is slow.
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    fetchPageData();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!isModalOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsModalOpen(false);
        setSelectedNews(null);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isModalOpen]);

  const handleOpenModal = (item: NewsItem) => {
    setSelectedNews(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedNews(null);
  };

  const filteredItems = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (!normalizedSearch) {
      return items;
    }

    return items.filter((item) => {
      const title = item.title.toLowerCase();
      const content = item.content.toLowerCase();
      return title.includes(normalizedSearch) || content.includes(normalizedSearch);
    });
  }, [items, searchTerm]);

  return (
    <main className={`bg-black text-zinc-200 min-h-screen news-page-theme h-screen overflow-hidden  text-white`}>
      <DashboardHeader activeLabel="News" />

      <div className="w-full max-w-5xl mx-auto px-6 py-8 h-[calc(100vh-72px)] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white inline-block border-b-2 border-[#7C3AED] pb-1">
            News
          </h2>
        </div>

        <NewsList items={filteredItems} onSelect={handleOpenModal} isLoading={isLoading} />
      </div>

      {isModalOpen && selectedNews ? (
        <NewsModal data={selectedNews} onClose={handleCloseModal} />
      ) : null}
    </main>
  );
}
