"use client";

import { AIDifficulty } from "@/src/domain/types/ai";
import type {
  PokDengCard,
  PokDengState,
} from "@/src/domain/types/pokdengState";
import {
  calculatePoints,
  evaluateHand,
  isSameSuit,
} from "@/src/domain/types/pokdengState";

// AI Decision: "draw" or "stand"
export type PokDengAIMove = "draw" | "stand";

/**
 * Calculate the best move for Pok Deng AI
 * @param gameState - Current game state
 * @param difficulty - AI difficulty level
 * @returns "draw" to draw a card, "stand" to stand
 */
export function calculatePokDengAIMove(
  gameState: PokDengState,
  difficulty: AIDifficulty
): PokDengAIMove {
  // Find AI's hand
  const aiHand = gameState.playerHands.find(
    (h) => h.playerId === gameState.currentTurn
  );

  if (!aiHand || aiHand.hasStood || aiHand.hasDrawn) {
    return "stand";
  }

  const cards = aiHand.cards;
  const points = calculatePoints(cards);
  const hand = evaluateHand(cards);

  // If already has Pok, always stand
  if (hand.isPok) {
    return "stand";
  }

  switch (difficulty) {
    case "easy":
      return easyStrategy(points);
    case "medium":
      return mediumStrategy(points, cards);
    case "hard":
      return hardStrategy(points, cards, gameState);
    default:
      return easyStrategy(points);
  }
}

/**
 * Easy AI - Random or simple threshold
 */
function easyStrategy(points: number): PokDengAIMove {
  // Simple rule: draw if less than 5, otherwise random
  if (points < 4) {
    return "draw";
  }
  if (points >= 7) {
    return "stand";
  }
  // Random for middle points
  return Math.random() > 0.5 ? "draw" : "stand";
}

/**
 * Medium AI - Basic strategy with some consideration
 */
function mediumStrategy(points: number, cards: PokDengCard[]): PokDengAIMove {
  // Check for special hands that are worth keeping
  if (isSameSuit(cards) && points >= 6) {
    return "stand"; // Keep same suit with good points
  }

  // Draw thresholds
  if (points <= 4) {
    return "draw";
  }
  if (points >= 7) {
    return "stand";
  }

  // For 5-6 points, consider drawing with some probability
  if (points === 5) {
    return Math.random() > 0.4 ? "draw" : "stand";
  }
  // 6 points
  return Math.random() > 0.7 ? "draw" : "stand";
}

/**
 * Hard AI - Advanced strategy considering all factors
 */
function hardStrategy(
  points: number,
  cards: PokDengCard[],
  gameState: PokDengState
): PokDengAIMove {
  const hand = evaluateHand(cards);

  // Always stand on special hands or high points
  if (hand.deng > 1 && points >= 6) {
    return "stand";
  }

  // Analyze what dealer might have
  const dealerCards = gameState.dealerHand;
  const dealerRevealed = gameState.dealerRevealed;

  // If dealer is revealed and has Pok, need to be aggressive
  if (dealerRevealed) {
    const dealerHand = evaluateHand(dealerCards);
    if (dealerHand.isPok) {
      // Need to try to beat Pok - only special hands can
      return points >= 8 ? "stand" : "draw";
    }
  }

  // Calculate expected value of drawing
  // With 3 cards, we can get special hands like straight, flush, etc.
  const drawExpectedValue = calculateDrawExpectedValue(cards);

  // Stand thresholds based on expected value
  if (points >= 8) {
    return "stand";
  }
  if (points >= 7) {
    return drawExpectedValue > 7 ? "draw" : "stand";
  }
  if (points >= 6) {
    return drawExpectedValue > 6 ? "draw" : "stand";
  }
  if (points >= 5) {
    return drawExpectedValue > 5 ? "draw" : "stand";
  }

  // Low points - always draw
  return "draw";
}

/**
 * Calculate expected value of drawing a third card
 * This is a simplified calculation
 */
function calculateDrawExpectedValue(cards: PokDengCard[]): number {
  const currentPoints = calculatePoints(cards);

  // If same suit, higher chance of getting flush
  const sameSuitBonus = isSameSuit(cards) ? 0.5 : 0;

  // Average expected points after drawing
  // Cards that give 0 points: 10, J, Q, K (4 each = 16 cards)
  // Cards that give 1-9 points: A, 2-9 (4 each = 36 cards)

  // Probability of each outcome
  const probZero = 16 / 52;
  const probOther = 36 / 52;

  // Expected additional points
  const expectedAddition = probZero * 0 + probOther * 4.5;

  // New expected points (mod 10)
  let expectedNewPoints = (currentPoints + expectedAddition) % 10;

  // Add bonus for special hands potential
  expectedNewPoints += sameSuitBonus;

  return expectedNewPoints;
}

/**
 * Calculate AI move for dealer (called internally)
 */
export function calculateDealerMove(dealerCards: PokDengCard[]): PokDengAIMove {
  const points = calculatePoints(dealerCards);
  const hand = evaluateHand(dealerCards);

  // Pok - stand
  if (hand.isPok) {
    return "stand";
  }

  // Standard dealer rules
  if (points >= 6) {
    return "stand";
  }
  if (points <= 4) {
    return "draw";
  }

  // 5 points - draw
  return "draw";
}
