"use client";

import { useGameStore } from "@/src/presentation/stores/gameStore";
import { useSound } from "@/src/presentation/stores/soundStore";
import { useCallback } from "react";
import { useGameBase } from "./useGameBase";

/**
 * Custom hook for Tic Tac Toe game logic
 * Extends useGameBase with TicTacToe-specific logic
 */
export function useTicTacToeGame() {
  // Base game logic
  const base = useGameBase();
  const { gameState, user, isMyTurn, isPlaying } = base;

  // TicTacToe-specific store actions
  const { placeMark } = useGameStore();
  const { playPlaceMark } = useSound();

  // TicTacToe-specific: determine player mark
  const myMark = gameState?.playerX === user?.id ? "X" : "O";

  // TicTacToe-specific: cell click handler
  const handleCellClick = useCallback(
    (index: number) => {
      if (!isMyTurn || !isPlaying) return;
      playPlaceMark();
      placeMark(index);
    },
    [isMyTurn, isPlaying, playPlaceMark, placeMark]
  );

  // TicTacToe-specific result info
  const getResultInfo = useCallback(() => {
    const baseResult = base.getBaseResultInfo();
    if (!baseResult) return null;
    return baseResult;
  }, [base]);

  return {
    // Base game state & actions
    ...base,

    // TicTacToe-specific state
    myMark,
    board: gameState?.board ?? Array(9).fill(null),
    winningLine: gameState?.winningLine ?? null,

    // TicTacToe-specific actions
    handleCellClick,
    getResultInfo,
  };
}
