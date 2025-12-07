"use client";

import { ConnectionStatus } from "@/src/presentation/components/game/ConnectionStatus";
import { SoundSettings } from "@/src/presentation/components/ui/SoundSettings";
import { ThemeToggle } from "@/src/presentation/components/ui/ThemeToggle";
import { ArrowLeft, RotateCcw, Users } from "lucide-react";
// Note: Turn info (currentTurn, isMyTurn, turnNumber) removed from header - shown via TurnIndicator in game view
import { ReactNode } from "react";

interface GameLayoutProps {
  children: ReactNode;
  gameName: string;
  roomCode?: string;
  players?: Array<{
    id: string;
    nickname: string;
    avatar: string;
    score: number;
    isActive: boolean;
  }>;
  onLeave?: () => void;
  onRestart?: () => void;
  showRestart?: boolean;
}

/**
 * Game Layout - Full screen layout for active games
 */
export function GameLayout({
  children,
  gameName,
  roomCode,
  players = [],
  onLeave,
  onRestart,
  showRestart = false,
}: GameLayoutProps) {
  return (
    <div className="fixed inset-0 flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <header className="shrink-0 h-12 border-b border-border bg-surface/80 backdrop-blur flex items-center justify-between px-3 gap-2">
        {/* Left */}
        <div className="flex items-center gap-3">
          <button
            onClick={onLeave}
            className="flex items-center gap-1.5 text-muted hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline text-sm">ออก</span>
          </button>

          <div className="h-4 w-px bg-border" />

          <div>
            <span className="font-medium text-sm">{gameName}</span>
            {roomCode && (
              <span className="ml-2 text-xs text-muted">#{roomCode}</span>
            )}
          </div>
        </div>

        {/* Turn Info moved to game view (TurnIndicator component) */}

        {/* Right */}
        <div className="flex items-center gap-1.5 md:gap-2">
          {showRestart && onRestart && (
            <button
              onClick={onRestart}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              title="เล่นใหม่"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
          <ConnectionStatus inline size="sm" />
          <SoundSettings />
          <ThemeToggle />
        </div>
      </header>

      {/* Main Game Area */}
      <main className="flex-1 flex overflow-hidden">
        {/* Game Canvas Area */}
        <div className="flex-1 relative">{children}</div>

        {/* Players Sidebar (desktop) */}
        {players.length > 0 && (
          <aside className="hidden lg:block w-48 border-l border-border bg-surface/50 p-3">
            <div className="flex items-center gap-2 mb-3 text-sm font-medium text-muted">
              <Users className="w-4 h-4" />
              <span>ผู้เล่น</span>
            </div>

            <div className="space-y-2">
              {players.map((player) => (
                <div
                  key={player.id}
                  className={`flex items-center gap-2 p-2 rounded-lg ${
                    player.isActive
                      ? "bg-info/10 border border-info/30"
                      : "bg-background"
                  }`}
                >
                  <span className="text-xl">{player.avatar}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {player.nickname}
                    </p>
                    <p className="text-xs text-muted">คะแนน: {player.score}</p>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        )}
      </main>

      {/* Mobile Players Bar */}
      {players.length > 0 && (
        <div className="lg:hidden shrink-0 h-14 border-t border-border bg-surface flex items-center justify-center gap-4 px-4">
          {players.map((player) => (
            <div
              key={player.id}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
                player.isActive
                  ? "bg-info/10 border border-info/30"
                  : "bg-background/50"
              }`}
            >
              <span className="text-lg">{player.avatar}</span>
              <div className="flex flex-col">
                <span className="text-xs font-medium truncate max-w-[80px]">
                  {player.nickname}
                </span>
                <span className="text-[10px] text-muted">
                  {player.score} คะแนน
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
