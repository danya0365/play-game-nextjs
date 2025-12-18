"use client";

import { GameLayout } from "@/src/presentation/components/game/GameLayout";
import { GameViewBase } from "@/src/presentation/components/game/GameViewBase";
import { useKaengGame } from "@/src/presentation/hooks/useKaengGame";
import { Kaeng2D } from "./Kaeng2D";
import { Kaeng3D } from "./Kaeng3D";

/**
 * Kaeng Game View
 * Uses GameViewBase for common UI, only provides game-specific rendering
 */
export function KaengView() {
  // Game logic hook
  const game = useKaengGame();

  const {
    room,
    gameState,
    isHost,
    isPlaying,
    isFinished,
    isMyTurn,
    user,
    currentTurnPlayer,
    showResult,
    playerScores,
    playerHands,
    phase,
    canTakeAction,
    canBankerReveal,
    myHand,
    isBanker,
    bankerId,
    currentTurn,
    gamePlayers,
    gameLog,
    allCardsRevealed,
    handleReveal,
    handleFold,
    handleBankerReveal,
    handleRestart,
    handleLeave,
    handleCloseResult,
    handleShowResult,
    getResultInfo,
  } = game;

  // Loading state
  if (!room || !gameState) {
    return (
      <GameLayout gameName="ไพ่แคง" onLeave={handleLeave}>
        <div className="h-full flex items-center justify-center">
          <p className="text-muted">กำลังโหลดเกม...</p>
        </div>
      </GameLayout>
    );
  }

  // My role text
  const myRole = isBanker ? "เจ้ามือ" : "ผู้เล่น";

  return (
    <GameViewBase
      // Game info
      gameName="ไพ่แคง"
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
      mySymbol={myRole}
      symbolColor={isBanker ? "warning" : "info"}
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
      cameraFov={50}
      mobileCameraFov={60}
      backgroundColor="#581c87"
      // Render 2D board
      render2D={
        <Kaeng2D
          playerHands={playerHands}
          myPlayerId={user?.id ?? ""}
          myHand={myHand}
          isBanker={isBanker}
          phase={phase}
          canTakeAction={canTakeAction ?? false}
          canBankerReveal={canBankerReveal ?? false}
          currentTurn={currentTurn}
          bankerId={bankerId}
          players={gamePlayers}
          gameLog={gameLog}
          allCardsRevealed={allCardsRevealed}
          onReveal={handleReveal}
          onFold={handleFold}
          onBankerReveal={handleBankerReveal}
        />
      }
      // Render 3D board
      render3D={
        <Kaeng3D
          playerHands={playerHands}
          myPlayerId={user?.id ?? ""}
          phase={phase}
          canTakeAction={canTakeAction ?? false}
          allCardsRevealed={allCardsRevealed}
          onReveal={handleReveal}
          onFold={handleFold}
        />
      }
    />
  );
}
