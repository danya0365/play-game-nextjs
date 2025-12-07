"use client";

import type { ConnectFourState } from "@/src/domain/types/connectFourState";
import { BOARD_SIZE } from "@/src/domain/types/connectFourState";
import { calculateConnectFourAIMove } from "@/src/presentation/components/games/connect-four/useConnectFourAI";
import { useAIPlayer } from "@/src/presentation/hooks/useAIPlayer";
import { useAIStore } from "@/src/presentation/stores/aiStore";
import { useGameStore } from "@/src/presentation/stores/gameStore";
import { useSound } from "@/src/presentation/stores/soundStore";
import { useCallback } from "react";
import { useGameBase } from "./useGameBase";

/**
 * Custom hook for Connect Four game logic
 * Extends useGameBase with ConnectFour-specific logic
 * Includes AI player support
 */
export function useConnectFourGame() {
  // Base game logic
  const base = useGameBase();
  const { gameState, user, isMyTurn, isPlaying } = base;

  // AI Store
  const { enabled: isAIEnabled, aiPlayer } = useAIStore();

  // ConnectFour-specific store actions
  const { dropPiece } = useGameStore();
  const { playPlaceMark } = useSound();

  // Cast to ConnectFourState
  const cfState = gameState as ConnectFourState | null;

  // ConnectFour-specific: determine player color
  const myColor = cfState?.player1 === user?.id ? "red" : "yellow";
  const aiColor = myColor === "red" ? "yellow" : "red";

  // Check if it's AI's turn
  const isAITurn =
    isAIEnabled &&
    isPlaying &&
    aiPlayer !== null &&
    cfState?.currentTurn === aiPlayer?.id;

  // Get fresh state from store (avoids stale closure)
  const getLatestState = useCallback(() => {
    return useGameStore.getState().gameState as ConnectFourState | null;
  }, []);

  // AI Player hook - returns column index
  const { isAITurn: isAIMoving } = useAIPlayer<ConnectFourState, number>({
    gameState: cfState,
    isAITurn,
    isPlaying,
    calculateAIMove: calculateConnectFourAIMove,
    executeMove: (column: number) => {
      if (column >= 0 && aiPlayer) {
        playPlaceMark();
        dropPiece(column, aiPlayer.id);
      }
    },
    moveDelay: 700, // Slightly longer for more dramatic effect
    getLatestState,
  });

  // ConnectFour-specific: column click handler
  const handleColumnClick = useCallback(
    (column: number) => {
      if (!isMyTurn || !isPlaying || isAIMoving) return;
      playPlaceMark();
      dropPiece(column);
    },
    [isMyTurn, isPlaying, isAIMoving, playPlaceMark, dropPiece]
  );

  // ConnectFour-specific result info
  const getResultInfo = useCallback(() => {
    const baseResult = base.getBaseResultInfo();
    if (!baseResult) return null;
    return baseResult;
  }, [base]);

  return {
    // Base game state & actions
    ...base,

    // ConnectFour-specific state
    myColor,
    aiColor,
    board: cfState?.board ?? Array(BOARD_SIZE).fill(null),
    winningCells: cfState?.winningCells ?? null,
    lastMove: cfState?.lastMove ?? null,

    // AI state
    isAIEnabled,
    aiPlayer,
    isAITurn: isAIMoving,

    // ConnectFour-specific actions
    handleColumnClick,
    getResultInfo,
  };
}
