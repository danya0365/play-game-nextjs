"use client";

import type { AIDifficulty } from "@/src/domain/types/ai";
import type {
  DiceRollState,
  DiceValue,
} from "@/src/domain/types/diceRollState";
import { rollDice } from "@/src/domain/types/diceRollState";

/**
 * Calculate AI roll for Dice Roll
 * Note: Since dice roll is pure luck, all difficulties are essentially the same
 */
export function calculateDiceRollAIMove(
  _gameState: DiceRollState,
  _difficulty: AIDifficulty
): DiceValue {
  // Pure random - no strategy possible for dice
  return rollDice();
}
