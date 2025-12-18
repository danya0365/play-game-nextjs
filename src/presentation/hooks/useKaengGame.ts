"use client";

import type { KaengState } from "@/src/domain/types/kaengState";
import { evaluateHand } from "@/src/domain/types/kaengState";
import { calculateKaengAIMove } from "@/src/presentation/components/games/kaeng/useKaengAI";
import { useAIPlayer } from "@/src/presentation/hooks/useAIPlayer";
import { useAIStore } from "@/src/presentation/stores/aiStore";
import { useGameStore } from "@/src/presentation/stores/gameStore";
import { useSound } from "@/src/presentation/stores/soundStore";
import { useCallback, useEffect, useRef } from "react";
import { useGameBase } from "./useGameBase";

/**
 * Custom hook for Kaeng game logic
 * Extends useGameBase with Kaeng-specific logic
 * Includes AI player support
 */
export function useKaengGame() {
  // Base game logic
  const base = useGameBase();
  const { gameState, user, isMyTurn, isPlaying } = base;

  // AI Store
  const { enabled: isAIEnabled, aiPlayer } = useAIStore();

  // Game-specific store actions
  const { kaengReveal, kaengFold, kaengDeal, kaengBankerReveal } =
    useGameStore();
  const { playPlaceMark } = useSound();

  // Cast to Kaeng state
  const kgState = gameState as KaengState | null;

  // Get my hand
  const myHand = kgState?.playerHands?.find((h) => h.playerId === user?.id);
  const myHandEval = myHand?.cards?.length ? evaluateHand(myHand.cards) : null;

  // Am I the banker?
  const isBanker = kgState?.banker === user?.id;

  // Check if it's AI's turn
  const isAITurn =
    isAIEnabled &&
    isPlaying &&
    aiPlayer !== null &&
    kgState?.currentTurn === aiPlayer?.id;

  // Refs for tracking state
  const dealingStarted = useRef(false);
  const aiActionPending = useRef(false);

  // Auto-deal when in dealing phase (anyone can trigger, happens once)
  useEffect(() => {
    if (
      kgState?.phase === "dealing" &&
      !dealingStarted.current &&
      kgState?.playerHands?.every((h) => h.cards.length === 0) // Cards not dealt yet
    ) {
      dealingStarted.current = true;
      // Delay dealing for visual effect
      const timer = setTimeout(() => {
        kaengDeal();
      }, 1000);
      return () => clearTimeout(timer);
    }
    // Reset flag when game restarts
    if (kgState?.phase !== "dealing") {
      dealingStarted.current = false;
    }
  }, [kgState?.phase, kgState?.playerHands, kaengDeal]);

  // AI Player hook for automatic moves
  const { isAITurn: isAIMoving } = useAIPlayer<KaengState, "reveal" | "fold">({
    gameState: kgState,
    isAITurn,
    isPlaying,
    calculateAIMove: calculateKaengAIMove,
    executeMove: (action: "reveal" | "fold") => {
      if (aiPlayer && !aiActionPending.current) {
        aiActionPending.current = true;
        playPlaceMark();

        // Check if it's banker's turn to reveal (revealing phase)
        if (
          kgState?.phase === "revealing" &&
          kgState?.currentTurn === aiPlayer.id
        ) {
          kaengBankerReveal();
        } else if (action === "reveal") {
          kaengReveal(aiPlayer.id);
        } else {
          kaengFold(aiPlayer.id);
        }

        setTimeout(() => {
          aiActionPending.current = false;
        }, 500);
      }
    },
    moveDelay: 2000, // 2 seconds delay for realistic play
    getLatestState: () =>
      useGameStore.getState().gameState as KaengState | null,
  });

  // Handle reveal action
  const handleReveal = useCallback(() => {
    if (!isMyTurn || !isPlaying || isAIMoving) return;
    playPlaceMark();
    kaengReveal(user?.id ?? "");
  }, [isMyTurn, isPlaying, isAIMoving, playPlaceMark, kaengReveal, user?.id]);

  // Handle fold action
  const handleFold = useCallback(() => {
    if (!isMyTurn || !isPlaying || isAIMoving) return;
    playPlaceMark();
    kaengFold(user?.id ?? "");
  }, [isMyTurn, isPlaying, isAIMoving, playPlaceMark, kaengFold, user?.id]);

  // Handle banker reveal (final reveal)
  const handleBankerReveal = useCallback(() => {
    if (!isBanker || !isPlaying || kgState?.phase !== "revealing") return;
    playPlaceMark();
    kaengBankerReveal();
  }, [isBanker, isPlaying, kgState?.phase, playPlaceMark, kaengBankerReveal]);

  // Can take action
  const canTakeAction =
    isMyTurn &&
    isPlaying &&
    !isAIMoving &&
    kgState?.phase === "playing" &&
    !myHand?.hasRevealed;

  // Can banker reveal
  const canBankerReveal =
    isBanker &&
    isPlaying &&
    kgState?.phase === "revealing" &&
    kgState?.currentTurn === user?.id;

  // Game-specific result info
  const getResultInfo = useCallback(() => {
    const baseResult = base.getBaseResultInfo();
    if (!baseResult) return null;
    return baseResult;
  }, [base]);

  return {
    // Base game state & actions
    ...base,

    // Kaeng-specific state
    myHand,
    myHandEval,
    isBanker,
    bankerId: kgState?.banker ?? "",
    playerHands: kgState?.playerHands ?? [],
    phase: kgState?.phase ?? "betting",
    currentTurn: kgState?.currentTurn ?? "",
    gamePlayers: kgState?.players ?? [],
    gameLog: kgState?.gameLog ?? [],
    allCardsRevealed: kgState?.allCardsRevealed ?? false,
    potAmount: kgState?.potAmount ?? 0,

    // Game state helpers
    canTakeAction,
    canBankerReveal,

    // AI state
    isAIEnabled,
    aiPlayer,
    isAITurn: isAIMoving,

    // Kaeng-specific actions
    handleReveal,
    handleFold,
    handleBankerReveal,
    getResultInfo,
  };
}
