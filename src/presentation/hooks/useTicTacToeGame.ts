"use client";

import type { TicTacToeState } from "@/src/domain/types/gameState";
import { calculateTicTacToeAIMove } from "@/src/presentation/components/games/tictactoe/useTicTacToeAI";
import { useAIPlayer } from "@/src/presentation/hooks/useAIPlayer";
import { useAIStore } from "@/src/presentation/stores/aiStore";
import { useGameStore } from "@/src/presentation/stores/gameStore";
import { useSound } from "@/src/presentation/stores/soundStore";
import { useCallback } from "react";
import { useGameBase } from "./useGameBase";

/**
 * Custom hook for Tic Tac Toe game logic
 * Extends useGameBase with TicTacToe-specific logic
 * Includes AI player support
 */
export function useTicTacToeGame() {
  // Base game logic
  const base = useGameBase();
  const { gameState, user, isMyTurn, isPlaying } = base;

  // AI Store
  const { enabled: isAIEnabled, aiPlayer } = useAIStore();

  // TicTacToe-specific store actions
  const { placeMark } = useGameStore();
  const { playPlaceMark } = useSound();

  // TicTacToe-specific: determine player mark
  const myMark = gameState?.playerX === user?.id ? "X" : "O";
  const aiMark = myMark === "X" ? "O" : "X";

  // Check if it's AI's turn - must match AI player ID
  const isAITurn =
    isAIEnabled &&
    isPlaying &&
    aiPlayer !== null &&
    gameState?.currentTurn === aiPlayer?.id;

  // AI Player hook
  const { isAITurn: isAIMoving } = useAIPlayer<TicTacToeState, number>({
    gameState: gameState as TicTacToeState | null,
    isAITurn,
    isPlaying,
    calculateAIMove: calculateTicTacToeAIMove,
    executeMove: (move: number) => {
      if (move >= 0 && aiPlayer) {
        playPlaceMark();
        placeMark(move, aiPlayer.id);
      }
    },
    moveDelay: 600,
  });

  // TicTacToe-specific: cell click handler
  const handleCellClick = useCallback(
    (index: number) => {
      if (!isMyTurn || !isPlaying || isAIMoving) return;
      playPlaceMark();
      placeMark(index);
    },
    [isMyTurn, isPlaying, isAIMoving, playPlaceMark, placeMark]
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
    aiMark,
    board: gameState?.board ?? Array(9).fill(null),
    winningLine: gameState?.winningLine ?? null,

    // AI state
    isAIEnabled,
    aiPlayer,
    isAITurn: isAIMoving,

    // TicTacToe-specific actions
    handleCellClick,
    getResultInfo,
  };
}
