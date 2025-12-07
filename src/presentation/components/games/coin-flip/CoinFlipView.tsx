"use client";

import { GameLayout } from "@/src/presentation/components/game/GameLayout";
import { GameViewBase } from "@/src/presentation/components/game/GameViewBase";
import { useCoinFlipGame } from "@/src/presentation/hooks/useCoinFlipGame";
import { CoinFlip2D } from "./CoinFlip2D";
import { CoinFlip3D } from "./CoinFlip3D";

/**
 * Coin Flip Game View
 */
export function CoinFlipView() {
  const game = useCoinFlipGame();

  const {
    room,
    gameState,
    isHost,
    isPlaying,
    isFinished,
    isMyTurn,
    myRole,
    currentTurnPlayer,
    showResult,
    playerScores,
    phase,
    hasGuessed,
    myCurrentGuess,
    opponentHasGuessed,
    currentRound,
    maxRounds,
    player1Score,
    player2Score,
    currentFlipResult,
    rounds,
    handleGuess,
    handleRestart,
    handleLeave,
    handleCloseResult,
    handleShowResult,
    getResultInfo,
  } = game;

  if (!room || !gameState) {
    return (
      <GameLayout gameName="โยนเหรียญ" onLeave={handleLeave}>
        <div className="h-full flex items-center justify-center">
          <p className="text-muted">กำลังโหลดเกม...</p>
        </div>
      </GameLayout>
    );
  }

  return (
    <GameViewBase
      gameName="โยนเหรียญ"
      roomCode={room.code}
      players={playerScores}
      currentTurnPlayer={currentTurnPlayer}
      isHost={isHost}
      isMyTurn={isMyTurn}
      isPlaying={isPlaying}
      isFinished={isFinished}
      showResult={showResult}
      turnNumber={gameState.turnNumber}
      mySymbol={myRole === "player1" ? "🔵" : "🔴"}
      symbolColor={myRole === "player1" ? "info" : "error"}
      result={getResultInfo()}
      onRestart={handleRestart}
      onLeave={handleLeave}
      onCloseResult={handleCloseResult}
      onShowResult={handleShowResult}
      cameraPosition={[0, 3, 8]}
      mobileCameraPosition={[0, 4, 10]}
      cameraFov={50}
      mobileCameraFov={55}
      backgroundColor="#1a1a2e"
      render2D={
        <CoinFlip2D
          phase={phase}
          hasGuessed={hasGuessed}
          myCurrentGuess={myCurrentGuess ?? null}
          opponentHasGuessed={opponentHasGuessed}
          currentRound={currentRound}
          maxRounds={maxRounds}
          player1Score={player1Score}
          player2Score={player2Score}
          currentFlipResult={currentFlipResult}
          rounds={rounds}
          onGuess={handleGuess}
        />
      }
      render3D={
        <CoinFlip3D
          phase={phase}
          hasGuessed={hasGuessed}
          myCurrentGuess={myCurrentGuess ?? null}
          currentRound={currentRound}
          maxRounds={maxRounds}
          player1Score={player1Score}
          player2Score={player2Score}
          currentFlipResult={currentFlipResult}
          rounds={rounds}
          onGuess={handleGuess}
        />
      }
    />
  );
}
