"use client";

import { Bot, Clock, Monitor, RotateCcw, Smartphone } from "lucide-react";
import { ReactNode } from "react";

/**
 * Game Status Bar - Shows turn number, AI mode, current turn
 */
interface GameStatusProps {
  turnNumber?: number;
  isMyTurn: boolean;
  mySymbol?: string;
  opponentName?: string;
  isAIEnabled?: boolean;
  aiDifficulty?: string;
}

export function GameStatus({
  turnNumber,
  isMyTurn,
  mySymbol,
  opponentName,
  isAIEnabled,
  aiDifficulty,
}: GameStatusProps) {
  return (
    <div className="absolute top-14 left-1/2 -translate-x-1/2 z-10 w-full max-w-sm px-4">
      <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-surface/90 backdrop-blur-sm border border-border shadow-lg">
        {/* Turn Number */}
        {turnNumber !== undefined && (
          <div className="flex items-center gap-1 text-xs text-muted">
            <Clock className="w-3 h-3" />
            <span>ตา {turnNumber}</span>
          </div>
        )}

        {/* Separator */}
        {turnNumber !== undefined && <span className="text-border">•</span>}

        {/* AI Mode */}
        {isAIEnabled && (
          <>
            <div className="flex items-center gap-1 text-xs text-info">
              <Bot className="w-3 h-3" />
              <span>AI {aiDifficulty}</span>
            </div>
            <span className="text-border">•</span>
          </>
        )}

        {/* Current Turn */}
        <div
          className={`text-xs font-medium ${
            isMyTurn ? "text-success" : "text-foreground"
          }`}
        >
          {isMyTurn ? (
            <span>ตาคุณ!{mySymbol ? ` (${mySymbol})` : ""}</span>
          ) : (
            <span>รอ {opponentName ?? "คู่แข่ง"}...</span>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Turn Indicator Overlay
 */
interface TurnIndicatorProps {
  isMyTurn: boolean;
  mySymbol?: string;
  opponentName?: string;
  turnNumber?: number;
}

export function TurnIndicator({
  isMyTurn,
  mySymbol,
  opponentName,
  turnNumber,
}: TurnIndicatorProps) {
  return (
    <div className="absolute bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 pointer-events-none z-10">
      <div
        className={`flex items-center gap-2 px-3 md:px-6 py-1.5 md:py-3 rounded-full font-medium shadow-lg text-xs md:text-base ${
          isMyTurn
            ? "bg-success text-white"
            : "bg-surface border border-border text-foreground"
        }`}
      >
        {/* Turn Number */}
        {turnNumber !== undefined && (
          <span className={`${isMyTurn ? "text-white/80" : "text-muted"}`}>
            ตา {turnNumber}
          </span>
        )}

        {/* Separator */}
        {turnNumber !== undefined && (
          <span className={`${isMyTurn ? "text-white/50" : "text-border"}`}>
            •
          </span>
        )}

        {/* Turn Status */}
        {isMyTurn ? (
          <span>ตาคุณ!{mySymbol ? ` (${mySymbol})` : ""}</span>
        ) : (
          <span>รอ {opponentName ?? "คู่แข่ง"}...</span>
        )}
      </div>
    </div>
  );
}

/**
 * Player Symbol/Role Indicator
 */
interface PlayerIndicatorProps {
  label?: string;
  symbol: string;
  symbolColor?: "error" | "info" | "success" | "warning";
}

export function PlayerIndicator({
  label = "คุณเป็น:",
  symbol,
  symbolColor = "info",
}: PlayerIndicatorProps) {
  const colorClasses = {
    error: "text-error",
    info: "text-info",
    success: "text-success",
    warning: "text-warning",
  };

  return (
    <div className="absolute top-2 md:top-4 left-2 md:left-4 z-10">
      <div className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 md:py-2 rounded-lg bg-surface/90 backdrop-blur-sm border border-border">
        <span className="text-xs md:text-sm text-muted">{label}</span>
        <span
          className={`text-lg md:text-xl font-bold ${colorClasses[symbolColor]}`}
        >
          {symbol}
        </span>
      </div>
    </div>
  );
}

/**
 * Render Mode Toggle (2D/3D)
 */
interface RenderModeToggleProps {
  is2D: boolean;
  onToggle: () => void;
}

export function RenderModeToggle({ is2D, onToggle }: RenderModeToggleProps) {
  return (
    <div className="absolute top-2 md:top-4 right-2 md:right-4 z-10">
      <div className="flex items-center gap-1 bg-surface/90 backdrop-blur-sm border border-border rounded-lg p-1">
        <button
          onClick={onToggle}
          className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
            !is2D ? "bg-info text-white" : "hover:bg-muted"
          }`}
          title="สลับโหมด 3D/2D"
        >
          {is2D ? (
            <>
              <Smartphone className="w-3 h-3" />
              <span className="hidden sm:inline">2D</span>
            </>
          ) : (
            <>
              <Monitor className="w-3 h-3" />
              <span className="hidden sm:inline">3D</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

/**
 * Waiting for Host Overlay
 */
interface WaitingOverlayProps {
  onViewResult?: () => void;
}

export function WaitingOverlay({ onViewResult }: WaitingOverlayProps) {
  return (
    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-40 p-4">
      <div className="bg-surface border border-border rounded-2xl p-4 md:p-6 max-w-xs w-full text-center">
        <div className="flex justify-center mb-3">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-info/10 flex items-center justify-center">
            <RotateCcw className="w-5 h-5 md:w-6 md:h-6 text-info animate-spin" />
          </div>
        </div>
        <h3 className="font-semibold mb-1 text-sm md:text-base">รอ Host</h3>
        <p className="text-xs md:text-sm text-muted mb-4">
          รอ Host เริ่มเกมใหม่...
        </p>
        {onViewResult && (
          <button
            onClick={onViewResult}
            className="text-xs md:text-sm text-info hover:underline"
          >
            ดูผลลัพธ์อีกครั้ง
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Host Action Bar (after game ends)
 */
interface HostActionBarProps {
  onRestart: () => void;
  onViewResult: () => void;
}

export function HostActionBar({ onRestart, onViewResult }: HostActionBarProps) {
  return (
    <div className="absolute bottom-20 md:bottom-24 left-1/2 -translate-x-1/2 z-40 px-4 w-full max-w-md">
      <div className="flex items-center justify-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-xl bg-surface border border-border shadow-lg">
        <span className="text-xs md:text-sm text-muted whitespace-nowrap hidden sm:inline">
          เกมจบแล้ว
        </span>
        <button
          onClick={onRestart}
          className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 rounded-lg bg-info text-white text-sm md:text-base font-medium hover:bg-info-dark transition-colors whitespace-nowrap"
        >
          <RotateCcw className="w-4 h-4 shrink-0" />
          <span>เล่นใหม่</span>
        </button>
        <button
          onClick={onViewResult}
          className="px-3 md:px-4 py-2 rounded-lg border border-border text-sm md:text-base hover:bg-muted transition-colors whitespace-nowrap"
        >
          ดูผล
        </button>
      </div>
    </div>
  );
}

/**
 * Game Result Modal
 */
export interface GameResult {
  type: "win" | "lose" | "draw";
  title: string;
  subtitle: string;
}

export interface PlayerScore {
  id: string;
  nickname: string;
  avatar: string;
  score: number;
}

interface GameResultModalProps {
  result: GameResult;
  players: PlayerScore[];
  isHost: boolean;
  icon: ReactNode;
  onRestart?: () => void;
  onClose: () => void;
}

export function GameResultModal({
  result,
  players,
  isHost,
  icon,
  onRestart,
  onClose,
}: GameResultModalProps) {
  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-surface border border-border rounded-2xl p-4 md:p-8 max-w-sm w-full text-center animate-in zoom-in-95">
        {/* Icon */}
        <div className="flex justify-center mb-3 md:mb-4 scale-75 md:scale-100">
          {icon}
        </div>

        {/* Title & Subtitle */}
        <h2 className="text-xl md:text-2xl font-bold mb-1 md:mb-2">
          {result.title}
        </h2>
        <p className="text-sm md:text-base text-muted mb-4 md:mb-6">
          {result.subtitle}
        </p>

        {/* Scores */}
        <div className="flex justify-center gap-6 md:gap-8 mb-4 md:mb-6">
          {players.map((p) => (
            <div key={p.id} className="text-center">
              <span className="text-2xl md:text-3xl">{p.avatar}</span>
              <p className="text-xs md:text-sm font-medium mt-1 truncate max-w-[80px]">
                {p.nickname}
              </p>
              <p className="text-xl md:text-2xl font-bold text-info">
                {p.score}
              </p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2 md:gap-3">
          {isHost && onRestart && (
            <button
              onClick={onRestart}
              className="flex-1 flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-4 py-2.5 md:py-3 rounded-xl bg-info text-white text-sm md:text-base font-medium hover:bg-info-dark transition-colors"
            >
              <RotateCcw className="w-4 h-4 md:w-5 md:h-5 shrink-0" />
              <span>เล่นอีกครั้ง</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 px-3 md:px-4 py-2.5 md:py-3 rounded-xl border border-border text-sm md:text-base hover:bg-muted transition-colors"
          >
            ปิด
          </button>
        </div>

        {!isHost && (
          <p className="text-xs text-muted mt-3 md:mt-4">
            รอ Host เริ่มเกมใหม่...
          </p>
        )}
      </div>
    </div>
  );
}
