"use client";

import { GameLayout } from "@/src/presentation/components/game/GameLayout";
import { GameViewBase } from "@/src/presentation/components/game/GameViewBase";
import { useTicTacToeGame } from "@/src/presentation/hooks/useTicTacToeGame";
import { TicTacToe2D } from "./TicTacToe2D";
import { TicTacToe3D } from "./TicTacToe3D";

/**
 * Tic Tac Toe Game View
 * Uses GameViewBase for common UI, only provides game-specific rendering
 */
export function TicTacToeView() {
  // Game logic hook
  const game = useTicTacToeGame();

  const {
    room,
    gameState,
    isHost,
    isPlaying,
    isFinished,
    isMyTurn,
    myMark,
    currentTurnPlayer,
    showResult,
    playerScores,
    board,
    winningLine,
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
      <GameLayout gameName="โอเอ็กซ์" onLeave={handleLeave}>
        <div className="h-full flex items-center justify-center">
          <p className="text-muted">กำลังโหลดเกม...</p>
        </div>
      </GameLayout>
    );
  }

  return (
    <GameViewBase
      // Game info
      gameName="โอเอ็กซ์"
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
      // Player symbol
      mySymbol={myMark}
      symbolColor={myMark === "X" ? "error" : "info"}
      // Result
      result={getResultInfo()}
      // Actions
      onRestart={handleRestart}
      onLeave={handleLeave}
      onCloseResult={handleCloseResult}
      onShowResult={handleShowResult}
      // Camera settings
      cameraPosition={[0, 8, 8]}
      mobileCameraPosition={[0, 12, 10]}
      cameraFov={45}
      mobileCameraFov={55}
      backgroundColor="#0f0f1a"
      // Render 2D board
      render2D={
        <TicTacToe2D
          board={board}
          winningLine={winningLine}
          isMyTurn={isMyTurn && isPlaying}
          onCellClick={handleCellClick}
        />
      }
      // Render 3D board
      render3D={
        <TicTacToe3D
          board={gameState.board}
          winningLine={gameState.winningLine}
          isMyTurn={isMyTurn && isPlaying}
          onCellClick={handleCellClick}
        />
      }
    />
  );
}
