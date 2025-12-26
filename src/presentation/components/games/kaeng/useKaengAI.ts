"use client";

import { AIDifficulty } from "@/src/domain/types/ai";
import type { KaengState } from "@/src/domain/types/kaengState";
import {
  evaluateHand,
  getHandTypePriority,
} from "@/src/domain/types/kaengState";

/**
 * Calculate the best action for Kaeng AI
 * @param gameState - Current game state
 * @param difficulty - AI difficulty level
 * @returns Action type: "reveal" or "fold"
 */
export function calculateKaengAIMove(
  gameState: KaengState,
  difficulty: AIDifficulty
): "reveal" | "fold" {
  // Find AI's hand
  const aiHand = gameState.playerHands.find(
    (h) => h.playerId === gameState.currentTurn
  );

  if (!aiHand || aiHand.cards.length === 0) {
    return "reveal"; // Default to reveal if no hand found
  }

  const handEval = evaluateHand(aiHand.cards);

  switch (difficulty) {
    case "easy":
      return easyStrategy(handEval);
    case "medium":
      return mediumStrategy(handEval);
    case "hard":
      return hardStrategy(handEval, gameState);
    default:
      return "reveal";
  }
}

/**
 * Easy AI - Always reveals (never strategic)
 */
function easyStrategy(
  _handEval: ReturnType<typeof evaluateHand>
): "reveal" | "fold" {
  // Easy AI always reveals, regardless of hand strength
  return "reveal";
}

/**
 * Medium AI - Basic strategy based on hand strength
 */
function mediumStrategy(
  handEval: ReturnType<typeof evaluateHand>
): "reveal" | "fold" {
  const priority = getHandTypePriority(handEval.handType);

  // Fold if hand is very weak (normal with low points)
  if (handEval.handType === "normal" && handEval.points <= 3) {
    // 30% chance to fold with weak hand
    return Math.random() < 0.3 ? "fold" : "reveal";
  }

  // Always reveal if has special hand
  if (priority >= 50) {
    return "reveal";
  }

  // Reveal most of the time for normal hands
  return "reveal";
}

/**
 * Hard AI - Strategic play based on hand evaluation and game state
 */
function hardStrategy(
  handEval: ReturnType<typeof evaluateHand>,
  gameState: KaengState
): "reveal" | "fold" {
  const priority = getHandTypePriority(handEval.handType);

  // Always reveal if hand is strong
  if (priority >= 60) {
    return "reveal";
  }

  // For Kaeng (same suit), almost always reveal
  if (handEval.handType === "kaeng") {
    return "reveal";
  }

  // For song kaeng or better, reveal
  if (priority >= 50) {
    return "reveal";
  }

  // For normal hands, consider folding only if very weak
  if (handEval.handType === "normal") {
    // Fold with very weak hand (0-2 points) with some probability
    if (handEval.points <= 2) {
      return Math.random() < 0.4 ? "fold" : "reveal";
    }
    // Weak hand (3-4 points)
    if (handEval.points <= 4) {
      return Math.random() < 0.2 ? "fold" : "reveal";
    }
  }

  return "reveal";
}

/**
 * Estimate hand strength as a percentage
 */
export function estimateHandStrength(
  handEval: ReturnType<typeof evaluateHand>
): number {
  const priority = getHandTypePriority(handEval.handType);

  // Special hands
  if (priority >= 100) return 100; // Tong
  if (priority >= 90) return 95; // Kaeng Sam Lo
  if (priority >= 80) return 85; // Kaeng
  if (priority >= 70) return 80; // Sam Lo
  if (priority >= 60) return 70; // Riang
  if (priority >= 50) return 60; // Song Kaeng

  // Normal hands - based on points
  return 10 + handEval.points * 5; // 10-55%
}
