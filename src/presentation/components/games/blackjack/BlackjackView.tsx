"use client";

import { GameLayout } from "@/src/presentation/components/game/GameLayout";
import { GameViewBase } from "@/src/presentation/components/game/GameViewBase";
import { useBlackjackGame } from "@/src/presentation/hooks/useBlackjackGame";
import { Blackjack2D } from "./Blackjack2D";
import { Blackjack3D } from "./Blackjack3D";

/**
 * Blackjack Game View
 * Uses GameViewBase for common UI, only provides game-specific rendering
 */
export function BlackjackView() {
  // Game logic hook
  const game = useBlackjackGame();

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
    myHand,
    myHandValue,
    hasBlackjack,
    dealerId,
    currentTurn,
    gamePlayers,
    gameLog,
    handleHit,
    handleStand,
    handleRestart,
    handleLeave,
    handleCloseResult,
    handleShowResult,
    getResultInfo,
  } = game;

  // Loading state
  if (!room || !gameState) {
    return (
      <GameLayout gameName="แบล็คแจ็ค" onLeave={handleLeave}>
        <div className="h-full flex items-center justify-center">
          <p className="text-muted">กำลังโหลดเกม...</p>
        </div>
      </GameLayout>
    );
  }

  // Determine player role text
  const myRole = hasBlackjack
    ? "BLACKJACK!"
    : myHand
      ? `${myHandValue} แต้ม`
      : "ผู้เล่น";

  return (
    <GameViewBase
      // Game info
      gameName="แบล็คแจ็ค"
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
      symbolColor={hasBlackjack ? "success" : "info"}
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
        <Blackjack2D
          dealerHand={dealerHand}
          dealerRevealed={dealerRevealed}
          playerHands={playerHands}
          myPlayerId={user?.id ?? ""}
          myHand={myHand}
          phase={phase}
          canTakeAction={canTakeAction ?? false}
          currentTurn={currentTurn}
          dealerId={dealerId}
          players={gamePlayers}
          gameLog={gameLog}
          onHit={handleHit}
          onStand={handleStand}
        />
      }
      // Render 3D board
      render3D={
        <Blackjack3D
          dealerHand={dealerHand}
          dealerRevealed={dealerRevealed}
          playerHands={playerHands}
          myPlayerId={user?.id ?? ""}
          myHand={myHand}
          phase={phase}
          canTakeAction={canTakeAction ?? false}
          currentTurn={currentTurn}
          dealerId={dealerId}
          players={gamePlayers}
          onHit={handleHit}
          onStand={handleStand}
        />
      }
    />
  );
}
