"use client";

import { useRoomStore } from "@/src/presentation/stores/roomStore";
import { AlertTriangle, Home, Loader2, RefreshCw, Wifi } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { CoinFlipView } from "../games/coin-flip/CoinFlipView";
import { ConnectFourView } from "../games/connect-four/ConnectFourView";
import { DiceRollView } from "../games/dice-roll/DiceRollView";
import { GomokuView } from "../games/gomoku/GomokuView";
import { RockPaperScissorsView } from "../games/rock-paper-scissors/RockPaperScissorsView";
import { TicTacToeView } from "../games/tictactoe/TicTacToeView";
import { GameLayout } from "./GameLayout";

type ConnectionStatus = "checking" | "reconnecting" | "connected" | "failed";

/**
 * GamePlayView - Dynamically renders the correct game based on room.gameSlug
 */
export function GamePlayView() {
  const { room, isConnected, reconnect, clearPersistedRoom } = useRoomStore();
  const router = useRouter();
  const [status, setStatus] = useState<ConnectionStatus>("checking");

  // Handle reconnection on mount
  const attemptReconnect = useCallback(async () => {
    // If room exists in state but not connected, try to reconnect
    if (room && !isConnected) {
      setStatus("reconnecting");
      console.log("[GamePlayView] Attempting reconnect...");

      const success = await reconnect();
      if (success) {
        setStatus("connected");
      } else {
        setStatus("failed");
      }
    } else if (room && isConnected) {
      setStatus("connected");
    } else {
      // No room in persisted state
      setStatus("failed");
    }
  }, [room, isConnected, reconnect]);

  useEffect(() => {
    // Give a brief moment for hydration
    const timer = setTimeout(() => {
      attemptReconnect();
    }, 300);

    return () => clearTimeout(timer);
  }, [attemptReconnect]);

  // Handle go back to home
  const handleGoHome = useCallback(() => {
    clearPersistedRoom();
    router.push("/");
  }, [clearPersistedRoom, router]);

  // Handle retry
  const handleRetry = useCallback(() => {
    setStatus("reconnecting");
    attemptReconnect();
  }, [attemptReconnect]);

  // Show loading during check/reconnect
  if (status === "checking" || status === "reconnecting") {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-background">
        <div className="text-center">
          {status === "reconnecting" ? (
            <>
              <Wifi className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
              <p className="text-foreground font-medium mb-2">
                กำลังเชื่อมต่อใหม่...
              </p>
              <p className="text-muted text-sm">กรุณารอสักครู่</p>
            </>
          ) : (
            <>
              <Loader2 className="w-8 h-8 text-primary mx-auto mb-4 animate-spin" />
              <p className="text-muted">กำลังโหลด...</p>
            </>
          )}
        </div>
      </div>
    );
  }

  // Room expired or reconnect failed
  if (status === "failed" || !room) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-background p-4">
        <div className="max-w-md w-full text-center">
          {/* Icon */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-warning/10 flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-warning" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-foreground mb-2">
            ไม่สามารถเชื่อมต่อได้
          </h1>

          {/* Description */}
          <p className="text-muted mb-8">
            ห้องเกมนี้อาจหมดอายุหรือ Host ออกไปแล้ว
            <br />
            กรุณาลองใหม่หรือสร้างห้องใหม่
          </p>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleRetry}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-content rounded-xl font-medium hover:bg-primary/90 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              ลองเชื่อมต่อใหม่
            </button>
            <button
              onClick={handleGoHome}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-surface text-foreground border border-border rounded-xl font-medium hover:bg-surface/80 transition-colors"
            >
              <Home className="w-5 h-5" />
              กลับหน้าหลัก
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render the appropriate game based on gameSlug
  switch (room.gameSlug) {
    case "tic-tac-toe":
      return <TicTacToeView />;

    case "connect-four":
      return <ConnectFourView />;

    case "rock-paper-scissors":
      return <RockPaperScissorsView />;

    case "coin-flip":
      return <CoinFlipView />;

    case "dice-roll":
      return <DiceRollView />;

    case "gomoku":
      return <GomokuView />;

    default:
      return (
        <GameLayout gameName={room.gameName} onLeave={() => {}}>
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <p className="text-muted mb-2">เกมนี้ยังไม่พร้อมใช้งาน</p>
              <p className="text-sm text-muted">Game: {room.gameSlug}</p>
            </div>
          </div>
        </GameLayout>
      );
  }
}
