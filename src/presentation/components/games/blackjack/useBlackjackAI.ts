"use client";

import { AIDifficulty } from "@/src/domain/types/ai";
import type { BlackjackState } from "@/src/domain/types/blackjackState";
import {
    calculateHandValue,
    DEALER_STAND_VALUE,
} from "@/src/domain/types/blackjackState";

/**
 * Blackjack AI - Dealer Logic
 *
 * In Blackjack, the dealer follows fixed rules:
 * - Hit on 16 or less
 * - Stand on 17 or more (some variants: hit on soft 17)
 *
 * The AI difficulty affects player-side decisions if we implement AI players,
 * but for dealer, rules are fixed.
 */

export type BlackjackAIMove = "hit" | "stand";

/**
 * Calculate the AI move for Blackjack dealer
 * Dealer rules are fixed: hit < 17, stand >= 17
 */
export function calculateBlackjackDealerMove(
  gameState: BlackjackState,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _difficulty: AIDifficulty = "medium"
): BlackjackAIMove {
  const dealerValue = calculateHandValue(gameState.dealerHand);

  // Standard dealer rules - hit until 17 or more
  if (dealerValue < DEALER_STAND_VALUE) {
    return "hit";
  }

  return "stand";
}

/**
 * Calculate AI player move (for AI opponent, not dealer)
 * Uses basic strategy based on difficulty
 */
export function calculateBlackjackPlayerAIMove(
  gameState: BlackjackState,
  playerId: string,
  difficulty: AIDifficulty
): BlackjackAIMove {
  const playerHand = gameState.playerHands.find(
    (h) => h.playerId === playerId
  );
  if (!playerHand) return "stand";

  const playerValue = calculateHandValue(playerHand.cards);
  const dealerUpCard = gameState.dealerHand[0];
  const dealerUpValue = dealerUpCard
    ? ["10", "J", "Q", "K"].includes(dealerUpCard.rank)
      ? 10
      : dealerUpCard.rank === "A"
        ? 11
        : parseInt(dealerUpCard.rank)
    : 0;

  switch (difficulty) {
    case "easy":
      return easyStrategy(playerValue);
    case "medium":
      return mediumStrategy(playerValue, dealerUpValue);
    case "hard":
      return hardStrategy(playerValue, dealerUpValue, playerHand.cards);
    default:
      return mediumStrategy(playerValue, dealerUpValue);
  }
}

/**
 * Easy AI - Simple threshold strategy
 */
function easyStrategy(playerValue: number): BlackjackAIMove {
  // Hit if under 17, otherwise stand
  // This is a simple but not optimal strategy
  if (playerValue < 17) {
    return "hit";
  }
  return "stand";
}

/**
 * Medium AI - Basic strategy based on dealer up card
 */
function mediumStrategy(
  playerValue: number,
  dealerUpValue: number
): BlackjackAIMove {
  // Stand on 17 or more
  if (playerValue >= 17) {
    return "stand";
  }

  // Stand on 13-16 if dealer shows 2-6 (likely to bust)
  if (playerValue >= 13 && playerValue <= 16 && dealerUpValue >= 2 && dealerUpValue <= 6) {
    return "stand";
  }

  // Stand on 12 if dealer shows 4-6
  if (playerValue === 12 && dealerUpValue >= 4 && dealerUpValue <= 6) {
    return "stand";
  }

  // Hit otherwise
  return "hit";
}

/**
 * Hard AI - Optimal basic strategy
 */
function hardStrategy(
  playerValue: number,
  dealerUpValue: number,
  cards: { rank: string }[]
): BlackjackAIMove {
  const hasAce = cards.some((c) => c.rank === "A");
  const isSoft = hasAce && playerValue <= 21;

  // Hard hand strategy
  if (!isSoft || playerValue >= 20) {
    // Stand on 17+
    if (playerValue >= 17) {
      return "stand";
    }

    // Stand on 13-16 vs dealer 2-6
    if (playerValue >= 13 && dealerUpValue >= 2 && dealerUpValue <= 6) {
      return "stand";
    }

    // Stand on 12 vs dealer 4-6
    if (playerValue === 12 && dealerUpValue >= 4 && dealerUpValue <= 6) {
      return "stand";
    }

    // Hit otherwise
    return "hit";
  }

  // Soft hand strategy (hand with Ace counted as 11)
  // Always stand on soft 19-21
  if (playerValue >= 19) {
    return "stand";
  }

  // Soft 18 - stand vs 2-8, hit vs 9-A
  if (playerValue === 18) {
    if (dealerUpValue >= 2 && dealerUpValue <= 8) {
      return "stand";
    }
    return "hit";
  }

  // Soft 17 or less - always hit
  return "hit";
}
