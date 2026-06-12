"use client";

import { useCallback, useEffect, useState } from "react";
import type { NewsItem } from "@/lib/types";

const READ_KEY = "radar-read-ids-v1";
const FAV_KEY = "radar-favorites-v1";

// 资讯雷达阅读态：已读 id 集合 + 收藏的完整资讯（便于带入选题生产），持久化到 localStorage。
export function useReader() {
  const [readIds, setReadIds] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<NewsItem[]>([]);
  const [restored, setRestored] = useState(false);

  useEffect(() => {
    try {
      const r = localStorage.getItem(READ_KEY);
      if (r) setReadIds(JSON.parse(r));
      const f = localStorage.getItem(FAV_KEY);
      if (f) setFavorites(JSON.parse(f));
    } catch {
      // ignore
    }
    setRestored(true);
  }, []);

  useEffect(() => {
    if (!restored) return;
    try {
      localStorage.setItem(READ_KEY, JSON.stringify(readIds));
    } catch {
      // ignore
    }
  }, [readIds, restored]);

  useEffect(() => {
    if (!restored) return;
    try {
      localStorage.setItem(FAV_KEY, JSON.stringify(favorites));
    } catch {
      // ignore
    }
  }, [favorites, restored]);

  const markRead = useCallback((id: string) => {
    setReadIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const toggleFavorite = useCallback((item: NewsItem) => {
    setFavorites((prev) =>
      prev.some((f) => f.id === item.id)
        ? prev.filter((f) => f.id !== item.id)
        : [...prev, item]
    );
  }, []);

  const clearFavorites = useCallback(() => setFavorites([]), []);

  const isRead = useCallback((id: string) => readIds.includes(id), [readIds]);
  const isFav = useCallback(
    (id: string) => favorites.some((f) => f.id === id),
    [favorites]
  );

  return {
    readIds,
    favorites,
    restored,
    markRead,
    toggleFavorite,
    clearFavorites,
    isRead,
    isFav,
  };
}
