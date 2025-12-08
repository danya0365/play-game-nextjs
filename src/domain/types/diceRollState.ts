/**
 * Dice Roll (โยนลูกเต๋า) Game State Types
 */

import type { BaseGameState, GamePlayer } from "./gameState";

// Dice value (1-6)
export type DiceValue = 1 | 2 | 3 | 4 | 5 | 6 | null;

// Round result
export interface DiceRollRound {
  roundNumber: number;
  player1Roll: DiceValue;
  player2Roll: DiceValue;
  winner: "player1" | "player2" | "tie";
  completedAt: number;
}

// Game state
export interface DiceRollState extends BaseGameState {
  player1: string;
  player2: string;
  currentRound: number;
  maxRounds: number;
  rounds: DiceRollRound[];
  player1Score: number;
  player2Score: number;
  // Current round rolls
  player1CurrentRoll: DiceValue;
  player2CurrentRoll: DiceValue;
  // Has rolled this round
  player1HasRolled: boolean;
  player2HasRolled: boolean;
  // Phase
  phase: "rolling" | "revealing" | "finished";
}

// Action type
export interface DiceRollAction {
  type: "roll_dice";
  playerId: string;
  timestamp: number;
  data: {
    value: DiceValue;
  };
}

// Constants
export const MAX_ROUNDS = 5;

// Dice face icons
export const DICE_ICONS: Record<number, string> = {
  1: "⚀",
  2: "⚁",
  3: "⚂",
  4: "⚃",
  5: "⚄",
  6: "⚅",
};

/**
 * Roll a dice - random 1-6
 */
export function rollDice(): DiceValue {
  return (Math.floor(Math.random() * 6) + 1) as DiceValue;
}

/**
 * Create initial game state
 */
export function createDiceRollState(
  roomId: string,
  players: GamePlayer[],
  aiPlayer?: GamePlayer | null
): DiceRollState {
  const allPlayers =
    aiPlayer && players.length < 2 ? [...players, aiPlayer] : [...players];

  if (allPlayers.length < 2) {
    throw new Error("Need at least 2 players to start Dice Roll");
  }

  const shuffled = [...allPlayers].sort(() => Math.random() - 0.5);

  return {
    gameId: `dr_${Date.now()}`,
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
    player1CurrentRoll: null,
    player2CurrentRoll: null,
    player1HasRolled: false,
    player2HasRolled: false,
    phase: "rolling",
  };
}

/**
 * Apply action to state
 */
export function applyDiceRollAction(
  state: DiceRollState,
  action: DiceRollAction
): DiceRollState {
  if (action.type !== "roll_dice") return state;
  if (state.phase !== "rolling") return state;

  const { playerId, data } = action;
  const { value } = data;

  const isPlayer1 = playerId === state.player1;
  const isPlayer2 = playerId === state.player2;

  if (!isPlayer1 && !isPlayer2) return state;

  let newState = { ...state };

  if (isPlayer1 && !state.player1HasRolled) {
    newState.player1CurrentRoll = value;
    newState.player1HasRolled = true;
  } else if (isPlayer2 && !state.player2HasRolled) {
    newState.player2CurrentRoll = value;
    newState.player2HasRolled = true;
  } else {
    return state; // Already rolled
  }

  newState.lastActionAt = Date.now();

  // Check if both players have rolled
  if (newState.player1HasRolled && newState.player2HasRolled) {
    newState.phase = "revealing";

    const p1Roll = newState.player1CurrentRoll!;
    const p2Roll = newState.player2CurrentRoll!;

    // Determine round winner
    let roundWinner: "player1" | "player2" | "tie";
    if (p1Roll > p2Roll) {
      roundWinner = "player1";
    } else if (p2Roll > p1Roll) {
      roundWinner = "player2";
    } else {
      roundWinner = "tie";
    }

    // Create round record
    const round: DiceRollRound = {
      roundNumber: state.currentRound,
      player1Roll: p1Roll,
      player2Roll: p2Roll,
      winner: roundWinner,
      completedAt: Date.now(),
    };

    // Update scores
    const player1Score =
      state.player1Score + (roundWinner === "player1" ? 1 : 0);
    const player2Score =
      state.player2Score + (roundWinner === "player2" ? 1 : 0);

    // Check if game is over
    const winsNeeded = Math.ceil(state.maxRounds / 2) + 1;
    let winner: string | null = null;
    let status: "playing" | "finished" = "playing";
    let phase: DiceRollState["phase"] = "revealing";

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
export function startNextRound(state: DiceRollState): DiceRollState {
  if (state.status === "finished") return state;

  return {
    ...state,
    currentRound: state.currentRound + 1,
    turnNumber: state.turnNumber + 1,
    player1CurrentRoll: null,
    player2CurrentRoll: null,
    player1HasRolled: false,
    player2HasRolled: false,
    phase: "rolling",
    lastActionAt: Date.now(),
  };
}
