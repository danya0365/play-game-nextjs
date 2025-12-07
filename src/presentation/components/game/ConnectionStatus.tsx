"use client";

import {
  getQualityColor,
  getQualityLabel,
  useConnectionStatus,
} from "@/src/presentation/hooks/useConnectionStatus";
import { ConnectionQuality } from "@/src/presentation/stores/connectionStore";
import { useRoomStore } from "@/src/presentation/stores/roomStore";
import { useEffect, useState } from "react";

interface ConnectionStatusProps {
  /** Show detailed info */
  showDetails?: boolean;
  /** Position */
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  /** Size */
  size?: "sm" | "md" | "lg";
  /** Inline mode (no absolute positioning) */
  inline?: boolean;
}

/**
 * Connection status indicator component
 * Shows connection quality to host (for clients) or peer status (for host)
 */
export function ConnectionStatus({
  showDetails = false,
  position = "top-right",
  size = "md",
  inline = false,
}: ConnectionStatusProps) {
  const { isHost, isInRoom } = useRoomStore();
  const { isConnected, quality, latency, hasDisconnectedPeers } =
    useConnectionStatus();

  const [showTooltip, setShowTooltip] = useState(false);

  // Position classes
  const positionClasses = {
    "top-left": "top-2 left-2",
    "top-right": "top-2 right-2",
    "bottom-left": "bottom-2 left-2",
    "bottom-right": "bottom-2 right-2",
  };

  if (!isInRoom) return null;

  return (
    <div
      className={
        inline ? "relative" : `absolute ${positionClasses[position]} z-50`
      }
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="relative">
        {/* Status indicator */}
        <div
          className={`
            flex items-center gap-2 
            bg-surface/90 backdrop-blur-sm 
            rounded-full px-3 py-1.5
            border border-border
            cursor-pointer
            transition-all duration-200
            hover:bg-surface
          `}
        >
          <SignalIcon quality={quality} size={size} />

          {showDetails && (
            <span className={`text-xs ${getQualityColor(quality)}`}>
              {isConnected ? `${latency}ms` : "ขาดการเชื่อมต่อ"}
            </span>
          )}

          {/* Warning for host if peers disconnected */}
          {isHost && hasDisconnectedPeers && (
            <span className="text-warning text-xs">⚠️</span>
          )}
        </div>

        {/* Tooltip */}
        {showTooltip && (
          <div
            className={`
              absolute top-full mt-2 right-0
              bg-surface border border-border rounded-lg
              shadow-lg p-3 min-w-48
              z-50
            `}
          >
            <ConnectionTooltipContent
              isHost={isHost}
              isConnected={isConnected}
              quality={quality}
              latency={latency}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Signal icon based on quality
 */
function SignalIcon({
  quality,
  size,
}: {
  quality: ConnectionQuality;
  size: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const colorClass = getQualityColor(quality);

  return (
    <div className={`${sizeClasses[size]} relative`}>
      {quality === "disconnected" ? (
        <DisconnectedIcon className={colorClass} />
      ) : (
        <SignalBars quality={quality} className={colorClass} />
      )}
    </div>
  );
}

/**
 * Signal bars icon
 */
function SignalBars({
  quality,
  className,
}: {
  quality: ConnectionQuality;
  className?: string;
}) {
  const bars =
    quality === "excellent"
      ? 4
      : quality === "good"
      ? 3
      : quality === "poor"
      ? 2
      : 1;

  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      className={`w-full h-full ${className}`}
    >
      {/* Bar 1 - shortest */}
      <rect
        x="1"
        y="14"
        width="3"
        height="5"
        rx="0.5"
        opacity={bars >= 1 ? 1 : 0.3}
      />
      {/* Bar 2 */}
      <rect
        x="6"
        y="10"
        width="3"
        height="9"
        rx="0.5"
        opacity={bars >= 2 ? 1 : 0.3}
      />
      {/* Bar 3 */}
      <rect
        x="11"
        y="6"
        width="3"
        height="13"
        rx="0.5"
        opacity={bars >= 3 ? 1 : 0.3}
      />
      {/* Bar 4 - tallest */}
      <rect
        x="16"
        y="1"
        width="3"
        height="18"
        rx="0.5"
        opacity={bars >= 4 ? 1 : 0.3}
      />
    </svg>
  );
}

/**
 * Disconnected icon
 */
function DisconnectedIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`w-full h-full ${className}`}
    >
      <line x1="1" y1="1" x2="23" y2="23" />
      <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
      <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
      <path d="M10.71 5.05A16 16 0 0 1 22.58 9" />
      <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
      <line x1="12" y1="20" x2="12.01" y2="20" />
    </svg>
  );
}

/**
 * Tooltip content
 */
function ConnectionTooltipContent({
  isHost,
  isConnected,
  quality,
  latency,
}: {
  isHost: boolean;
  isConnected: boolean;
  quality: ConnectionQuality;
  latency: number;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <SignalIcon quality={quality} size="md" />
        <span className="font-medium text-foreground">
          {isHost ? "เซิร์ฟเวอร์" : "เชื่อมต่อกับ Host"}
        </span>
      </div>

      <div className="text-sm space-y-1">
        <div className="flex justify-between">
          <span className="text-muted">สถานะ:</span>
          <span className={getQualityColor(quality)}>
            {getQualityLabel(quality)}
          </span>
        </div>

        {isConnected && (
          <div className="flex justify-between">
            <span className="text-muted">Ping:</span>
            <span className="text-foreground">{latency}ms</span>
          </div>
        )}

        {!isConnected && (
          <p className="text-error text-xs mt-2">กำลังพยายามเชื่อมต่อใหม่...</p>
        )}
      </div>
    </div>
  );
}

/**
 * Reconnecting overlay
 * Shows when connection to host is lost
 */
export function ReconnectingOverlay() {
  const { isHost, isInRoom } = useRoomStore();
  const { isConnected, quality } = useConnectionStatus();
  const [showOverlay, setShowOverlay] = useState(false);
  const [countdown, setCountdown] = useState(10);

  // Show overlay when disconnected (only for clients)
  useEffect(() => {
    if (!isInRoom || isHost) {
      setShowOverlay(false);
      return;
    }

    if (!isConnected || quality === "disconnected") {
      setShowOverlay(true);
      setCountdown(10);
    } else {
      setShowOverlay(false);
    }
  }, [isConnected, quality, isInRoom, isHost]);

  // Countdown timer
  useEffect(() => {
    if (!showOverlay) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Auto leave room after countdown
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showOverlay]);

  // Handle leave when countdown reaches 0
  useEffect(() => {
    if (countdown === 0) {
      const { leaveRoom } = useRoomStore.getState();
      leaveRoom();
    }
  }, [countdown]);

  if (!showOverlay) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-100 flex items-center justify-center">
      <div className="bg-surface border border-border rounded-2xl p-8 text-center max-w-md mx-4">
        <div className="text-6xl mb-4">📡</div>

        <h2 className="text-xl font-bold text-foreground mb-2">
          ขาดการเชื่อมต่อกับ Host
        </h2>

        <p className="text-muted mb-4">กำลังพยายามเชื่อมต่อใหม่...</p>

        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-2 h-2 bg-warning rounded-full animate-pulse" />
          <div
            className="w-2 h-2 bg-warning rounded-full animate-pulse"
            style={{ animationDelay: "0.2s" }}
          />
          <div
            className="w-2 h-2 bg-warning rounded-full animate-pulse"
            style={{ animationDelay: "0.4s" }}
          />
        </div>

        <p className="text-sm text-muted">
          ออกจากห้องอัตโนมัติใน{" "}
          <span className="text-error font-bold">{countdown}</span> วินาที
        </p>

        <button
          onClick={() => useRoomStore.getState().leaveRoom()}
          className="mt-4 px-6 py-2 bg-error/20 text-error rounded-lg hover:bg-error/30 transition-colors"
        >
          ออกจากห้องเลย
        </button>
      </div>
    </div>
  );
}
