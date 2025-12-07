"use client";

import { GameLayout } from "@/src/presentation/components/game/GameLayout";
import { GameViewBase } from "@/src/presentation/components/game/GameViewBase";
import { useConnectFourGame } from "@/src/presentation/hooks/useConnectFourGame";
import { ConnectFour2D } from "./ConnectFour2D";
import { ConnectFour3D } from "./ConnectFour3D";

/**
 * Connect Four Game View
 * Uses GameViewBase for common UI, only provides game-specific rendering
 */
export function ConnectFourView() {
  // Game logic hook
  const game = useConnectFourGame();

  const {
    room,
    gameState,
    isHost,
    isPlaying,
    isFinished,
    isMyTurn,
    myColor,
    currentTurnPlayer,
    showResult,
    playerScores,
    board,
    winningCells,
    lastMove,
    handleColumnClick,
    handleRestart,
    handleLeave,
    handleCloseResult,
    handleShowResult,
    getResultInfo,
  } = game;

  // Loading state
  if (!room || !gameState) {
    return (
      <GameLayout gameName="เรียง 4" onLeave={handleLeave}>
        <div className="h-full flex items-center justify-center">
          <p className="text-muted">กำลังโหลดเกม...</p>
        </div>
      </GameLayout>
    );
  }

  return (
    <GameViewBase
      // Game info
      gameName="เรียง 4"
      roomCode={room.code}
      // Players
      players={playerScores}
      currentTurnPlayer={currentTurnPlayer}
      isHost={isHost}
      // Game state
      isMyTurn={isMyTurn}
      isPlaying={isPlaying}
      isFinished={isFinished}
      showResult={showResult}
      turnNumber={gameState.turnNumber}
      // Player symbol/role
      mySymbol={myColor === "red" ? "🔴" : "🟡"}
      symbolColor={myColor === "red" ? "error" : "warning"}
      // Result
      result={getResultInfo()}
      // Actions
      onRestart={handleRestart}
      onLeave={handleLeave}
      onCloseResult={handleCloseResult}
      onShowResult={handleShowResult}
      // Camera settings - zoomed out for mobile
      cameraPosition={[0, 2, 10]}
      mobileCameraPosition={[0, 0.5, 7]}
      cameraFov={45}
      mobileCameraFov={55}
      backgroundColor="#0f172a"
      // Render 2D board
      render2D={
        <ConnectFour2D
          board={board}
          winningCells={winningCells}
          lastMove={lastMove}
          isMyTurn={isMyTurn && isPlaying}
          onColumnClick={handleColumnClick}
        />
      }
      // Render 3D board
      render3D={
        <ConnectFour3D
          board={board}
          winningCells={winningCells}
          lastMove={lastMove}
          isMyTurn={isMyTurn && isPlaying}
          onColumnClick={handleColumnClick}
        />
      }
    />
  );
}
