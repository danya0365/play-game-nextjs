"use client";

import type {
  DiceRollRound,
  DiceRollState,
} from "@/src/domain/types/diceRollState";
import { rollDice, startNextRound } from "@/src/domain/types/diceRollState";
import { calculateDiceRollAIMove } from "@/src/presentation/components/games/dice-roll/useDiceRollAI";
import { useAIStore } from "@/src/presentation/stores/aiStore";
import { useGameStore } from "@/src/presentation/stores/gameStore";
import { useSound } from "@/src/presentation/stores/soundStore";
import { useCallback, useEffect, useRef } from "react";
import { useGameBase } from "./useGameBase";

/**
 * Custom hook for Dice Roll game logic
 */
export function useDiceRollGame() {
  const base = useGameBase();
  const { gameState, user, isPlaying } = base;

  const { enabled: isAIEnabled, aiPlayer, difficulty } = useAIStore();
  const { makeDiceRoll, setGameState } = useGameStore();
  const { playPlaceMark } = useSound();

  const drState = gameState as DiceRollState | null;

  // Determine my role
  const myRole = drState?.player1 === user?.id ? "player1" : "player2";

  // Check if I've rolled
  const hasRolled =
    myRole === "player1"
      ? drState?.player1HasRolled
      : drState?.player2HasRolled;

  // My current roll
  const myCurrentRoll =
    myRole === "player1"
      ? drState?.player1CurrentRoll
      : drState?.player2CurrentRoll;

  // Opponent roll
  const opponentRoll =
    myRole === "player1"
      ? drState?.player2CurrentRoll
      : drState?.player1CurrentRoll;

  const opponentHasRolled =
    myRole === "player1"
      ? drState?.player2HasRolled
      : drState?.player1HasRolled;

  // AI handling
  const aiTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isAIEnabled || !aiPlayer || !drState || !isPlaying) return;
    if (drState.phase !== "rolling") return;

    const aiIsPlayer1 = drState.player1 === aiPlayer.id;
    const aiHasRolled = aiIsPlayer1
      ? drState.player1HasRolled
      : drState.player2HasRolled;

    if (aiHasRolled) return;

    aiTimeoutRef.current = setTimeout(() => {
      const roll = calculateDiceRollAIMove(drState, difficulty);
      if (roll) {
        playPlaceMark();
        makeDiceRoll(roll, aiPlayer.id);
      }
    }, 800 + Math.random() * 700);

    return () => {
      if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
    };
  }, [
    isAIEnabled,
    aiPlayer,
    drState,
    isPlaying,
    difficulty,
    playPlaceMark,
    makeDiceRoll,
  ]);

  // Auto-advance after revealing
  useEffect(() => {
    if (!drState || drState.phase !== "revealing" || !isPlaying) return;

    const timeout = setTimeout(() => {
      const newState = startNextRound(drState);
      setGameState(newState);
    }, 2500);

    return () => clearTimeout(timeout);
  }, [drState, isPlaying, setGameState]);

  // Handle roll
  const handleRoll = useCallback(() => {
    if (!isPlaying || hasRolled || drState?.phase !== "rolling") return;
    const value = rollDice();
    playPlaceMark();
    makeDiceRoll(value);
  }, [isPlaying, hasRolled, drState?.phase, playPlaceMark, makeDiceRoll]);

  // Get result info
  const getResultInfo = useCallback(() => {
    const baseResult = base.getBaseResultInfo();
    if (!baseResult) return null;

    const winnerPlayer = drState?.players.find(
      (p) => p.odId === drState.winner
    );

    const myScore =
      myRole === "player1"
        ? drState?.player1Score ?? 0
        : drState?.player2Score ?? 0;
    const opponentScore =
      myRole === "player1"
        ? drState?.player2Score ?? 0
        : drState?.player1Score ?? 0;

    return {
      ...baseResult,
      title: winnerPlayer ? `${winnerPlayer.nickname} ชนะ!` : "เสมอ!",
      subtitle: `${myScore} - ${opponentScore}`,
    };
  }, [base, drState, myRole]);

  // Scores from my perspective
  const myScore =
    myRole === "player1"
      ? drState?.player1Score ?? 0
      : drState?.player2Score ?? 0;
  const opponentScore =
    myRole === "player1"
      ? drState?.player2Score ?? 0
      : drState?.player1Score ?? 0;

  // Transform rounds to my perspective
  const myRounds: DiceRollRound[] = (drState?.rounds ?? []).map((round) => ({
    ...round,
    player1Roll: myRole === "player1" ? round.player1Roll : round.player2Roll,
    player2Roll: myRole === "player1" ? round.player2Roll : round.player1Roll,
    winner:
      myRole === "player1"
        ? round.winner
        : round.winner === "player1"
        ? "player2"
        : round.winner === "player2"
        ? "player1"
        : round.winner,
  }));

  return {
    ...base,

    drState,
    myRole,
    myCurrentRoll,
    hasRolled: hasRolled ?? false,
    opponentRoll,
    opponentHasRolled: opponentHasRolled ?? false,
    currentRound: drState?.currentRound ?? 1,
    maxRounds: drState?.maxRounds ?? 5,
    player1Score: myScore,
    player2Score: opponentScore,
    phase: drState?.phase ?? "rolling",
    rounds: myRounds,

    isAIEnabled,
    aiPlayer,

    handleRoll,
    getResultInfo,
  };
}
