"use client";

import type { AIDifficulty } from "@/src/domain/types/ai";
import type {
  RockPaperScissorsState,
  RPSChoice,
} from "@/src/domain/types/rockPaperScissorsState";

const CHOICES: RPSChoice[] = ["rock", "paper", "scissors"];

/**
 * Calculate AI choice for Rock Paper Scissors
 */
export function calculateRPSAIMove(
  gameState: RockPaperScissorsState,
  difficulty: AIDifficulty
): RPSChoice {
  switch (difficulty) {
    case "easy":
      return easyMove();
    case "medium":
      return mediumMove(gameState);
    case "hard":
      return hardMove(gameState);
    default:
      return easyMove();
  }
}

/**
 * Easy AI - Pure random
 */
function easyMove(): RPSChoice {
  return CHOICES[Math.floor(Math.random() * CHOICES.length)];
}

/**
 * Medium AI - Slightly smarter, considers patterns
 */
function mediumMove(state: RockPaperScissorsState): RPSChoice {
  const { rounds, player1 } = state;

  // If no history, random
  if (rounds.length === 0) {
    return easyMove();
  }

  // 50% chance to use pattern recognition
  if (Math.random() < 0.5) {
    return easyMove();
  }

  // Get opponent's last choice
  const lastRound = rounds[rounds.length - 1];
  const opponentLastChoice =
    state.player1 === player1
      ? lastRound.player2Choice
      : lastRound.player1Choice;

  if (!opponentLastChoice) return easyMove();

  // Counter the opponent's last choice
  const counter: Record<string, RPSChoice> = {
    rock: "paper",
    paper: "scissors",
    scissors: "rock",
  };

  return counter[opponentLastChoice] ?? easyMove();
}

/**
 * Hard AI - Pattern analysis + prediction
 */
function hardMove(state: RockPaperScissorsState): RPSChoice {
  const { rounds, player1 } = state;

  // If no history, use weighted random (rock is most common first choice)
  if (rounds.length === 0) {
    const weights = { rock: 0.4, paper: 0.35, scissors: 0.25 };
    const random = Math.random();
    if (random < weights.rock) return "paper"; // Counter rock
    if (random < weights.rock + weights.paper) return "scissors"; // Counter paper
    return "rock"; // Counter scissors
  }

  // Analyze opponent's patterns
  const opponentChoices = rounds.map((r) =>
    state.player1 === player1 ? r.player2Choice : r.player1Choice
  );

  // Count frequencies
  const frequency: Record<string, number> = { rock: 0, paper: 0, scissors: 0 };
  opponentChoices.forEach((choice) => {
    if (choice) frequency[choice]++;
  });

  // Find most common choice
  let mostCommon: RPSChoice = "rock";
  let maxCount = 0;
  Object.entries(frequency).forEach(([choice, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostCommon = choice as RPSChoice;
    }
  });

  // 70% chance to counter most common, 30% random for unpredictability
  if (Math.random() < 0.7) {
    const counter: Record<string, RPSChoice> = {
      rock: "paper",
      paper: "scissors",
      scissors: "rock",
    };
    return counter[mostCommon!] ?? easyMove();
  }

  return easyMove();
}
