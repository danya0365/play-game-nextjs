"use client";

import type { BlackjackState } from "@/src/domain/types/blackjackState";
import {
    calculateHandValue,
    isBlackjack,
} from "@/src/domain/types/blackjackState";
import {
    BlackjackAIMove,
    calculateBlackjackPlayerAIMove,
} from "@/src/presentation/components/games/blackjack/useBlackjackAI";
import { useAIPlayer } from "@/src/presentation/hooks/useAIPlayer";
import { useAIStore } from "@/src/presentation/stores/aiStore";
import { useGameStore } from "@/src/presentation/stores/gameStore";
import { useSound } from "@/src/presentation/stores/soundStore";
import { useCallback, useEffect, useRef } from "react";
import { useGameBase } from "./useGameBase";

/**
 * Custom hook for Blackjack game logic
 * Extends useGameBase with Blackjack-specific logic
 */
export function useBlackjackGame() {
  // Base game logic
  const base = useGameBase();
  const { gameState, user, isMyTurn, isPlaying } = base;

  // AI Store
  const { enabled: isAIEnabled, aiPlayer } = useAIStore();

  // Game-specific store actions
  const { blackjackDeal, blackjackHit, blackjackStand, blackjackDealerPlay } =
    useGameStore();
  const { playPlaceMark, playClick } = useSound();

  // Refs to track pending actions
  const dealingStarted = useRef(false);
  const dealerPlayStarted = useRef(false);

  // Cast to BlackjackState
  const bjState = gameState as BlackjackState | null;

  // Get my hand
  const myHand = bjState?.playerHands.find((h) => h.playerId === user?.id);

  // Get my hand value
  const myHandValue = myHand ? calculateHandValue(myHand.cards) : 0;

  // Check if I have blackjack
  const hasBlackjack = myHand ? isBlackjack(myHand.cards) : false;

  // Auto-deal cards after delay when in dealing phase
  useEffect(() => {
    if (!isPlaying || bjState?.phase !== "dealing") {
      dealingStarted.current = false;
      return;
    }
    if (dealingStarted.current) return;
    // Only deal if hands are empty
    if (bjState.dealerHand.length > 0) return;

    dealingStarted.current = true;
    const timer = setTimeout(() => {
      playPlaceMark();
      blackjackDeal();
    }, 1000);

    return () => clearTimeout(timer);
  }, [isPlaying, bjState?.phase, bjState?.dealerHand.length, blackjackDeal, playPlaceMark]);

  // Auto-play dealer turn
  useEffect(() => {
    if (!isPlaying || bjState?.phase !== "dealer_turn") {
      dealerPlayStarted.current = false;
      return;
    }
    if (dealerPlayStarted.current) return;

    dealerPlayStarted.current = true;
    const timer = setTimeout(() => {
      blackjackDealerPlay();
    }, 1500);

    return () => clearTimeout(timer);
  }, [isPlaying, bjState?.phase, blackjackDealerPlay]);

  // Check if it's AI's turn (for AI player, not dealer)
  const isAITurn =
    isAIEnabled &&
    isPlaying &&
    aiPlayer !== null &&
    bjState?.currentTurn === aiPlayer?.id &&
    bjState?.phase === "player_turn";

  // Get fresh state from store
  const getLatestState = useCallback(() => {
    return useGameStore.getState().gameState as BlackjackState | null;
  }, []);

  // AI Player hook (for AI opponent)
  const { isAITurn: isAIMoving } = useAIPlayer<BlackjackState, BlackjackAIMove>({
    gameState: bjState,
    isAITurn,
    isPlaying,
    calculateAIMove: (state, difficulty) =>
      calculateBlackjackPlayerAIMove(state, aiPlayer?.id || "", difficulty),
    executeMove: (move: BlackjackAIMove) => {
      if (aiPlayer) {
        playPlaceMark();
        if (move === "hit") {
          blackjackHit(aiPlayer.id);
        } else {
          blackjackStand(aiPlayer.id);
        }
      }
    },
    moveDelay: 1500,
    getLatestState,
  });

  // Handle hit
  const handleHit = useCallback(() => {
    if (!isMyTurn || !isPlaying || isAIMoving) return;
    if (myHand?.hasStood || myHand?.hasBusted) return;
    playClick();
    blackjackHit();
  }, [isMyTurn, isPlaying, isAIMoving, myHand, playClick, blackjackHit]);

  // Handle stand
  const handleStand = useCallback(() => {
    if (!isMyTurn || !isPlaying || isAIMoving) return;
    if (myHand?.hasStood || myHand?.hasBusted) return;
    playClick();
    blackjackStand();
  }, [isMyTurn, isPlaying, isAIMoving, myHand, playClick, blackjackStand]);

  // Get result info
  const getResultInfo = useCallback(() => {
    const baseResult = base.getBaseResultInfo();
    if (!baseResult) return null;

    // Add Blackjack specific info
    if (myHand?.result === "blackjack") {
      return {
        ...baseResult,
        title: "🎉 BLACKJACK!",
        subtitle: `คุณชนะ! (+${myHand.payout})`,
      };
    }

    if (myHand?.result === "push") {
      return {
        ...baseResult,
        title: "🤝 เสมอ",
        subtitle: "Push - ได้เงินคืน",
      };
    }

    return baseResult;
  }, [base, myHand]);

  // Check if can take action
  const canTakeAction =
    isMyTurn &&
    isPlaying &&
    !isAIMoving &&
    bjState?.phase === "player_turn" &&
    myHand &&
    !myHand.hasStood &&
    !myHand.hasBusted;

  // Get dealer's visible card (first card)
  const dealerVisibleCard =
    bjState?.dealerHand && bjState.dealerHand.length > 0
      ? bjState.dealerHand[0]
      : null;

  // Get dealer's visible value
  const dealerVisibleValue = dealerVisibleCard
    ? ["10", "J", "Q", "K"].includes(dealerVisibleCard.rank)
      ? 10
      : dealerVisibleCard.rank === "A"
        ? 11
        : parseInt(dealerVisibleCard.rank)
    : 0;

  return {
    // Base game state & actions
    ...base,

    // Blackjack-specific state
    myHand,
    myHandValue,
    hasBlackjack,
    dealerHand: bjState?.dealerHand ?? [],
    dealerRevealed: bjState?.dealerRevealed ?? false,
    dealerVisibleCard,
    dealerVisibleValue,
    dealerValue: bjState?.dealerRevealed
      ? calculateHandValue(bjState.dealerHand)
      : dealerVisibleValue,
    playerHands: bjState?.playerHands ?? [],
    phase: bjState?.phase ?? "dealing",
    dealerId: bjState?.dealer ?? "",
    currentTurn: bjState?.currentTurn ?? "",
    gamePlayers: bjState?.players ?? [],
    gameLog: bjState?.gameLog ?? [],

    // Game state helpers
    canTakeAction,

    // AI state
    isAIEnabled,
    aiPlayer,
    isAITurn: isAIMoving,

    // Blackjack-specific actions
    handleHit,
    handleStand,
    getResultInfo,
  };
}
