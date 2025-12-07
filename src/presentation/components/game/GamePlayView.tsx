"use client";

import { useRoomStore } from "@/src/presentation/stores/roomStore";
import { ConnectFourView } from "../games/connect-four/ConnectFourView";
import { RockPaperScissorsView } from "../games/rock-paper-scissors/RockPaperScissorsView";
import { TicTacToeView } from "../games/tictactoe/TicTacToeView";
import { GameLayout } from "./GameLayout";

/**
 * GamePlayView - Dynamically renders the correct game based on room.gameSlug
 */
export function GamePlayView() {
  const { room } = useRoomStore();

  // Loading state - no room yet
  if (!room) {
    return (
      <GameLayout gameName="เกม" onLeave={() => {}}>
        <div className="h-full flex items-center justify-center">
          <p className="text-muted">กำลังโหลด...</p>
        </div>
      </GameLayout>
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
