"use client";

import {
  GAMES,
  GAME_CATEGORIES,
  getCategoriesWithCounts,
  getGamesByCategory,
  searchGames,
} from "@/src/domain/data/games";
import type { GameCategoryKey, GameMeta } from "@/src/domain/types/game";
import { Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { GameCarousel } from "./GameCarousel";

interface GamesViewProps {
  initialCategory?: GameCategoryKey | null;
}

/**
 * Games List View Component - Full viewport, no scroll design
 */
export function GamesView({ initialCategory }: GamesViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<GameCategoryKey | null>(initialCategory || null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const categories = useMemo(() => getCategoriesWithCounts(), []);

  // Filter games based on search and category
  const filteredGames = useMemo(() => {
    let games: GameMeta[] = selectedCategory
      ? getGamesByCategory(selectedCategory)
      : GAMES;

    if (searchQuery.trim()) {
      const searched = searchGames(searchQuery);
      games = games.filter((g) => searched.some((s) => s.slug === g.slug));
    }

    return games;
  }, [searchQuery, selectedCategory]);

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === "Escape") {
        searchInputRef.current?.blur();
        setIsSearchFocused(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col overflow-hidden bg-background">
      {/* Top Bar - Search & Filters */}
      <div className="shrink-0 px-4 sm:px-8 py-4 border-b border-border bg-surface/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          {/* Title & Search Row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">🎮 เกมทั้งหมด</h1>
              <p className="text-sm text-muted mt-1">
                {filteredGames.length} เกม
                {searchQuery && ` • ค้นหา "${searchQuery}"`}
                {selectedCategory &&
                  ` • ${GAME_CATEGORIES[selectedCategory].nameTh}`}
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="ค้นหาเกม... (⌘K)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className={`w-full sm:w-64 pl-9 pr-8 py-2 rounded-full border bg-background text-sm focus:outline-none transition-all duration-200 ${
                  isSearchFocused
                    ? "border-info ring-2 ring-info/20 sm:w-80"
                    : "border-border hover:border-info/50"
                }`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                !selectedCategory
                  ? "bg-info text-white shadow-lg shadow-info/25"
                  : "bg-background border border-border hover:border-info/50 hover:bg-surface"
              }`}
            >
              ทั้งหมด
              <span className="ml-1.5 opacity-70">({GAMES.length})</span>
            </button>
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() =>
                  setSelectedCategory(
                    selectedCategory === cat.key ? null : cat.key
                  )
                }
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedCategory === cat.key
                    ? "bg-info text-white shadow-lg shadow-info/25"
                    : "bg-background border border-border hover:border-info/50 hover:bg-surface"
                }`}
              >
                <span className="mr-1.5">{cat.icon}</span>
                {cat.nameTh}
                <span className="ml-1.5 opacity-70">({cat.count})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Carousel Area - Takes remaining space */}
      <div className="flex-1 min-h-0 py-8">
        <GameCarousel games={filteredGames} />
      </div>

      {/* Bottom Hint */}
      <div className="shrink-0 py-4 text-center text-xs text-muted border-t border-border/50">
        <span className="hidden sm:inline">
          ใช้ ← → หรือลากเพื่อเลื่อนดูเกม • กด Enter เพื่อเล่น
        </span>
        <span className="sm:hidden">ลากซ้าย-ขวาเพื่อเลื่อนดูเกม</span>
      </div>
    </div>
  );
}
