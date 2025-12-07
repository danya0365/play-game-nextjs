"use client";

import { AIDifficulty } from "@/src/domain/types/ai";
import type {
  ConnectFourMark,
  ConnectFourState,
} from "@/src/domain/types/connectFourState";
import {
  COLS,
  ROWS,
  WIN_LENGTH,
  checkConnectFourWinner,
  getDropPosition,
  getValidColumns,
} from "@/src/domain/types/connectFourState";

/**
 * Calculate the best move for Connect Four AI
 * @param gameState - Current game state
 * @param difficulty - AI difficulty level
 * @returns Column index to drop piece (0-6)
 */
export function calculateConnectFourAIMove(
  gameState: ConnectFourState,
  difficulty: AIDifficulty
): number {
  const validCols = getValidColumns(gameState.board);

  if (validCols.length === 0) return -1;

  switch (difficulty) {
    case "easy":
      return easyMove(validCols);
    case "medium":
      return mediumMove(gameState, validCols);
    case "hard":
      return hardMove(gameState);
    default:
      return easyMove(validCols);
  }
}

/**
 * Easy AI - Random moves
 */
function easyMove(validCols: number[]): number {
  return validCols[Math.floor(Math.random() * validCols.length)];
}

/**
 * Medium AI - Basic strategy
 * 1. Win if possible
 * 2. Block opponent win
 * 3. Prefer center columns
 * 4. Random fallback
 */
function mediumMove(gameState: ConnectFourState, validCols: number[]): number {
  const { board, currentTurn, player1 } = gameState;
  const aiMark: ConnectFourMark = currentTurn === player1 ? "red" : "yellow";
  const opponentMark: ConnectFourMark = aiMark === "red" ? "yellow" : "red";

  // 1. Check if AI can win
  const winCol = findWinningColumn(board, aiMark);
  if (winCol !== -1 && validCols.includes(winCol)) return winCol;

  // 2. Block opponent from winning
  const blockCol = findWinningColumn(board, opponentMark);
  if (blockCol !== -1 && validCols.includes(blockCol)) return blockCol;

  // 3. Prefer center columns (3, 2, 4, 1, 5, 0, 6)
  const preferredOrder = [3, 2, 4, 1, 5, 0, 6];
  for (const col of preferredOrder) {
    if (validCols.includes(col)) return col;
  }

  // 4. Random fallback
  return easyMove(validCols);
}

/**
 * Hard AI - Minimax with alpha-beta pruning
 */
function hardMove(gameState: ConnectFourState): number {
  const { board, currentTurn, player1 } = gameState;
  const aiMark: ConnectFourMark = currentTurn === player1 ? "red" : "yellow";

  const result = minimax(
    board,
    aiMark,
    6, // depth
    -Infinity,
    Infinity,
    true
  );

  return result.column;
}

/**
 * Find a column that would win for the given mark
 */
function findWinningColumn(
  board: ConnectFourMark[],
  mark: ConnectFourMark
): number {
  const validCols = getValidColumns(board);

  for (const col of validCols) {
    const testBoard = [...board];
    const dropIndex = getDropPosition(testBoard, col);
    if (dropIndex !== -1) {
      testBoard[dropIndex] = mark;
      if (checkConnectFourWinner(testBoard)) {
        return col;
      }
    }
  }

  return -1;
}

/**
 * Minimax algorithm with alpha-beta pruning
 */
