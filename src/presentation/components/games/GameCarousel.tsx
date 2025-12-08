"use client";

import type { GameMeta } from "@/src/domain/types/game";
import { animated, useSpring } from "@react-spring/web";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

interface GameCarouselProps {
  games: GameMeta[];
  onGameSelect?: (game: GameMeta) => void;
}

/**
 * Infinite Carousel Component using react-spring
 */
export function GameCarousel({ games, onGameSelect }: GameCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef(0);
  const isDragging = useRef(false);

  // Card dimensions
  const cardWidth = 280;
  const cardGap = 24;
  const cardTotalWidth = cardWidth + cardGap;

  // Calculate offset to center the current card
  const getOffset = useCallback(
    (index: number) => {
      return -index * cardTotalWidth;
    },
    [cardTotalWidth]
  );

  // Spring animation for smooth transitions
  const [springs, api] = useSpring(() => ({
    x: 0,
    config: { tension: 200, friction: 30 },
  }));

  // Update spring when currentIndex changes
  useEffect(() => {
    api.start({ x: getOffset(currentIndex) });
  }, [currentIndex, api, getOffset]);

  // Navigation
  const goTo = useCallback(
    (index: number) => {
      // Handle infinite loop
      let newIndex = index;
      if (newIndex < 0) {
        newIndex = games.length - 1;
      } else if (newIndex >= games.length) {
        newIndex = 0;
      }
      setCurrentIndex(newIndex);
    },
    [games.length]
  );

  const goNext = useCallback(() => {
    setIsAutoPlaying(false);
    goTo(currentIndex + 1);
  }, [currentIndex, goTo]);

  const goPrev = useCallback(() => {
    setIsAutoPlaying(false);
    goTo(currentIndex - 1);
  }, [currentIndex, goTo]);

  // Auto-play
  useEffect(() => {
    if (!isAutoPlaying || games.length === 0) return;
    const timer = setInterval(() => {
      goTo(currentIndex + 1);
    }, 4000);
    return () => clearInterval(timer);
  }, [isAutoPlaying, currentIndex, games.length, goTo]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goNext, goPrev]);

  // Drag/Touch handlers
  const handleDragStart = (clientX: number) => {
    isDragging.current = true;
    dragStartX.current = clientX;
    setIsAutoPlaying(false);
  };

  const handleDragEnd = (clientX: number) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const diff = clientX - dragStartX.current;
    const threshold = cardWidth / 4;
    if (diff > threshold) {
      goPrev();
    } else if (diff < -threshold) {
      goNext();
    }
  };

  if (games.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-8xl mb-6">🎮</div>
          <h3 className="text-2xl font-bold mb-2">ไม่พบเกม</h3>
          <p className="text-muted text-lg">
            ลองค้นหาด้วยคำอื่น หรือเลือกหมวดหมู่อื่น
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full flex flex-col justify-center select-none">
      {/* Carousel Track */}
      <div
        ref={containerRef}
        className="relative overflow-hidden py-8"
        onMouseDown={(e) => handleDragStart(e.clientX)}
        onMouseUp={(e) => handleDragEnd(e.clientX)}
        onMouseLeave={(e) => handleDragEnd(e.clientX)}
        onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
        onTouchEnd={(e) => handleDragEnd(e.changedTouches[0].clientX)}
      >
        {/* Gradient Edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-linear-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-linear-to-l from-background to-transparent z-10 pointer-events-none" />

        {/* Cards Container */}
        <animated.div
          className="flex items-center"
          style={{
            transform: springs.x.to(
              (x) => `translateX(calc(50vw - ${cardWidth / 2}px + ${x}px))`
            ),
            gap: `${cardGap}px`,
          }}
        >
          {games.map((game, index) => {
            const isActive = index === currentIndex;
            const distance = Math.abs(index - currentIndex);

            return (
              <CarouselCard
                key={game.slug}
                game={game}
                isActive={isActive}
                distance={distance}
                width={cardWidth}
                onClick={() => {
                  if (isActive) {
                    onGameSelect?.(game);
                  } else {
                    setIsAutoPlaying(false);
                    goTo(index);
                  }
                }}
              />
            );
          })}
        </animated.div>
      </div>

      {/* Navigation Buttons */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 sm:px-8 pointer-events-none z-20">
        <button
          onClick={goPrev}
          className="pointer-events-auto w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-surface/90 backdrop-blur border border-border shadow-lg flex items-center justify-center hover:bg-info hover:text-white hover:border-info transition-all duration-200"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={goNext}
          className="pointer-events-auto w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-surface/90 backdrop-blur border border-border shadow-lg flex items-center justify-center hover:bg-info hover:text-white hover:border-info transition-all duration-200"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Dots Indicator */}
      <div className="flex justify-center gap-2 mt-8">
        {games.slice(0, Math.min(games.length, 10)).map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              setIsAutoPlaying(false);
              goTo(idx);
            }}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              currentIndex === idx ? "bg-info w-8" : "bg-border hover:bg-muted"
            }`}
          />
        ))}
        {games.length > 10 && (
          <span className="text-xs text-muted self-center ml-1">
            +{games.length - 10}
          </span>
        )}
      </div>

      {/* Counter */}
      <div className="text-center mt-4 text-sm text-muted">
        {currentIndex + 1} / {games.length} เกม
      </div>
    </div>
  );
}

/**
 * Individual Carousel Card
 */
interface CarouselCardProps {
  game: GameMeta;
  isActive: boolean;
  distance: number;
  width: number;
  onClick: () => void;
}

function CarouselCard({
  game,
  isActive,
  distance,
  width,
  onClick,
}: CarouselCardProps) {
  const isAvailable = game.status === "available";

  // Calculate visual properties based on distance from center
  const scale = isActive ? 1.1 : Math.max(0.75, 1 - distance * 0.1);
  const opacity = isActive ? 1 : Math.max(0.5, 1 - distance * 0.15);

  const cardClassName = `block p-6 rounded-2xl border-2 bg-surface h-[340px] sm:h-[380px] cursor-pointer transition-all duration-300 ${
    isActive
      ? isAvailable
        ? "border-info shadow-2xl shadow-info/20"
        : "border-warning shadow-2xl"
      : "border-border/50"
  }`;

  const cardContent = (
    <>
      {/* Icon & Badge */}
      <div className="flex justify-between items-start mb-4">
        <span className="text-5xl sm:text-6xl">{game.icon}</span>
        {game.status === "coming_soon" && (
          <span className="px-2.5 py-1 text-xs rounded-full bg-warning/15 text-warning font-medium">
            เร็วๆ นี้
          </span>
        )}
        {game.status === "maintenance" && (
          <span className="px-2.5 py-1 text-xs rounded-full bg-error/15 text-error font-medium">
            ปิดปรับปรุง
          </span>
        )}
        {game.status === "available" && isActive && (
          <span className="px-2.5 py-1 text-xs rounded-full bg-success/15 text-success font-medium">
            พร้อมเล่น
          </span>
        )}
      </div>

      {/* Title */}
      <div className="space-y-1">
        <h3 className="text-lg sm:text-xl font-bold line-clamp-1">
          {game.nameTh || game.name}
        </h3>
        <p className="text-sm text-muted line-clamp-1">{game.name}</p>
      </div>

      {/* Meta */}
      <div className="mt-4 flex items-center gap-3 text-sm text-muted">
        <span>
          👥 {game.minPlayers}-{game.maxPlayers}
        </span>
        <span>⏱️ 5-15 นาที</span>
      </div>

      {/* Action Button (Active only) */}
      {isActive && (
        <div className="mt-6">
          {isAvailable ? (
            <div className="w-full py-3 rounded-xl bg-info text-white font-semibold text-center">
              เล่นเลย
            </div>
          ) : (
            <div className="w-full py-3 rounded-xl bg-muted/20 text-muted font-medium text-center">
              {game.status === "coming_soon" ? "กำลังพัฒนา" : "ปิดปรับปรุง"}
            </div>
          )}
        </div>
      )}
    </>
  );

  return (
    <div
      className="shrink-0 transition-all duration-300 ease-out"
      style={{
        width: `${width}px`,
        transform: `scale(${scale})`,
        opacity,
      }}
    >
      {isAvailable && isActive ? (
        <Link href={`/games/${game.slug}`} className={cardClassName}>
          {cardContent}
        </Link>
      ) : (
        <div onClick={onClick} className={cardClassName}>
          {cardContent}
        </div>
      )}
    </div>
  );
}
