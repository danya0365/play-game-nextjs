"use client";

import { GameLayout } from "@/src/presentation/components/game/GameLayout";
import { GameViewBase } from "@/src/presentation/components/game/GameViewBase";
import { usePokDengGame } from "@/src/presentation/hooks/usePokDengGame";
import { PokDeng2D } from "./PokDeng2D";
import { PokDeng3D } from "./PokDeng3D";

/**
 * Pok Deng (ป๊อกเด้ง) Game View
 * Uses GameViewBase for common UI, only provides game-specific rendering
 */
export function PokDengView() {
  // Game logic hook
  const game = usePokDengGame();

  const {
    room,
    gameState,
    user,
    isHost,
    isPlaying,
    isFinished,
    isMyTurn,
    currentTurnPlayer,
    showResult,
    playerScores,
    dealerHand,
    dealerRevealed,
    playerHands,
    phase,
    canTakeAction,
    myHandEval,
    myHand,
    isDealer,
    dealerId,
    currentTurn,
    gamePlayers,
    gameLog,
    allCardsRevealed,
    handleDraw,
    handleStand,
    handleReveal,
    canReveal,
    handleRestart,
    handleLeave,
    handleCloseResult,
    handleShowResult,
    getResultInfo,
  } = game;

  // Loading state
  if (!room || !gameState) {
    return (
      <GameLayout gameName="ป๊อกเด้ง" onLeave={handleLeave}>
        <div className="h-full flex items-center justify-center">
          <p className="text-muted">กำลังโหลดเกม...</p>
        </div>
      </GameLayout>
    );
  }

  // Determine player role text
  const myRole = myHandEval?.isPok
    ? "ป๊อก!"
    : myHandEval
    ? `${myHandEval.points} แต้ม`
    : "ผู้เล่น";

  return (
    <GameViewBase
      // Game info
      gameName="ป๊อกเด้ง"
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
      mySymbol={myRole}
      symbolColor={myHandEval?.isPok ? "success" : "info"}
      // Result
      result={getResultInfo()}
      // Actions
      onRestart={handleRestart}
      onLeave={handleLeave}
      onCloseResult={handleCloseResult}
      onShowResult={handleShowResult}
      // Camera settings for card game view
      cameraPosition={[0, 10, 8]}
      mobileCameraPosition={[0, 12, 10]}
      cameraFov={50}
      mobileCameraFov={60}
      backgroundColor="#1a472a"
      // Render 2D board
      render2D={
        <PokDeng2D
          dealerHand={dealerHand}
          dealerRevealed={dealerRevealed}
          playerHands={playerHands}
          myPlayerId={user?.id ?? ""}
          myHand={myHand}
          isDealer={isDealer}
          phase={phase}
          canTakeAction={canTakeAction ?? false}
          canReveal={canReveal ?? false}
          currentTurn={currentTurn}
          dealerId={dealerId}
          players={gamePlayers}
          gameLog={gameLog}
          allCardsRevealed={allCardsRevealed}
          onDraw={handleDraw}
          onStand={handleStand}
          onReveal={handleReveal}
        />
      }
      // Render 3D board
      render3D={
        <PokDeng3D
          dealerHand={dealerHand}
          dealerRevealed={dealerRevealed}
          playerHands={playerHands}
          myPlayerId={user?.id ?? ""}
          phase={phase}
          canTakeAction={canTakeAction ?? false}
          onDraw={handleDraw}
          onStand={handleStand}
        />
      }
    />
  );
}