function minimax(
  board: ConnectFourMark[],
  aiMark: ConnectFourMark,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean
): { score: number; column: number } {
  const opponentMark: ConnectFourMark = aiMark === "red" ? "yellow" : "red";
  const validCols = getValidColumns(board);

  // Terminal conditions
  const winner = checkConnectFourWinner(board);
  if (winner) {
    const score = winner.winner === aiMark ? 10000 + depth : -10000 - depth;
    return { score, column: -1 };
  }

  if (validCols.length === 0) {
    return { score: 0, column: -1 }; // Draw
  }

  if (depth === 0) {
    return { score: evaluateBoard(board, aiMark), column: -1 };
  }

  // Minimax
  if (isMaximizing) {
    let maxScore = -Infinity;
    let bestCol = validCols[0];

    for (const col of validCols) {
      const newBoard = [...board];
      const dropIndex = getDropPosition(newBoard, col);
      newBoard[dropIndex] = aiMark;

      const result = minimax(newBoard, aiMark, depth - 1, alpha, beta, false);

      if (result.score > maxScore) {
        maxScore = result.score;
        bestCol = col;
      }

      alpha = Math.max(alpha, result.score);
      if (beta <= alpha) break; // Alpha-beta pruning
    }

    return { score: maxScore, column: bestCol };
  } else {
    let minScore = Infinity;
    let bestCol = validCols[0];

    for (const col of validCols) {
      const newBoard = [...board];
      const dropIndex = getDropPosition(newBoard, col);
      newBoard[dropIndex] = opponentMark;

      const result = minimax(newBoard, aiMark, depth - 1, alpha, beta, true);

      if (result.score < minScore) {
        minScore = result.score;
        bestCol = col;
      }

      beta = Math.min(beta, result.score);
      if (beta <= alpha) break; // Alpha-beta pruning
    }

    return { score: minScore, column: bestCol };
  }
}

/**
 * Evaluate board position for AI
 */
function evaluateBoard(
  board: ConnectFourMark[],
  aiMark: ConnectFourMark
): number {
  const opponentMark: ConnectFourMark = aiMark === "red" ? "yellow" : "red";
  let score = 0;

  // Score center column (most valuable)
  const centerCol = 3;
  for (let row = 0; row < ROWS; row++) {
    if (board[row * COLS + centerCol] === aiMark) {
      score += 3;
    }
  }

  // Score all possible lines of 4
  score += scoreAllLines(board, aiMark, opponentMark);

  return score;
}

/**
 * Score all possible lines of 4
 */
function scoreAllLines(
  board: ConnectFourMark[],
  aiMark: ConnectFourMark,
  opponentMark: ConnectFourMark
): number {
  let score = 0;

  // Horizontal
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col <= COLS - WIN_LENGTH; col++) {
      const window = [0, 1, 2, 3].map((i) => board[row * COLS + col + i]);
      score += evaluateWindow(window, aiMark, opponentMark);
    }
  }

  // Vertical
  for (let col = 0; col < COLS; col++) {
    for (let row = 0; row <= ROWS - WIN_LENGTH; row++) {
      const window = [0, 1, 2, 3].map((i) => board[(row + i) * COLS + col]);
      score += evaluateWindow(window, aiMark, opponentMark);
    }
  }

  // Diagonal (positive slope)
  for (let row = 0; row <= ROWS - WIN_LENGTH; row++) {
    for (let col = 0; col <= COLS - WIN_LENGTH; col++) {
      const window = [0, 1, 2, 3].map(
        (i) => board[(row + i) * COLS + (col + i)]
      );
      score += evaluateWindow(window, aiMark, opponentMark);
    }
  }

  // Diagonal (negative slope)
  for (let row = 0; row <= ROWS - WIN_LENGTH; row++) {
    for (let col = WIN_LENGTH - 1; col < COLS; col++) {
      const window = [0, 1, 2, 3].map(
        (i) => board[(row + i) * COLS + (col - i)]
      );
      score += evaluateWindow(window, aiMark, opponentMark);
    }
  }

  return score;
}

/**
 * Evaluate a window of 4 cells
 */
function evaluateWindow(
  window: ConnectFourMark[],
  aiMark: ConnectFourMark,
  opponentMark: ConnectFourMark
): number {
  const aiCount = window.filter((c) => c === aiMark).length;
  const opponentCount = window.filter((c) => c === opponentMark).length;
  const emptyCount = window.filter((c) => c === null).length;

  // Scoring
  if (aiCount === 4) return 100;
  if (aiCount === 3 && emptyCount === 1) return 5;
  if (aiCount === 2 && emptyCount === 2) return 2;

  if (opponentCount === 3 && emptyCount === 1) return -4; // Block threat

  return 0;
}
