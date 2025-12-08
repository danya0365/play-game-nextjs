"use client";

import type {
  CoinFlipRound,
  CoinFlipState,
  CoinGuess,
} from "@/src/domain/types/coinFlipState";
import { startNextRound } from "@/src/domain/types/coinFlipState";
import { calculateCoinFlipAIMove } from "@/src/presentation/components/games/coin-flip/useCoinFlipAI";
import { useAIStore } from "@/src/presentation/stores/aiStore";
import { useGameStore } from "@/src/presentation/stores/gameStore";
import { useSound } from "@/src/presentation/stores/soundStore";
import { useCallback, useEffect, useRef } from "react";
import { useGameBase } from "./useGameBase";

/**
 * Custom hook for Coin Flip game logic
 */
export function useCoinFlipGame() {
  const base = useGameBase();
  const { gameState, user, isPlaying } = base;

  const { enabled: isAIEnabled, aiPlayer, difficulty } = useAIStore();
  const { makeCoinFlipGuess, setGameState } = useGameStore();
  const { playPlaceMark } = useSound();

  const cfState = gameState as CoinFlipState | null;

  // Determine my role
  const myRole = cfState?.player1 === user?.id ? "player1" : "player2";

  // Check if I've already guessed
  const myCurrentGuess =
    myRole === "player1"
      ? cfState?.player1CurrentGuess
      : cfState?.player2CurrentGuess;
  const hasGuessed = myCurrentGuess !== null;

  // Opponent guess
  const opponentGuess =
    myRole === "player1"
      ? cfState?.player2CurrentGuess
      : cfState?.player1CurrentGuess;
  const opponentHasGuessed = opponentGuess !== null;

  // AI handling
  const aiTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isAIEnabled || !aiPlayer || !cfState || !isPlaying) return;
    if (cfState.phase !== "guessing") return;

    const aiIsPlayer1 = cfState.player1 === aiPlayer.id;
    const aiGuess = aiIsPlayer1
      ? cfState.player1CurrentGuess
      : cfState.player2CurrentGuess;

    if (aiGuess !== null) return;

    aiTimeoutRef.current = setTimeout(() => {
      const guess = calculateCoinFlipAIMove(cfState, difficulty);
      if (guess) {
        playPlaceMark();
        makeCoinFlipGuess(guess, aiPlayer.id);
      }
    }, 500 + Math.random() * 500);

    return () => {
      if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
    };
  }, [
    isAIEnabled,
    aiPlayer,
    cfState,
    isPlaying,
    difficulty,
    playPlaceMark,
    makeCoinFlipGuess,
  ]);

  // Auto-advance after revealing
  useEffect(() => {
    if (!cfState || cfState.phase !== "revealing" || !isPlaying) return;

    const timeout = setTimeout(() => {
      const newState = startNextRound(cfState);
      setGameState(newState);
    }, 2500);

    return () => clearTimeout(timeout);
  }, [cfState, isPlaying, setGameState]);

  // Handle guess
  const handleGuess = useCallback(
    (guess: CoinGuess) => {
      if (!isPlaying || hasGuessed || cfState?.phase !== "guessing") return;
      playPlaceMark();
      makeCoinFlipGuess(guess);
    },
    [isPlaying, hasGuessed, cfState?.phase, playPlaceMark, makeCoinFlipGuess]
  );

  // Get result info
  const getResultInfo = useCallback(() => {
    const baseResult = base.getBaseResultInfo();
    if (!baseResult) return null;

    const winnerPlayer = cfState?.players.find(
      (p) => p.odId === cfState.winner
    );

    const myScore =
      myRole === "player1"
        ? cfState?.player1Score ?? 0
        : cfState?.player2Score ?? 0;
    const opponentScore =
      myRole === "player1"
        ? cfState?.player2Score ?? 0
        : cfState?.player1Score ?? 0;

    return {
      ...baseResult,
      title: winnerPlayer ? `${winnerPlayer.nickname} ชนะ!` : "เสมอ!",
      subtitle: `${myScore} - ${opponentScore}`,
    };
  }, [base, cfState, myRole]);

  // Scores from my perspective
  const myScore =
    myRole === "player1"
      ? cfState?.player1Score ?? 0
      : cfState?.player2Score ?? 0;
  const opponentScore =
    myRole === "player1"
      ? cfState?.player2Score ?? 0
      : cfState?.player1Score ?? 0;

  // Transform rounds to my perspective
  const myRounds: CoinFlipRound[] = (cfState?.rounds ?? []).map((round) => ({
    ...round,
    player1Guess:
      myRole === "player1" ? round.player1Guess : round.player2Guess,
    player2Guess:
      myRole === "player1" ? round.player2Guess : round.player1Guess,
    player1Correct:
      myRole === "player1" ? round.player1Correct : round.player2Correct,
    player2Correct:
      myRole === "player1" ? round.player2Correct : round.player1Correct,
  }));

  return {
    ...base,

    cfState,
    myRole,
    myCurrentGuess,
    hasGuessed,
    opponentHasGuessed,
    currentRound: cfState?.currentRound ?? 1,
    maxRounds: cfState?.maxRounds ?? 5,
    player1Score: myScore,
    player2Score: opponentScore,
    phase: cfState?.phase ?? "guessing",
    currentFlipResult: cfState?.currentFlipResult ?? null,
    rounds: myRounds,

    isAIEnabled,
    aiPlayer,

    handleGuess,
    getResultInfo,
  };
}
