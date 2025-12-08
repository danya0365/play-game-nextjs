"use client";

import { useRoomStore } from "@/src/presentation/stores/roomStore";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CoinFlipView } from "../games/coin-flip/CoinFlipView";
import { ConnectFourView } from "../games/connect-four/ConnectFourView";
import { DiceRollView } from "../games/dice-roll/DiceRollView";
import { RockPaperScissorsView } from "../games/rock-paper-scissors/RockPaperScissorsView";
import { TicTacToeView } from "../games/tictactoe/TicTacToeView";
import { GameLayout } from "./GameLayout";

/**
 * GamePlayView - Dynamically renders the correct game based on room.gameSlug
 */
export function GamePlayView() {
  const { room } = useRoomStore();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  // Check if room exists after initial mount
  useEffect(() => {
    // Give a brief moment for hydration
    const timer = setTimeout(() => {
      setIsChecking(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Handle go back to home
  const handleGoHome = () => {
    router.push("/");
  };

  // Show loading during initial check
  if (isChecking) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-4" />
        <p className="text-muted">กำลังโหลด...</p>
      </div>
    );
  }

  // Room expired or doesn't exist - show friendly error with action buttons
  if (!room) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-background p-4">
        <div className="max-w-md w-full text-center">
          {/* Icon */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-warning/10 flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-warning" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-foreground mb-2">
            ห้องเกมหมดอายุ
          </h1>

          {/* Description */}
          <p className="text-muted mb-8">
            ห้องเกมนี้หมดอายุหรือถูกปิดไปแล้ว
            <br />
            กรุณาสร้างห้องใหม่หรือเข้าร่วมห้องอื่น
          </p>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleGoHome}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-content rounded-xl font-medium hover:bg-primary/90 transition-colors"
            >
              <Home className="w-5 h-5" />
              กลับหน้าหลัก
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-surface text-foreground border border-border rounded-xl font-medium hover:bg-surface/80 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              ลองใหม่
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
