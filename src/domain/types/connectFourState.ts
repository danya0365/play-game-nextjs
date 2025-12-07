/**
 * Connect Four Game State Types
 * เกมเรียง 4 - หย่อนเหรียญลงคอลัมน์ เรียง 4 ชนะ!
 */

import type { BaseGameState, GamePlayer } from "./gameState";

// Board dimensions
export const COLS = 7;
export const ROWS = 6;
export const BOARD_SIZE = COLS * ROWS; // 42 cells
export const WIN_LENGTH = 4;

// Game-specific mark type
export type ConnectFourMark = "red" | "yellow" | null;

// Extend BaseGameState with Connect Four specific fields
export interface ConnectFourState extends BaseGameState {
  board: ConnectFourMark[]; // 42 cells (7x6), index = row * COLS + col
  player1: string; // Player ID (red)
  player2: string; // Player ID (yellow)
  winningCells: number[] | null;
  lastMove: number | null; // Last placed cell index
}

// Game-specific action
export interface ConnectFourAction {
  type: "drop_piece";
  playerId: string;
  timestamp: number;
  data: {
    column: number; // 0-6
  };
}

/**
 * Convert column to cell index (bottom-most empty cell)
 */
export function getDropPosition(
  board: ConnectFourMark[],
  column: number
): number {
  // Start from bottom row (row 5) and go up
  for (let row = ROWS - 1; row >= 0; row--) {
    const index = row * COLS + column;
    if (board[index] === null) {
      return index;
    }
  }
  return -1; // Column is full
}

/**
 * Check if column is valid for dropping
 */
export function isValidColumn(
  board: ConnectFourMark[],
  column: number
): boolean {
  if (column < 0 || column >= COLS) return false;
  // Check if top cell is empty
  return board[column] === null;
}

/**
 * Get all valid columns
 */
export function getValidColumns(board: ConnectFourMark[]): number[] {
  const validCols: number[] = [];
  for (let col = 0; col < COLS; col++) {
    if (isValidColumn(board, col)) {
      validCols.push(col);
    }
  }
  return validCols;
}

/**
 * Create initial Connect Four state
 */
export function createConnectFourState(
  roomId: string,
  players: GamePlayer[],
  aiPlayer?: GamePlayer | null
): ConnectFourState {
  // Add AI player if provided and needed
  const allPlayers =
    aiPlayer && players.length < 2 ? [...players, aiPlayer] : [...players];

  // Ensure minimum players
  if (allPlayers.length < 2) {
    throw new Error("Need at least 2 players to start Connect Four");
  }

  // Randomly assign player roles
  const shuffled = [...allPlayers].sort(() => Math.random() - 0.5);

  return {
    gameId: `cf_${Date.now()}`,
    roomId,
    status: "playing",
    currentTurn: shuffled[0].odId, // Red starts
    turnNumber: 1,
    winner: null,
    players: allPlayers,
    startedAt: Date.now(),
    lastActionAt: Date.now(),
    board: Array(BOARD_SIZE).fill(null),
    player1: shuffled[0].odId, // Red
    player2: shuffled[1].odId, // Yellow
    winningCells: null,
    lastMove: null,
  };
}

/**
 * Check for winner - returns winning line if found
 */
export function checkConnectFourWinner(
  board: ConnectFourMark[]
): { winner: ConnectFourMark; line: number[] } | null {
  // Helper to check a line
  const checkLine = (
    indices: number[]
  ): { winner: ConnectFourMark; line: number[] } | null => {
    const first = board[indices[0]];
    if (!first) return null;
    if (indices.every((i) => board[i] === first)) {
      return { winner: first, line: indices };
    }
    return null;
  };

  // Check horizontal lines
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col <= COLS - WIN_LENGTH; col++) {
      const indices = [0, 1, 2, 3].map((i) => row * COLS + col + i);
      const result = checkLine(indices);
      if (result) return result;
    }
  }

  // Check vertical lines
  for (let col = 0; col < COLS; col++) {
    for (let row = 0; row <= ROWS - WIN_LENGTH; row++) {
      const indices = [0, 1, 2, 3].map((i) => (row + i) * COLS + col);
      const result = checkLine(indices);
      if (result) return result;
    }
  }

  // Check diagonal (top-left to bottom-right)
  for (let row = 0; row <= ROWS - WIN_LENGTH; row++) {
    for (let col = 0; col <= COLS - WIN_LENGTH; col++) {
      const indices = [0, 1, 2, 3].map((i) => (row + i) * COLS + (col + i));
      const result = checkLine(indices);
      if (result) return result;
    }
  }

  // Check diagonal (top-right to bottom-left)
  for (let row = 0; row <= ROWS - WIN_LENGTH; row++) {
    for (let col = WIN_LENGTH - 1; col < COLS; col++) {
      const indices = [0, 1, 2, 3].map((i) => (row + i) * COLS + (col - i));
      const result = checkLine(indices);
      if (result) return result;
    }
  }

  return null;
}

/**
 * Check for draw (board full)
 */
export function checkConnectFourDraw(board: ConnectFourMark[]): boolean {
  return board.every((cell) => cell !== null);
}

/**
 * Apply action to state
 */
export function applyConnectFourAction(
  state: ConnectFourState,
  action: ConnectFourAction
): ConnectFourState {
  const { column } = action.data;
  const { board, player1, player2, currentTurn } = state;

  // Find drop position
  const cellIndex = getDropPosition(board, column);
  if (cellIndex === -1) {
    console.error("[ConnectFour] Column is full:", column);
    return state;
  }

  // Determine piece color
  const mark: ConnectFourMark = currentTurn === player1 ? "red" : "yellow";

  // Create new board
  const newBoard = [...board];
  newBoard[cellIndex] = mark;

  // Check for winner
  const winResult = checkConnectFourWinner(newBoard);

  // Check for draw
  const isDraw = !winResult && checkConnectFourDraw(newBoard);

  // Determine game status
  let status = state.status;
  let winner = state.winner;
  let winningCells = state.winningCells;

  if (winResult) {
    status = "finished";
    winner = winResult.winner === "red" ? player1 : player2;
    winningCells = winResult.line;
  } else if (isDraw) {
    status = "finished";
    winner = null; // Draw
  }

  // Return new state
  return {
    ...state,
    board: newBoard,
    currentTurn: currentTurn === player1 ? player2 : player1,
    turnNumber: state.turnNumber + 1,
    lastActionAt: Date.now(),
    winner,
    winningCells,
    status,
    lastMove: cellIndex,
  };
}

/**
 * Get cell position (row, col) from index
 */
export function getCellPosition(index: number): { row: number; col: number } {
  return {
    row: Math.floor(index / COLS),
    col: index % COLS,
  };
}

/**
 * Get index from position
 */
export function getIndexFromPosition(row: number, col: number): number {
  return row * COLS + col;
}
