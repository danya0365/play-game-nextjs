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

  /** Get fresh game state (to avoid stale closure) */
  getLatestState?: () => TGameState | null;
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
  getLatestState,
}: UseAIPlayerOptions<TGameState, TMove>) {
  const { enabled, difficulty, aiPlayer } = useAIStore();
  const isProcessing = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Store refs to avoid stale closures and unnecessary re-renders
  const getLatestStateRef = useRef(getLatestState);
  const calculateAIMoveRef = useRef(calculateAIMove);
  const executeMoveRef = useRef(executeMove);

  // Update refs when functions change
  useEffect(() => {
    getLatestStateRef.current = getLatestState;
    calculateAIMoveRef.current = calculateAIMove;
    executeMoveRef.current = executeMove;
  }, [getLatestState, calculateAIMove, executeMove]);

  // Extract currentTurn from gameState for dependency tracking
  const currentTurn = (gameState as { currentTurn?: string } | null)
    ?.currentTurn;

  // Calculate isAITurn internally to avoid stale closure
  const isAITurn =
    enabled && isPlaying && aiPlayer !== null && currentTurn === aiPlayer?.id;

  // Execute AI move - uses refs to avoid stale closures
  const makeAIMove = useCallback(() => {
    // Get FRESH gameState from ref callback
    const currentState = getLatestStateRef.current
      ? getLatestStateRef.current()
      : null;

    if (!currentState || !enabled || isProcessing.current) {
      return;
    }

    isProcessing.current = true;

    // Calculate best move based on difficulty with FRESH state
    const move = calculateAIMoveRef.current(currentState, difficulty);

    // Validate move is valid (cell is empty)
    const board = (currentState as { board?: (string | null)[] }).board;
    if (board && board[move as number] !== null) {
      console.error("[AIPlayer] Invalid move! Cell already occupied:", move);
      isProcessing.current = false;
      return;
    }

    // Execute with delay to feel more natural
    timeoutRef.current = setTimeout(() => {
      executeMoveRef.current(move);
      isProcessing.current = false;
    }, moveDelay);
  }, [enabled, difficulty, moveDelay]); // Minimal dependencies!

  // Track if AI move has been scheduled for current turn
  const moveScheduledForTurn = useRef<string | null>(null);

  // Watch for AI's turn - minimal dependencies to avoid re-triggers
  useEffect(() => {
    // Skip if not AI's turn
    if (!enabled || !isPlaying || !isAITurn) {
      // Reset scheduled turn when it's not AI's turn
      if (!isAITurn) {
        moveScheduledForTurn.current = null;
        isProcessing.current = false;
      }
      return;
    }

    // Skip if already scheduled move for this turn
    if (moveScheduledForTurn.current === currentTurn) {
      return;
    }

    moveScheduledForTurn.current = currentTurn ?? null;

    // Small delay to ensure state is stable before AI moves
    const startDelay = setTimeout(() => {
      makeAIMove();
    }, 150);

    return () => {
      clearTimeout(startDelay);
    };
  }, [enabled, isPlaying, isAITurn, currentTurn, makeAIMove]); // Only track turn changes!

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
