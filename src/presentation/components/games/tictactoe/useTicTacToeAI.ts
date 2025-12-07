"use client";

import { AIDifficulty } from "@/src/domain/types/ai";
import type { TicTacToeState } from "@/src/domain/types/gameState";

/**
 * Calculate the best move for TicTacToe AI
 */
export function calculateTicTacToeAIMove(
  gameState: TicTacToeState,
  difficulty: AIDifficulty
): number {
  const { board } = gameState;
  const emptyIndices = board
    .map((cell, index) => (cell === null ? index : -1))
    .filter((i) => i !== -1);

  if (emptyIndices.length === 0) return -1;

  switch (difficulty) {
    case "easy":
      return easyMove(emptyIndices);
    case "medium":
      return mediumMove(board, emptyIndices, gameState);
    case "hard":
      return hardMove(board, gameState);
    default:
      return easyMove(emptyIndices);
  }
}

/**
 * Easy AI - Random moves
 */
function easyMove(emptyIndices: number[]): number {
  return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
}

/**
 * Medium AI - Block wins and take wins, otherwise random
 */
function mediumMove(
  board: (string | null)[],
  emptyIndices: number[],
  gameState: TicTacToeState
): number {
  const aiMark = gameState.playerX === gameState.currentTurn ? "X" : "O";
  const playerMark = aiMark === "X" ? "O" : "X";

  // Check if AI can win
  const winMove = findWinningMove(board, aiMark);
  if (winMove !== -1) return winMove;

  // Block player from winning
  const blockMove = findWinningMove(board, playerMark);
  if (blockMove !== -1) return blockMove;

  // Take center if available
  if (board[4] === null) return 4;

  // Random
  return easyMove(emptyIndices);
}

/**
 * Hard AI - Minimax algorithm (unbeatable)
 */
function hardMove(board: (string | null)[], gameState: TicTacToeState): number {
  const aiMark = gameState.playerX === gameState.currentTurn ? "X" : "O";
  const playerMark = aiMark === "X" ? "O" : "X";

  let bestScore = -Infinity;
  let bestMove = -1;

  for (let i = 0; i < 9; i++) {
    if (board[i] === null) {
      const newBoard = [...board];
      newBoard[i] = aiMark;
      const score = minimax(newBoard, 0, false, aiMark, playerMark);
      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }
  }

  return bestMove;
}

/**
 * Minimax algorithm
 */
function minimax(
  board: (string | null)[],
  depth: number,
  isMaximizing: boolean,
  aiMark: string,
  playerMark: string
): number {
  const winner = checkWinner(board);

  if (winner === aiMark) return 10 - depth;
  if (winner === playerMark) return depth - 10;
  if (board.every((cell) => cell !== null)) return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        const newBoard = [...board];
        newBoard[i] = aiMark;
        const score = minimax(newBoard, depth + 1, false, aiMark, playerMark);
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        const newBoard = [...board];
        newBoard[i] = playerMark;
        const score = minimax(newBoard, depth + 1, true, aiMark, playerMark);
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
}

/**
 * Find a winning move for the given mark
 */
function findWinningMove(board: (string | null)[], mark: string): number {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], // rows
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // cols
    [0, 4, 8],
    [2, 4, 6], // diagonals
  ];

  for (const [a, b, c] of lines) {
    const cells = [board[a], board[b], board[c]];
    const markCount = cells.filter((cell) => cell === mark).length;
    const emptyCount = cells.filter((cell) => cell === null).length;

    if (markCount === 2 && emptyCount === 1) {
      if (board[a] === null) return a;
      if (board[b] === null) return b;
      if (board[c] === null) return c;
    }
  }

  return -1;
}

/**
 * Check for winner
 */
function checkWinner(board: (string | null)[]): string | null {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }

  return null;
}
