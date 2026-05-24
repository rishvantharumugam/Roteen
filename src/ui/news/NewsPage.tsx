"use client";

import { useEffect, useMemo, useState } from "react";
import { Newspaper, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAllNews } from "@/navigation/newsNavigation";
import { appRoutes } from "@/navigation/AppRoutes";
import { prefetchCoreRoutes } from "@/navigation/prefetch";
import type { NewsItem } from "@/service/newsService";
import NewsList from "@/store/news/NewsList";
import NewsModal from "@/store/news/NewsModal";
import { HeaderSettingsMenu } from "@/store/shared/HeaderSettingsMenu";
import { applyRouteThemeClass } from "@/lib/RouteThemeScope";
import { newsStyles } from "@/styles/newsStyles";

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
    <main className={`news-page-theme ${newsStyles.container}`}>
      <header className={newsStyles.navbar}>
        <div className={newsStyles.brandGroup}>
          <div className={newsStyles.logoBadge}>R</div>
          <h1 className={newsStyles.brandText}>Roteen</h1>
        </div>

        <nav className={newsStyles.navMenu}>
          {menuItems.map((item) => (
            menuRouteMap[item] ? (
              <Link
                key={item}
                href={menuRouteMap[item]}
                prefetch
                onClick={() => applyRouteThemeClass(menuRouteMap[item])}
                className={item === "News" ? newsStyles.navItemActive : newsStyles.navItem}
              >
                {item}
              </Link>
            ) : (
              <span key={item} className={newsStyles.navItem}>
                {item}
              </span>
            )
          ))}
        </nav>

        <div className={newsStyles.navActions}>
          <button type="button" aria-label="Theme" className={newsStyles.iconButton}>
            <svg className={newsStyles.iconSize} viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M21 12.79A9 9 0 1 1 11.21 3A7 7 0 0 0 21 12.79Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button type="button" aria-label="Notifications" className={newsStyles.bellButton}>
            <svg className={newsStyles.iconSize} viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 17H5l1.4-1.4A2 2 0 0 0 7 14.2V11a5 5 0 1 1 10 0v3.2a2 2 0 0 0 .6 1.4L19 17h-4Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M10 19a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <span className={newsStyles.bellDot} />
          </button>
          <HeaderSettingsMenu />
        </div>
      </header>

      <div className={newsStyles.pageBody}>
        <section className={newsStyles.headerRow}>
          <div className={newsStyles.headerLeft}>
            <div className={newsStyles.headerTitleRow}>
              <span className={newsStyles.pageIcon}>
                <Newspaper className={newsStyles.iconSize} />
              </span>
              <h2 className={newsStyles.pageTitle}>News</h2>
            </div>
            <p className={newsStyles.pageSubtitle}>
              Stay updated with the latest announcements and important updates.
            </p>
          </div>

          <label className={newsStyles.searchWrap}>
            <Search className={newsStyles.searchIcon} />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search news..."
              className={newsStyles.searchInput}
            />
          </label>
        </section>

        <NewsList items={filteredItems} onSelect={handleOpenModal} />
      </div>

      {isModalOpen && selectedNews ? (
        <NewsModal data={selectedNews} onClose={handleCloseModal} />
      ) : null}
    </main>
  );
}
