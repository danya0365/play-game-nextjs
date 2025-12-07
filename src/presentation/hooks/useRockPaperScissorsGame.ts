"use client";

import type {
  RockPaperScissorsState,
  RPSChoice,
} from "@/src/domain/types/rockPaperScissorsState";
import {
  CHOICE_ICONS,
  startNextRound,
} from "@/src/domain/types/rockPaperScissorsState";
import { calculateRPSAIMove } from "@/src/presentation/components/games/rock-paper-scissors/useRockPaperScissorsAI";
import { useAIStore } from "@/src/presentation/stores/aiStore";
import { useGameStore } from "@/src/presentation/stores/gameStore";
import { useSound } from "@/src/presentation/stores/soundStore";
import { useCallback, useEffect, useRef } from "react";
import { useGameBase } from "./useGameBase";

/**
 * Custom hook for Rock Paper Scissors game logic
 */
export function useRockPaperScissorsGame() {
  // Base game logic
  const base = useGameBase();
  const { gameState, user, isPlaying } = base;

  // AI Store
  const { enabled: isAIEnabled, aiPlayer, difficulty } = useAIStore();

  // Game store actions
  const { makeRPSChoice, setGameState } = useGameStore();
  const { playPlaceMark } = useSound();

  // Cast to RPS state
  const rpsState = gameState as RockPaperScissorsState | null;

  // Determine my role
  const myRole = rpsState?.player1 === user?.id ? "player1" : "player2";

  // Check if I've already chosen this round
  const myCurrentChoice =
    myRole === "player1"
      ? rpsState?.player1CurrentChoice
      : rpsState?.player2CurrentChoice;
  const hasChosen = myCurrentChoice !== null;

  // Check if opponent has chosen
  const opponentChoice =
    myRole === "player1"
      ? rpsState?.player2CurrentChoice
      : rpsState?.player1CurrentChoice;
  const opponentHasChosen = opponentChoice !== null;

  // AI turn handling
  const aiTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isAIEnabled || !aiPlayer || !rpsState || !isPlaying) return;
    if (rpsState.phase !== "choosing") return;

    // Check if AI needs to make a choice
    const aiIsPlayer1 = rpsState.player1 === aiPlayer.id;
    const aiChoice = aiIsPlayer1
      ? rpsState.player1CurrentChoice
      : rpsState.player2CurrentChoice;

    if (aiChoice !== null) return; // AI already chose

    // AI makes choice after delay
    aiTimeoutRef.current = setTimeout(() => {
      const choice = calculateRPSAIMove(rpsState, difficulty);
      if (choice) {
        playPlaceMark();
        makeRPSChoice(choice, aiPlayer.id);
      }
    }, 800 + Math.random() * 500); // Random delay for realism

    return () => {
      if (aiTimeoutRef.current) {
        clearTimeout(aiTimeoutRef.current);
      }
    };
  }, [
    isAIEnabled,
    aiPlayer,
    rpsState,
    isPlaying,
    difficulty,
    playPlaceMark,
    makeRPSChoice,
  ]);

  // Auto-advance to next round after reveal
  useEffect(() => {
    if (!rpsState || rpsState.phase !== "revealing" || !isPlaying) return;

    const timeout = setTimeout(() => {
      const newState = startNextRound(rpsState);
      setGameState(newState);
    }, 2000); // Show result for 2 seconds

    return () => clearTimeout(timeout);
  }, [rpsState, isPlaying, setGameState]);

  // Handle choice
  const handleChoice = useCallback(
    (choice: RPSChoice) => {
      if (!isPlaying || hasChosen || rpsState?.phase !== "choosing") return;
      playPlaceMark();
      makeRPSChoice(choice);
    },
    [isPlaying, hasChosen, rpsState?.phase, playPlaceMark, makeRPSChoice]
  );

  // Get result info
  const getResultInfo = useCallback(() => {
    const baseResult = base.getBaseResultInfo();
    if (!baseResult) return null;

    // Add RPS-specific info
    const winnerPlayer = rpsState?.players.find(
      (p) => p.odId === rpsState.winner
    );

    // Calculate scores from my perspective
    const myScore =
      myRole === "player1"
        ? rpsState?.player1Score ?? 0
        : rpsState?.player2Score ?? 0;
    const opponentScore =
      myRole === "player1"
        ? rpsState?.player2Score ?? 0
        : rpsState?.player1Score ?? 0;

    return {
      ...baseResult,
      title: winnerPlayer ? `${winnerPlayer.nickname} ชนะ!` : "เสมอ!",
      subtitle: `${myScore} - ${opponentScore}`,
    };
  }, [base, rpsState, myRole]);

  // Get player symbol
  const getPlayerSymbol = (playerId: string): string => {
    if (!rpsState) return "❓";
    const isP1 = playerId === rpsState.player1;
    const choice = isP1
      ? rpsState.player1CurrentChoice
      : rpsState.player2CurrentChoice;
    return choice ? CHOICE_ICONS[choice] : "❓";
  };

  // Scores from my perspective
  const myScore =
    myRole === "player1"
      ? rpsState?.player1Score ?? 0
      : rpsState?.player2Score ?? 0;
  const opponentScore =
    myRole === "player1"
      ? rpsState?.player2Score ?? 0
      : rpsState?.player1Score ?? 0;

  // Transform rounds to show from my perspective
  const myRounds = (rpsState?.rounds ?? []).map((round) => ({
    ...round,
    // Swap choices if I'm player2
    player1Choice:
      myRole === "player1" ? round.player1Choice : round.player2Choice,
    player2Choice:
      myRole === "player1" ? round.player2Choice : round.player1Choice,
    // Swap result if I'm player2
    result:
      myRole === "player1"
        ? round.result
        : round.result === "player1"
        ? ("player2" as const)
        : round.result === "player2"
        ? ("player1" as const)
        : round.result,
  }));

  return {
    // Base game state & actions
    ...base,

    // RPS-specific state
    rpsState,
    myRole,
    myCurrentChoice,
    hasChosen,
    opponentHasChosen,
    currentRound: rpsState?.currentRound ?? 1,
    maxRounds: rpsState?.maxRounds ?? 3,
    // Scores from my perspective (me vs opponent)
    player1Score: myScore,
    player2Score: opponentScore,
    phase: rpsState?.phase ?? "choosing",
    // Rounds from my perspective
    rounds: myRounds,

    // AI state
    isAIEnabled,
    aiPlayer,

    // Actions
    handleChoice,
    getResultInfo,
    getPlayerSymbol,
  };
}
