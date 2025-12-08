"use client";

import { GameLayout } from "@/src/presentation/components/game/GameLayout";
import { GameViewBase } from "@/src/presentation/components/game/GameViewBase";
import { useGomokuGame } from "@/src/presentation/hooks/useGomokuGame";
import { Gomoku2D } from "./Gomoku2D";
import { Gomoku3D } from "./Gomoku3D";

/**
 * Gomoku Game View
 * Uses GameViewBase for common UI, only provides game-specific rendering
 */
export function GomokuView() {
  const game = useGomokuGame();

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
    handleCellClick,
    handleRestart,
    handleLeave,
    handleCloseResult,
    handleShowResult,
    getResultInfo,
  } = game;

  // Loading state
  if (!room || !gameState) {
    return (
      <GameLayout gameName="โกะโมะกุ" onLeave={handleLeave}>
        <div className="h-full flex items-center justify-center">
          <p className="text-muted">กำลังโหลดเกม...</p>
        </div>
      </GameLayout>
    );
  }

  return (
    <GameViewBase
      // Game info
      gameName="โกะโมะกุ"
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
      mySymbol={myColor === "black" ? "⚫" : "⚪"}
      symbolColor={myColor === "black" ? "error" : "info"}
      // Result
      result={getResultInfo()}
      // Actions
      onRestart={handleRestart}
      onLeave={handleLeave}
      onCloseResult={handleCloseResult}
      onShowResult={handleShowResult}
      // Camera settings
      cameraPosition={[0, 10, 6]}
      mobileCameraPosition={[0, 12, 8]}
      cameraFov={50}
      mobileCameraFov={60}
      backgroundColor="#2d1f0f"
      // Render 2D
      render2D={
        <Gomoku2D
          board={board}
          winningCells={winningCells}
          lastMove={lastMove}
          isMyTurn={isMyTurn && isPlaying}
          myColor={myColor}
          onCellClick={handleCellClick}
        />
      }
      // Render 3D
      render3D={
        <Gomoku3D
          board={board}
          winningCells={winningCells}
          lastMove={lastMove}
          isMyTurn={isMyTurn && isPlaying}
          myColor={myColor}
          onCellClick={handleCellClick}
        />
      }
    />
  );
}
