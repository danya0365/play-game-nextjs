"use client";

import type { RoomPlayer } from "@/src/domain/types/room";
import type { ConnectionQuality } from "@/src/presentation/stores/connectionStore";
import { Check, Crown, Wifi, WifiOff, X } from "lucide-react";

/**
 * Get text color for connection quality
 */
function getQualityTextColor(quality?: ConnectionQuality): string {
  switch (quality) {
    case "excellent":
      return "text-success";
    case "good":
      return "text-info";
    case "poor":
      return "text-warning";
    case "disconnected":
      return "text-error";
    default:
      return "text-success";
  }
}

interface PlayerCardProps {
  player: RoomPlayer;
  isCurrentUser?: boolean;
  canKick?: boolean;
  onKick?: () => void;
  /** Connection quality (if using ping-pong) */
  connectionQuality?: ConnectionQuality;
  /** Ping latency in ms */
  latency?: number;
}

/**
 * Player Card Component
 * Displays player info in lobby
 */
export function PlayerCard({
  player,
  isCurrentUser = false,
  canKick = false,
  onKick,
  connectionQuality,
  latency,
}: PlayerCardProps) {
  return (
    <div
      className={`relative flex items-center gap-3 p-3 rounded-xl border transition-all ${
        isCurrentUser
          ? "bg-info/5 border-info/30"
          : player.isConnected
          ? "bg-surface border-border"
          : "bg-surface/50 border-border/50 opacity-60"
      }`}
    >
      {/* Avatar */}
      <div className="relative">
        <span className="text-3xl">{player.avatar}</span>
        {/* Host Crown */}
        {player.isHost && (
          <Crown className="absolute -top-2 -right-1 w-4 h-4 text-warning fill-warning" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{player.nickname}</span>
          {isCurrentUser && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-info/10 text-info">
              คุณ
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted">
          {/* Connection Status */}
          {player.isConnected ? (
            <span
              className={`flex items-center gap-1 ${getQualityTextColor(
                connectionQuality
              )}`}
            >
              <Wifi className="w-3 h-3" />
              {latency !== undefined ? `${latency}ms` : "ออนไลน์"}
            </span>
          ) : (
            <span className="flex items-center gap-1 text-error">
              <WifiOff className="w-3 h-3" />
              ออฟไลน์
            </span>
          )}
        </div>
      </div>

      {/* Ready Status */}
      <div
        className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          player.isReady
            ? "bg-success/10 text-success"
            : "bg-muted-light dark:bg-muted-dark text-muted"
        }`}
      >
        {player.isReady ? (
          <Check className="w-5 h-5" />
        ) : (
          <span className="w-2 h-2 rounded-full bg-current" />
        )}
      </div>

      {/* Kick Button */}
      {canKick && !player.isHost && (
        <button
          onClick={onKick}
          className="shrink-0 p-1.5 rounded-lg text-muted hover:text-error hover:bg-error/10 transition-colors"
          title="เตะออก"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

/**
 * Empty Player Slot
 */
export function EmptyPlayerSlot({ index }: { index: number }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-border/50 bg-surface/30">
      <div className="w-10 h-10 rounded-full bg-muted-light dark:bg-muted-dark flex items-center justify-center">
        <span className="text-muted text-lg">?</span>
      </div>
      <div className="flex-1">
        <span className="text-muted text-sm">รอผู้เล่น #{index + 1}</span>
      </div>
    </div>
  );
}
