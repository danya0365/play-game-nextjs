"use client";

import { GameLayout } from "@/src/presentation/components/game/GameLayout";
import { GameViewBase } from "@/src/presentation/components/game/GameViewBase";
import { useDiceRollGame } from "@/src/presentation/hooks/useDiceRollGame";
import { DiceRoll2D } from "./DiceRoll2D";
import { DiceRoll3D } from "./DiceRoll3D";

/**
 * Dice Roll Game View
 */
export function DiceRollView() {
  const game = useDiceRollGame();

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
    hasRolled,
    myCurrentRoll,
    opponentRoll,
    opponentHasRolled,
    currentRound,
    maxRounds,
    player1Score,
    player2Score,
    rounds,
    handleRoll,
    handleRestart,
    handleLeave,
    handleCloseResult,
    handleShowResult,
    getResultInfo,
  } = game;

  if (!room || !gameState) {
    return (
      <GameLayout gameName="โยนลูกเต๋า" onLeave={handleLeave}>
        <div className="h-full flex items-center justify-center">
          <p className="text-muted">กำลังโหลดเกม...</p>
        </div>
      </GameLayout>
    );
  }

  return (
    <GameViewBase
      gameName="โยนลูกเต๋า"
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
        <DiceRoll2D
          phase={phase}
          hasRolled={hasRolled}
          myCurrentRoll={myCurrentRoll ?? null}
          opponentRoll={opponentRoll ?? null}
          opponentHasRolled={opponentHasRolled}
          currentRound={currentRound}
          maxRounds={maxRounds}
          player1Score={player1Score}
          player2Score={player2Score}
          rounds={rounds}
          onRoll={handleRoll}
        />
      }
      render3D={
        <DiceRoll3D
          phase={phase}
          hasRolled={hasRolled}
          myCurrentRoll={myCurrentRoll ?? null}
          opponentRoll={opponentRoll ?? null}
          opponentHasRolled={opponentHasRolled}
          currentRound={currentRound}
          maxRounds={maxRounds}
          player1Score={player1Score}
          player2Score={player2Score}
          rounds={rounds}
          onRoll={handleRoll}
        />
      }
    />
  );
}
