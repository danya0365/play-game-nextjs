"use client";

import { GameLayout } from "@/src/presentation/components/game/GameLayout";
import { GameViewBase } from "@/src/presentation/components/game/GameViewBase";
import { useRockPaperScissorsGame } from "@/src/presentation/hooks/useRockPaperScissorsGame";
import { RockPaperScissors2D } from "./RockPaperScissors2D";
import { RockPaperScissors3D } from "./RockPaperScissors3D";

/**
 * Rock Paper Scissors Game View
 * Uses GameViewBase for common UI, only provides game-specific rendering
 */
export function RockPaperScissorsView() {
  // Game logic hook
  const game = useRockPaperScissorsGame();

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
    hasChosen,
    myCurrentChoice,
    opponentHasChosen,
    currentRound,
    maxRounds,
    player1Score,
    player2Score,
    rounds,
    handleChoice,
    handleRestart,
    handleLeave,
    handleCloseResult,
    handleShowResult,
    getResultInfo,
  } = game;

  // Get opponent choice (only visible after reveal)
  const rpsState = game.rpsState;
  const opponentChoice =
    myRole === "player1"
      ? rpsState?.player2CurrentChoice
      : rpsState?.player1CurrentChoice;

  // Loading state
  if (!room || !gameState) {
    return (
      <GameLayout gameName="เป่ายิ้งฉุบ" onLeave={handleLeave}>
        <div className="h-full flex items-center justify-center">
          <p className="text-muted">กำลังโหลดเกม...</p>
        </div>
      </GameLayout>
    );
  }

  return (
    <GameViewBase
      // Game info
      gameName="เป่ายิ้งฉุบ"
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
      mySymbol={myRole === "player1" ? "🔵" : "🔴"}
      symbolColor={myRole === "player1" ? "info" : "error"}
      // Result
      result={getResultInfo()}
      // Actions
      onRestart={handleRestart}
      onLeave={handleLeave}
      onCloseResult={handleCloseResult}
      onShowResult={handleShowResult}
      // Camera settings
      cameraPosition={[0, 4, 8]}
      mobileCameraPosition={[0, 5, 10]}
      cameraFov={50}
      mobileCameraFov={55}
      backgroundColor="#1a1a2e"
      // Render 2D
      render2D={
        <RockPaperScissors2D
          phase={phase}
          hasChosen={hasChosen}
          myCurrentChoice={myCurrentChoice ?? null}
          opponentHasChosen={opponentHasChosen}
          opponentChoice={opponentChoice ?? null}
          currentRound={currentRound}
          maxRounds={maxRounds}
          player1Score={player1Score}
          player2Score={player2Score}
          rounds={rounds}
          isMyTurn={true} // Both can choose at same time
          onChoice={handleChoice}
        />
      }
      // Render 3D
      render3D={
        <RockPaperScissors3D
          phase={phase}
          hasChosen={hasChosen}
          myCurrentChoice={myCurrentChoice ?? null}
          opponentChoice={opponentChoice ?? null}
          currentRound={currentRound}
          maxRounds={maxRounds}
          player1Score={player1Score}
          player2Score={player2Score}
          rounds={rounds}
          onChoice={handleChoice}
        />
      }
    />
  );
}
