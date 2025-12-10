"use client";

import type { PokDengState } from "@/src/domain/types/pokdengState";
import { evaluateHand } from "@/src/domain/types/pokdengState";
import {
  calculatePokDengAIMove,
  PokDengAIMove,
} from "@/src/presentation/components/games/pokdeng/usePokDengAI";
import { useAIPlayer } from "@/src/presentation/hooks/useAIPlayer";
import { useAIStore } from "@/src/presentation/stores/aiStore";
import { useGameStore } from "@/src/presentation/stores/gameStore";
import { useSound } from "@/src/presentation/stores/soundStore";
import { useCallback, useEffect, useRef } from "react";
import { useGameBase } from "./useGameBase";

/**
 * Custom hook for Pok Deng game logic
 * Extends useGameBase with Pok Deng-specific logic
 */
export function usePokDengGame() {
  // Base game logic
  const base = useGameBase();
  const { gameState, user, isMyTurn, isPlaying } = base;

  // AI Store
  const { enabled: isAIEnabled, aiPlayer } = useAIStore();

  // Game-specific store actions
  const { pokDengDeal, pokDengDraw, pokDengStand, pokDengReveal } =
    useGameStore();
  const { playPlaceMark, playClick } = useSound();

  // Refs to track pending actions
  const aiRevealPending = useRef(false);
  const dealingStarted = useRef(false);

  // Cast to PokDengState
  const pdState = gameState as PokDengState | null;

  // Determine if user is dealer
  const isDealer = pdState?.dealer === user?.id;

  // Get my hand (if not dealer)
  const myHand = pdState?.playerHands.find((h) => h.playerId === user?.id);

  // Get my hand evaluation
  const myHandEval = myHand ? evaluateHand(myHand.cards) : null;

  // Auto-deal cards after delay when in dealing phase
  useEffect(() => {
    if (!isPlaying || pdState?.phase !== "dealing") {
      dealingStarted.current = false;
      return;
    }
    if (dealingStarted.current) return;

    dealingStarted.current = true;
    const timer = setTimeout(() => {
      playPlaceMark(); // Sound effect for dealing
      pokDengDeal();
    }, 1500); // 1.5 second delay to show empty table first

    return () => clearTimeout(timer);
  }, [isPlaying, pdState?.phase, pokDengDeal, playPlaceMark]);

  // Check if it's AI's turn
  const isAITurn =
    isAIEnabled &&
    isPlaying &&
    aiPlayer !== null &&
    pdState?.currentTurn === aiPlayer?.id &&
    pdState?.phase === "player_turn";

  // Get fresh state from store (avoids stale closure)
  const getLatestState = useCallback(() => {
    return useGameStore.getState().gameState as PokDengState | null;
  }, []);

  // AI Player hook
  const { isAITurn: isAIMoving } = useAIPlayer<PokDengState, PokDengAIMove>({
    gameState: pdState,
    isAITurn,
    isPlaying,
    calculateAIMove: calculatePokDengAIMove,
    executeMove: (move: PokDengAIMove) => {
      if (aiPlayer) {
        playPlaceMark();
        if (move === "draw") {
          pokDengDraw(aiPlayer.id);
        } else {
          pokDengStand(aiPlayer.id);
        }
      }
    },
    moveDelay: 2000, // 2 second delay for card game feel
    getLatestState,
  });

  // Handle draw card
  const handleDraw = useCallback(() => {
    if (!isMyTurn || !isPlaying || isAIMoving) return;
    if (myHand?.hasStood || myHand?.hasDrawn) return;
    playClick();
    pokDengDraw();
  }, [isMyTurn, isPlaying, isAIMoving, myHand, playClick, pokDengDraw]);

  // Handle stand
  const handleStand = useCallback(() => {
    if (!isMyTurn || !isPlaying || isAIMoving) return;
    if (myHand?.hasStood || myHand?.hasDrawn) return;
    playClick();
    pokDengStand();
  }, [isMyTurn, isPlaying, isAIMoving, myHand, playClick, pokDengStand]);

  // Handle reveal (dealer action)
  const handleReveal = useCallback(() => {
    if (!isPlaying) return;
    if (pdState?.phase !== "revealing") return;
    if (!isDealer) return;
    playClick();
    pokDengReveal();
  }, [isPlaying, pdState?.phase, isDealer, playClick, pokDengReveal]);

  // Check if can reveal (dealer in revealing phase)
  const canReveal = isDealer && pdState?.phase === "revealing" && isPlaying;

  // Auto-reveal for AI dealer after delay
  useEffect(() => {
    if (!isAIEnabled || !aiPlayer) return;
    if (pdState?.phase !== "revealing") {
      aiRevealPending.current = false;
      return;
    }
    if (pdState?.dealer !== aiPlayer.id) return;
    if (aiRevealPending.current) return;

    aiRevealPending.current = true;
    const timer = setTimeout(() => {
      pokDengReveal(aiPlayer.id);
      aiRevealPending.current = false;
    }, 1500); // 1.5 second delay for AI reveal

    return () => clearTimeout(timer);
  }, [isAIEnabled, aiPlayer, pdState?.phase, pdState?.dealer, pokDengReveal]);

  // Get result info
  const getResultInfo = useCallback(() => {
    const baseResult = base.getBaseResultInfo();
    if (!baseResult) return null;

    // Add Pok Deng specific info
    if (myHand?.result === "win") {
      const handEval = evaluateHand(myHand.cards);
      return {
        ...baseResult,
        subtitle: `${baseResult.subtitle} (+${myHand.payout} × ${handEval.deng} เด้ง)`,
      };
    }

    return baseResult;
  }, [base, myHand]);

  // Check if can take action
  const canTakeAction =
    isMyTurn &&
    isPlaying &&
    !isAIMoving &&
    pdState?.phase === "player_turn" &&
    myHand &&
    !myHand.hasStood &&
    !myHand.hasDrawn;

  return {
    // Base game state & actions
    ...base,

    // Pok Deng-specific state
    isDealer,
    myHand,
    myHandEval,
    dealerHand: pdState?.dealerHand ?? [],
    dealerRevealed: pdState?.dealerRevealed ?? false,
    playerHands: pdState?.playerHands ?? [],
    phase: pdState?.phase ?? "betting",
    currentPlayerIndex: pdState?.currentPlayerIndex ?? 0,
    dealerId: pdState?.dealer ?? "",
    currentTurn: pdState?.currentTurn ?? "",
    gamePlayers: pdState?.players ?? [],
    gameLog: pdState?.gameLog ?? [],
    allCardsRevealed: pdState?.allCardsRevealed ?? false,

    // Game state helpers
    canTakeAction,
    canReveal,
    hasPok: myHandEval?.isPok ?? false,

    // AI state
    isAIEnabled,
    aiPlayer,
    isAITurn: isAIMoving,

    // Pok Deng-specific actions
    handleDraw,
    handleStand,
    handleReveal,
    getResultInfo,
  };
}
