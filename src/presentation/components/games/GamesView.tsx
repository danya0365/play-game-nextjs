"use client";

import {
  GAMES,
  GAME_CATEGORIES,
  getCategoriesWithCounts,
  getGamesByCategory,
  searchGames,
} from "@/src/domain/data/games";
import type { GameCategoryKey, GameMeta } from "@/src/domain/types/game";
import { ChevronRight, Clock, Filter, Search, Users } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

interface GamesViewProps {
  initialCategory?: GameCategoryKey | null;
}

/**
 * Games List View Component
 */
export function GamesView({ initialCategory }: GamesViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<GameCategoryKey | null>(initialCategory || null);

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

  // Group games by category for display
  const groupedGames = useMemo(() => {
    if (selectedCategory) {
      return { [selectedCategory]: filteredGames };
    }

    return filteredGames.reduce((acc, game) => {
      if (!acc[game.category]) {
        acc[game.category] = [];
      }
      acc[game.category].push(game);
      return acc;
    }, {} as Record<GameCategoryKey, GameMeta[]>);
  }, [filteredGames, selectedCategory]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">เกมทั้งหมด</h1>
        <p className="text-muted">
          เลือกเกมที่คุณต้องการเล่นกับเพื่อน มีมากกว่า {GAMES.length} เกม
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
          <input
            type="text"
            placeholder="ค้นหาเกม..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-info/50 focus:border-info transition-colors"
          />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted pointer-events-none" />
          <select
            value={selectedCategory || ""}
            onChange={(e) =>
              setSelectedCategory((e.target.value as GameCategoryKey) || null)
            }
            className="pl-10 pr-8 py-2.5 rounded-lg border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-info/50 focus:border-info transition-colors appearance-none cursor-pointer min-w-[180px]"
          >
            <option value="">ทุกหมวดหมู่</option>
            {categories.map((cat) => (
              <option key={cat.key} value={cat.key}>
                {cat.icon} {cat.nameTh} ({cat.count})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Category Pills (Mobile Scroll) */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap scrollbar-hide">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            !selectedCategory
              ? "bg-info text-white"
              : "bg-surface border border-border hover:border-info/50"
          }`}
        >
          ทั้งหมด ({GAMES.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setSelectedCategory(cat.key)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === cat.key
                ? "bg-info text-white"
                : "bg-surface border border-border hover:border-info/50"
            }`}
          >
            {cat.icon} {cat.nameTh} ({cat.count})
          </button>
        ))}
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted mb-4">
        พบ {filteredGames.length} เกม
        {searchQuery && ` สำหรับ "${searchQuery}"`}
        {selectedCategory &&
          ` ในหมวด ${GAME_CATEGORIES[selectedCategory].nameTh}`}
      </div>

      {/* Games Grid by Category */}
      {filteredGames.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🎮</div>
          <h3 className="text-xl font-semibold mb-2">ไม่พบเกม</h3>
          <p className="text-muted">ลองค้นหาด้วยคำอื่น หรือเลือกหมวดหมู่อื่น</p>
        </div>
      ) : (
        <div className="space-y-10">
          {(Object.keys(groupedGames) as GameCategoryKey[]).map(
            (categoryKey) => {
              const games = groupedGames[categoryKey];
              if (!games || games.length === 0) return null;
              const category = GAME_CATEGORIES[categoryKey];

              return (
                <section key={categoryKey}>
                  {/* Category Header */}
                  {!selectedCategory && (
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold flex items-center gap-2">
                        <span>{category.icon}</span>
                        <span>{category.nameTh}</span>
                        <span className="text-sm font-normal text-muted">
                          ({games.length})
                        </span>
                      </h2>
                      <button
                        onClick={() => setSelectedCategory(categoryKey)}
                        className="text-sm text-info hover:text-info-dark flex items-center gap-1"
                      >
                        ดูทั้งหมด
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Games Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {games.map((game) => (
                      <GameCard key={game.slug} game={game} />
                    ))}
                  </div>
                </section>
              );
            }
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Game Card Component
 */
function GameCard({ game }: { game: GameMeta }) {
  const isAvailable = game.status === "available";

  return (
    <Link
      href={isAvailable ? `/games/${game.slug}` : "#"}
      className={`group block p-4 rounded-xl border bg-surface transition-all ${
        isAvailable
          ? "border-border hover:border-info/50 hover:shadow-lg cursor-pointer"
          : "border-border/50 opacity-60 cursor-not-allowed"
      }`}
      onClick={(e) => !isAvailable && e.preventDefault()}
    >
      {/* Icon and Status */}
      <div className="flex items-start justify-between mb-3">
        <span className="text-4xl">{game.icon}</span>
        {game.status === "coming_soon" && (
          <span className="px-2 py-0.5 text-xs rounded-full bg-warning/10 text-warning font-medium">
            เร็วๆ นี้
          </span>
        )}
        {game.status === "maintenance" && (
          <span className="px-2 py-0.5 text-xs rounded-full bg-error/10 text-error font-medium">
            ปิดปรับปรุง
          </span>
        )}
      </div>

      {/* Title */}
      <h3
        className={`font-semibold mb-1 ${
          isAvailable ? "group-hover:text-info" : ""
        } transition-colors`}
      >
        {game.nameTh || game.name}
      </h3>
      <p className="text-sm text-muted mb-3">{game.name}</p>

      {/* Players Info */}
      <div className="flex items-center gap-3 text-xs text-muted">
        <div className="flex items-center gap-1">
          <Users className="w-3.5 h-3.5" />
          <span>
            {game.minPlayers === game.maxPlayers
              ? `${game.minPlayers} คน`
              : `${game.minPlayers}-${game.maxPlayers} คน`}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          <span>5-15 นาที</span>
        </div>
      </div>
    </Link>
  );
}
