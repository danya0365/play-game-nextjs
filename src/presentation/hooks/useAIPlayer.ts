"use client";

import { AIDifficulty } from "@/src/domain/types/ai";
import { useAIStore } from "@/src/presentation/stores/aiStore";
import { useCallback, useEffect, useRef } from "react";

interface UseAIPlayerOptions<TGameState, TMove> {
  /** Current game state */
  gameState: TGameState | null;

  /** Check if it's AI's turn */
  isAITurn: boolean;

  /** Game is currently playing */
  isPlaying: boolean;

  /** AI move calculation function */
  calculateAIMove: (state: TGameState, difficulty: AIDifficulty) => TMove;

  /** Execute the move */
  executeMove: (move: TMove) => void;

  /** Delay before AI makes move (ms) - makes it feel more natural */
  moveDelay?: number;
}

/**
 * Base hook for AI player functionality
 * Handles AI turn detection and move execution
 */
export function useAIPlayer<TGameState, TMove>({
  gameState,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isAITurn: _isAITurnProp, // Kept for backward compat, calculated internally
  isPlaying,
  calculateAIMove,
  executeMove,
  moveDelay = 800,
}: UseAIPlayerOptions<TGameState, TMove>) {
  const { enabled, difficulty, aiPlayer } = useAIStore();
  const isProcessing = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Extract currentTurn from gameState for dependency tracking
  const currentTurn = (gameState as { currentTurn?: string } | null)
    ?.currentTurn;

  // Calculate isAITurn internally to avoid stale closure
  const isAITurn =
    enabled && isPlaying && aiPlayer !== null && currentTurn === aiPlayer?.id;

  // Execute AI move
  const makeAIMove = useCallback(() => {
    if (!gameState || !enabled || isProcessing.current) return;

    isProcessing.current = true;

    // Calculate best move based on difficulty
    const move = calculateAIMove(gameState, difficulty);

    // Execute with delay to feel more natural
    timeoutRef.current = setTimeout(() => {
      executeMove(move);
      isProcessing.current = false;
    }, moveDelay);
  }, [gameState, enabled, difficulty, calculateAIMove, executeMove, moveDelay]);

  // Watch for AI's turn
  useEffect(() => {
    // Skip if not AI's turn or already processing
    if (
      !enabled ||
      !isPlaying ||
      !gameState ||
      !isAITurn ||
      isProcessing.current
    ) {
      return;
    }

    makeAIMove();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [
    enabled,
    isPlaying,
    currentTurn,
    aiPlayer?.id,
    isAITurn,
    gameState,
    makeAIMove,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isAIEnabled: enabled,
    aiPlayer,
    difficulty,
    isAITurn: enabled && isAITurn,
  };
}
