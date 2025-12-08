/**
 * Coin Flip (โยนเหรียญ) Game State Types
 */

import type { BaseGameState, GamePlayer } from "./gameState";

// Coin side
export type CoinSide = "heads" | "tails";

// Player guess
export type CoinGuess = CoinSide | null;

// Round result
export interface CoinFlipRound {
  roundNumber: number;
  result: CoinSide; // Actual coin flip result
  player1Guess: CoinGuess;
  player2Guess: CoinGuess;
  player1Correct: boolean;
  player2Correct: boolean;
  completedAt: number;
}

// Game state
export interface CoinFlipState extends BaseGameState {
  player1: string;
  player2: string;
  currentRound: number;
  maxRounds: number;
  rounds: CoinFlipRound[];
  player1Score: number;
  player2Score: number;
  // Current round guesses
  player1CurrentGuess: CoinGuess;
  player2CurrentGuess: CoinGuess;
  // Phase
  phase: "guessing" | "flipping" | "revealing" | "finished";
  // Current flip result (shown after both guess)
  currentFlipResult: CoinSide | null;
}

// Action type
export interface CoinFlipAction {
  type: "make_guess";
  playerId: string;
  timestamp: number;
  data: {
    guess: CoinGuess;
  };
}

// Constants
export const MAX_ROUNDS = 5;

// Icons
export const COIN_ICONS: Record<CoinSide, string> = {
  heads: "🪙",
  tails: "⭐",
};

export const COIN_NAMES: Record<CoinSide, string> = {
  heads: "หัว",
  tails: "ก้อย",
};

/**
 * Flip coin - random heads or tails
 */
export function flipCoin(): CoinSide {
  return Math.random() < 0.5 ? "heads" : "tails";
}

/**
 * Create initial game state
 */
export function createCoinFlipState(
  roomId: string,
  players: GamePlayer[],
  aiPlayer?: GamePlayer | null
): CoinFlipState {
  const allPlayers =
    aiPlayer && players.length < 2 ? [...players, aiPlayer] : [...players];

  if (allPlayers.length < 2) {
    throw new Error("Need at least 2 players to start Coin Flip");
  }

  const shuffled = [...allPlayers].sort(() => Math.random() - 0.5);

  return {
    gameId: `cf_${Date.now()}`,
    roomId,
    status: "playing",
    currentTurn: shuffled[0].odId,
    turnNumber: 1,
    winner: null,
    players: allPlayers,
    startedAt: Date.now(),
    lastActionAt: Date.now(),
    player1: shuffled[0].odId,
    player2: shuffled[1].odId,
    currentRound: 1,
    maxRounds: MAX_ROUNDS,
    rounds: [],
    player1Score: 0,
    player2Score: 0,
    player1CurrentGuess: null,
    player2CurrentGuess: null,
    phase: "guessing",
    currentFlipResult: null,
  };
}

/**
 * Apply action to state
 */
export function applyCoinFlipAction(
  state: CoinFlipState,
  action: CoinFlipAction
): CoinFlipState {
  if (action.type !== "make_guess") return state;
  if (state.phase !== "guessing") return state;

  const { playerId, data } = action;
  const { guess } = data;

  const isPlayer1 = playerId === state.player1;
  const isPlayer2 = playerId === state.player2;

  if (!isPlayer1 && !isPlayer2) return state;

  let newState = { ...state };

  if (isPlayer1) {
    newState.player1CurrentGuess = guess;
  } else {
    newState.player2CurrentGuess = guess;
  }
  newState.lastActionAt = Date.now();

  // Check if both players have guessed
  if (newState.player1CurrentGuess && newState.player2CurrentGuess) {
    // Flip the coin
    const flipResult = flipCoin();
    newState.currentFlipResult = flipResult;
    newState.phase = "flipping";

    // Determine who was correct
    const player1Correct = newState.player1CurrentGuess === flipResult;
    const player2Correct = newState.player2CurrentGuess === flipResult;

    // Create round record
    const round: CoinFlipRound = {
      roundNumber: state.currentRound,
      result: flipResult,
      player1Guess: newState.player1CurrentGuess,
      player2Guess: newState.player2CurrentGuess,
      player1Correct,
      player2Correct,
      completedAt: Date.now(),
    };

    // Update scores
    const player1Score = state.player1Score + (player1Correct ? 1 : 0);
    const player2Score = state.player2Score + (player2Correct ? 1 : 0);

    // Check if game is over
    const winsNeeded = Math.ceil(state.maxRounds / 2) + 1; // More than half
    let winner: string | null = null;
    let status: "playing" | "finished" = "playing";
    let phase: CoinFlipState["phase"] = "revealing";

    if (player1Score >= winsNeeded) {
      winner = state.player1;
      status = "finished";
      phase = "finished";
    } else if (player2Score >= winsNeeded) {
      winner = state.player2;
      status = "finished";
      phase = "finished";
    } else if (state.currentRound >= state.maxRounds) {
      // All rounds played
      if (player1Score > player2Score) {
        winner = state.player1;
      } else if (player2Score > player1Score) {
        winner = state.player2;
      }
      status = "finished";
      phase = "finished";
    }

    newState = {
      ...newState,
      rounds: [...state.rounds, round],
      player1Score,
      player2Score,
      phase,
      winner,
      status,
    };
  }

  return newState;
}

/**
 * Start next round
 */
export function startNextRound(state: CoinFlipState): CoinFlipState {
  if (state.status === "finished") return state;

  return {
    ...state,
    currentRound: state.currentRound + 1,
    turnNumber: state.turnNumber + 1,
    player1CurrentGuess: null,
    player2CurrentGuess: null,
    currentFlipResult: null,
    phase: "guessing",
    lastActionAt: Date.now(),
  };
}
