/**
 * Rock Paper Scissors (เป่ายิ้งฉุบ) Game State Types
 */

import type { BaseGameState, GamePlayer } from "./gameState";

// Choice type
export type RPSChoice = "rock" | "paper" | "scissors" | null;

// Round result
export type RoundResult = "player1" | "player2" | "draw" | null;

// Single round
export interface RPSRound {
  roundNumber: number;
  player1Choice: RPSChoice;
  player2Choice: RPSChoice;
  result: RoundResult;
  completedAt: number | null;
}

// Game state
export interface RockPaperScissorsState extends BaseGameState {
  player1: string;
  player2: string;
  currentRound: number;
  maxRounds: number; // Best of 3, 5, etc.
  rounds: RPSRound[];
  player1Score: number;
  player2Score: number;
  // Current round choices (hidden until both choose)
  player1CurrentChoice: RPSChoice;
  player2CurrentChoice: RPSChoice;
  // Phase: choosing or revealing
  phase: "choosing" | "revealing" | "finished";
}

// Action type
export interface RockPaperScissorsAction {
  type: "make_choice";
  playerId: string;
  timestamp: number;
  data: {
    choice: RPSChoice;
  };
}

// Constants
export const MAX_ROUNDS = 3; // Best of 3

// Choice icons
export const CHOICE_ICONS: Record<string, string> = {
  rock: "🪨",
  paper: "📄",
  scissors: "✂️",
};

// Choice names in Thai
export const CHOICE_NAMES: Record<string, string> = {
  rock: "ค้อน",
  paper: "กระดาษ",
  scissors: "กรรไกร",
};

/**
 * Determine round winner
 */
export function determineRoundWinner(
  choice1: RPSChoice,
  choice2: RPSChoice
): RoundResult {
  if (!choice1 || !choice2) return null;
  if (choice1 === choice2) return "draw";

  const wins: Record<string, string> = {
    rock: "scissors",
    paper: "rock",
    scissors: "paper",
  };

  return wins[choice1] === choice2 ? "player1" : "player2";
}

/**
 * Create initial game state
 */
export function createRockPaperScissorsState(
  roomId: string,
  players: GamePlayer[],
  aiPlayer?: GamePlayer | null
): RockPaperScissorsState {
  // Add AI player if provided and needed
  const allPlayers =
    aiPlayer && players.length < 2 ? [...players, aiPlayer] : [...players];

  if (allPlayers.length < 2) {
    throw new Error("Need at least 2 players to start Rock Paper Scissors");
  }

  // Randomly assign player roles
  const shuffled = [...allPlayers].sort(() => Math.random() - 0.5);

  return {
    gameId: `rps_${Date.now()}`,
    roomId,
    status: "playing",
    currentTurn: shuffled[0].odId, // Both can choose at same time
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
    player1CurrentChoice: null,
    player2CurrentChoice: null,
    phase: "choosing",
  };
}

/**
 * Apply action to state
 */
export function applyRockPaperScissorsAction(
  state: RockPaperScissorsState,
  action: RockPaperScissorsAction
): RockPaperScissorsState {
  if (action.type !== "make_choice") return state;
  if (state.phase !== "choosing") return state;

  const { playerId, data } = action;
  const { choice } = data;

  // Determine which player made the choice
  const isPlayer1 = playerId === state.player1;
  const isPlayer2 = playerId === state.player2;

  if (!isPlayer1 && !isPlayer2) return state;

  // Update current choice
  let newState = { ...state };
  if (isPlayer1) {
    newState.player1CurrentChoice = choice;
  } else {
    newState.player2CurrentChoice = choice;
  }
  newState.lastActionAt = Date.now();

  // Check if both players have chosen
  if (newState.player1CurrentChoice && newState.player2CurrentChoice) {
    // Determine round result
    const roundResult = determineRoundWinner(
      newState.player1CurrentChoice,
      newState.player2CurrentChoice
    );

    // Create round record
    const round: RPSRound = {
      roundNumber: state.currentRound,
      player1Choice: newState.player1CurrentChoice,
      player2Choice: newState.player2CurrentChoice,
      result: roundResult,
      completedAt: Date.now(),
    };

    // Update scores
    let player1Score = state.player1Score;
    let player2Score = state.player2Score;

    if (roundResult === "player1") {
      player1Score++;
    } else if (roundResult === "player2") {
      player2Score++;
    }

    // Check if game is over (someone wins majority)
    const winsNeeded = Math.ceil(state.maxRounds / 2);
    let winner: string | null = null;
    let status: "playing" | "finished" = "playing";
    let phase: "choosing" | "revealing" | "finished" = "revealing";

    if (player1Score >= winsNeeded) {
      winner = state.player1;
      status = "finished";
      phase = "finished";
    } else if (player2Score >= winsNeeded) {
      winner = state.player2;
      status = "finished";
      phase = "finished";
    } else if (state.currentRound >= state.maxRounds) {
      // All rounds played, determine winner by score
      if (player1Score > player2Score) {
        winner = state.player1;
      } else if (player2Score > player1Score) {
        winner = state.player2;
      }
      // If tied, it's a draw (winner stays null)
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
export function startNextRound(
  state: RockPaperScissorsState
): RockPaperScissorsState {
  if (state.status === "finished") return state;

  return {
    ...state,
    currentRound: state.currentRound + 1,
    turnNumber: state.turnNumber + 1,
    player1CurrentChoice: null,
    player2CurrentChoice: null,
    phase: "choosing",
    lastActionAt: Date.now(),
  };
}
