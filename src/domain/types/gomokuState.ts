/**
 * Gomoku (Five in a Row) Game State Types
 * โกะโมะกุ / ห้าเรียง
 */

import type { BaseGameState, GamePlayer } from "./gameState";

// Player mark type
export type GomokuMark = "black" | "white" | null;

// Board size (15x15 is standard)
export const BOARD_SIZE = 15;
export const WIN_LENGTH = 5;

// Game state
export interface GomokuState extends BaseGameState {
  // Board state (15x15 = 225 cells)
  board: GomokuMark[];
  // Player assignments
  player1: string; // Black (goes first)
  player2: string; // White
  // Winning cells
  winningCells: number[] | null;
  // Last move index
  lastMove: number | null;
}

// Game action
export interface GomokuAction {
  type: "place_stone";
  playerId: string;
  timestamp: number;
  data: {
    cellIndex: number;
  };
}

/**
 * Convert row,col to index
 */
export function toIndex(row: number, col: number): number {
  return row * BOARD_SIZE + col;
}

/**
 * Convert index to row,col
 */
export function toRowCol(index: number): { row: number; col: number } {
  return {
    row: Math.floor(index / BOARD_SIZE),
    col: index % BOARD_SIZE,
  };
}

/**
 * Create initial game state
 */
export function createGomokuState(
  roomId: string,
  players: GamePlayer[],
  aiPlayer?: GamePlayer | null
): GomokuState {
  const allPlayers =
    aiPlayer && players.length < 2 ? [...players, aiPlayer] : [...players];

  if (allPlayers.length < 2) {
    throw new Error("Need at least 2 players to start Gomoku");
  }

  // Randomly assign colors
  const shuffled = [...allPlayers].sort(() => Math.random() - 0.5);

  return {
    gameId: `gomoku_${Date.now()}`,
    roomId,
    status: "playing",
    currentTurn: shuffled[0].odId, // Black goes first
    turnNumber: 1,
    winner: null,
    players: allPlayers,
    startedAt: Date.now(),
    lastActionAt: Date.now(),
    // Game specific
    board: Array(BOARD_SIZE * BOARD_SIZE).fill(null),
    player1: shuffled[0].odId, // Black
    player2: shuffled[1].odId, // White
    winningCells: null,
    lastMove: null,
  };
}

/**
 * Check for winner - find 5 in a row
 */
export function checkGomokuWinner(
  board: GomokuMark[],
  lastMoveIndex: number
): { winner: GomokuMark; line: number[] } | null {
  if (lastMoveIndex < 0) return null;

  const { row, col } = toRowCol(lastMoveIndex);
  const mark = board[lastMoveIndex];
  if (!mark) return null;

  // Directions: horizontal, vertical, diagonal down-right, diagonal down-left
  const directions = [
    [0, 1], // horizontal
    [1, 0], // vertical
    [1, 1], // diagonal \
    [1, -1], // diagonal /
  ];

  for (const [dr, dc] of directions) {
    const line: number[] = [lastMoveIndex];

    // Count in positive direction
    let r = row + dr;
    let c = col + dc;
    while (
      r >= 0 &&
      r < BOARD_SIZE &&
      c >= 0 &&
      c < BOARD_SIZE &&
      board[toIndex(r, c)] === mark
    ) {
      line.push(toIndex(r, c));
      r += dr;
      c += dc;
    }

    // Count in negative direction
    r = row - dr;
    c = col - dc;
    while (
      r >= 0 &&
      r < BOARD_SIZE &&
      c >= 0 &&
      c < BOARD_SIZE &&
      board[toIndex(r, c)] === mark
    ) {
      line.push(toIndex(r, c));
      r -= dr;
      c -= dc;
    }

    if (line.length >= WIN_LENGTH) {
      return { winner: mark, line: line.slice(0, WIN_LENGTH) };
    }
  }

  return null;
}

/**
 * Check if board is full (draw)
 */
export function isBoardFull(board: GomokuMark[]): boolean {
  return board.every((cell) => cell !== null);
}

/**
 * Apply action to state
 */
export function applyGomokuAction(
  state: GomokuState,
  action: GomokuAction
): GomokuState {
  if (action.type !== "place_stone") return state;
  if (state.status !== "playing") return state;
  if (action.playerId !== state.currentTurn) return state;

  const { cellIndex } = action.data;

  // Validate move
  if (cellIndex < 0 || cellIndex >= state.board.length) return state;
  if (state.board[cellIndex] !== null) return state;

  // Determine mark color
  const mark: GomokuMark =
    action.playerId === state.player1 ? "black" : "white";

  // Apply move
  const newBoard = [...state.board];
  newBoard[cellIndex] = mark;

  // Check for winner
  const winResult = checkGomokuWinner(newBoard, cellIndex);

  // Check for draw
  const isDraw = !winResult && isBoardFull(newBoard);

  // Next turn
  const nextTurn =
    state.currentTurn === state.player1 ? state.player2 : state.player1;

  return {
    ...state,
    board: newBoard,
    currentTurn: winResult || isDraw ? state.currentTurn : nextTurn,
    turnNumber: state.turnNumber + 1,
    lastActionAt: Date.now(),
    lastMove: cellIndex,
    winner: winResult
      ? winResult.winner === "black"
        ? state.player1
        : state.player2
      : isDraw
      ? "draw"
      : null,
    winningCells: winResult?.line ?? null,
    status: winResult || isDraw ? "finished" : "playing",
  };
}
