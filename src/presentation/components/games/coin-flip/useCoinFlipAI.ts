"use client";

import type { AIDifficulty } from "@/src/domain/types/ai";
import type {
  CoinFlipState,
  CoinGuess,
} from "@/src/domain/types/coinFlipState";

/**
 * Calculate AI guess for Coin Flip
 * Note: Since coin flip is pure luck, all difficulties are essentially the same
 */
export function calculateCoinFlipAIMove(
  _gameState: CoinFlipState,
  _difficulty: AIDifficulty
): CoinGuess {
  // Pure 50/50 random - no strategy possible for coin flip
  return Math.random() < 0.5 ? "heads" : "tails";
}
