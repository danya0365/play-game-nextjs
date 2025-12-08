"use client";

import type { GomokuState } from "@/src/domain/types/gomokuState";
import { calculateGomokuAIMove } from "@/src/presentation/components/games/gomoku/useGomokuAI";
import { useAIPlayer } from "@/src/presentation/hooks/useAIPlayer";
import { useAIStore } from "@/src/presentation/stores/aiStore";
import { useGameStore } from "@/src/presentation/stores/gameStore";
import { useSound } from "@/src/presentation/stores/soundStore";
import { useCallback } from "react";
import { useGameBase } from "./useGameBase";

/**
 * Custom hook for Gomoku game logic
 */
export function useGomokuGame() {
  const base = useGameBase();
  const { gameState, user, isMyTurn, isPlaying } = base;

  const { enabled: isAIEnabled, aiPlayer } = useAIStore();
  const { placeMark } = useGameStore();
  const { playPlaceMark } = useSound();

  const gmState = gameState as GomokuState | null;

  // Determine my color
  const myColor: "black" | "white" =
    gmState?.player1 === user?.id ? "black" : "white";
  const aiColor: "black" | "white" = myColor === "black" ? "white" : "black";

  // Check if it's AI's turn
  const isAITurn =
    isAIEnabled &&
    isPlaying &&
    aiPlayer !== null &&
    gameState?.currentTurn === aiPlayer?.id;

  // AI Player hook
  const { isAITurn: isAIMoving } = useAIPlayer<GomokuState, number>({
    gameState: gmState,
    isAITurn,
    isPlaying,
    calculateAIMove: calculateGomokuAIMove,
    executeMove: (move: number) => {
      if (move >= 0 && aiPlayer) {
        playPlaceMark();
        placeMark(move, aiPlayer.id);
      }
    },
    moveDelay: 400 + Math.random() * 300,
    getLatestState: () =>
      useGameStore.getState().gameState as GomokuState | null,
  });

  // Handle cell click
  const handleCellClick = useCallback(
    (index: number) => {
      if (!isMyTurn || !isPlaying || isAIMoving) return;
      if (!gmState || gmState.board[index] !== null) return;

      playPlaceMark();
      placeMark(index);
    },
    [isMyTurn, isPlaying, isAIMoving, gmState, playPlaceMark, placeMark]
  );

  // Get result info
  const getResultInfo = useCallback(() => {
    const baseResult = base.getBaseResultInfo();
    if (!baseResult) return null;

    const winnerPlayer = gmState?.players.find(
      (p) => p.odId === gmState.winner
    );

    return {
      ...baseResult,
      title:
        gmState?.winner === "draw"
          ? "เสมอ!"
          : winnerPlayer
          ? `${winnerPlayer.nickname} ชนะ!`
          : "จบเกม",
      subtitle:
        gmState?.winner === "draw"
          ? "ไม่มีที่ว่างแล้ว"
          : winnerPlayer
          ? `${winnerPlayer.odId === gmState?.player1 ? "⚫ ดำ" : "⚪ ขาว"}`
          : "",
    };
  }, [base, gmState]);

  return {
    ...base,

    gmState,
    myColor,
    aiColor,
    board: gmState?.board ?? [],
    winningCells: gmState?.winningCells ?? null,
    lastMove: gmState?.lastMove ?? null,

    isAIEnabled,
    aiPlayer,
    isAITurn: isAIMoving,

    handleCellClick,
    getResultInfo,
  };
}
