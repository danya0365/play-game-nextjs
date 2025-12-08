"use client";

import { AIDifficulty } from "@/src/domain/types/ai";
import type { GomokuMark, GomokuState } from "@/src/domain/types/gomokuState";
import { BOARD_SIZE, toIndex, toRowCol } from "@/src/domain/types/gomokuState";

/**
 * Calculate the best move for Gomoku AI
 */
export function calculateGomokuAIMove(
  gameState: GomokuState,
  difficulty: AIDifficulty
): number {
  const { board, player1, player2, currentTurn } = gameState;

  // Get valid moves
  const validMoves = board
    .map((cell, index) => (cell === null ? index : -1))
    .filter((i) => i !== -1);

  if (validMoves.length === 0) return -1;

  // Determine AI's mark
  const aiMark: GomokuMark = currentTurn === player1 ? "black" : "white";
  const opponentMark: GomokuMark = aiMark === "black" ? "white" : "black";

  switch (difficulty) {
    case "easy":
      return easyMove(validMoves, board);
    case "medium":
      return mediumMove(validMoves, board, aiMark, opponentMark);
    case "hard":
      return hardMove(validMoves, board, aiMark, opponentMark);
    default:
      return easyMove(validMoves, board);
  }
}

/**
 * Easy AI - Random moves, but prefer center area
 */
function easyMove(validMoves: number[], board: GomokuMark[]): number {
  // First move - take center
  if (board.every((c) => c === null)) {
    return toIndex(Math.floor(BOARD_SIZE / 2), Math.floor(BOARD_SIZE / 2));
  }

  // Prefer moves near existing stones
  const nearMoves = validMoves.filter((move) => hasNeighbor(move, board));
  if (nearMoves.length > 0) {
    return nearMoves[Math.floor(Math.random() * nearMoves.length)];
  }

  return validMoves[Math.floor(Math.random() * validMoves.length)];
}

/**
 * Medium AI - Block opponent and try to win
 */
function mediumMove(
  validMoves: number[],
  board: GomokuMark[],
  aiMark: GomokuMark,
  opponentMark: GomokuMark
): number {
  // 1. Check if AI can win (4 in a row)
  const winMove = findWinningMove(board, aiMark, validMoves);
  if (winMove !== -1) return winMove;

  // 2. Block opponent from winning
  const blockMove = findWinningMove(board, opponentMark, validMoves);
  if (blockMove !== -1) return blockMove;

  // 3. Create threats (3 in a row)
  const threatMove = findThreatMove(board, aiMark, validMoves);
  if (threatMove !== -1) return threatMove;

  // 4. Take center or nearby
  return easyMove(validMoves, board);
}

/**
 * Hard AI - Advanced threat detection and scoring
 */
function hardMove(
  validMoves: number[],
  board: GomokuMark[],
  aiMark: GomokuMark,
  opponentMark: GomokuMark
): number {
  // 1. Check if AI can win
  const winMove = findWinningMove(board, aiMark, validMoves);
  if (winMove !== -1) return winMove;

  // 2. Block opponent from winning
  const blockMove = findWinningMove(board, opponentMark, validMoves);
  if (blockMove !== -1) return blockMove;

  // 3. Score all moves
  let bestMove = validMoves[0];
  let bestScore = -Infinity;

  for (const move of validMoves) {
    // Skip if not near any stone (optimization)
    if (!hasNeighbor(move, board) && board.some((c) => c !== null)) continue;

    const score = evaluateMove(board, move, aiMark, opponentMark);
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}

/**
 * Check if a cell has neighboring stones
 */
function hasNeighbor(index: number, board: GomokuMark[]): boolean {
  const { row, col } = toRowCol(index);
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = row + dr;
      const nc = col + dc;
      if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
        if (board[toIndex(nr, nc)] !== null) return true;
      }
    }
  }
  return false;
}

/**
 * Find a move that wins immediately
 */
function findWinningMove(
  board: GomokuMark[],
  mark: GomokuMark,
  validMoves: number[]
): number {
  for (const move of validMoves) {
    if (countLine(board, move, mark) >= 4) {
      return move;
    }
  }
  return -1;
}

/**
 * Find a move that creates 3 in a row
 */
function findThreatMove(
  board: GomokuMark[],
  mark: GomokuMark,
  validMoves: number[]
): number {
  const threats = validMoves.filter(
    (move) => countLine(board, move, mark) >= 3
  );
  if (threats.length > 0) {
    return threats[Math.floor(Math.random() * threats.length)];
  }
  return -1;
}

/**
 * Count max line length if placing at index
 */
function countLine(
  board: GomokuMark[],
  index: number,
  mark: GomokuMark
): number {
  const { row, col } = toRowCol(index);
  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ];

  let maxLen = 0;

  for (const [dr, dc] of directions) {
    let len = 1; // Count this cell

    // Positive direction
    let r = row + dr;
    let c = col + dc;
    while (
      r >= 0 &&
      r < BOARD_SIZE &&
      c >= 0 &&
      c < BOARD_SIZE &&
      board[toIndex(r, c)] === mark
    ) {
      len++;
      r += dr;
      c += dc;
    }

    // Negative direction
    r = row - dr;
    c = col - dc;
    while (
      r >= 0 &&
      r < BOARD_SIZE &&
      c >= 0 &&
      c < BOARD_SIZE &&
      board[toIndex(r, c)] === mark
    ) {
      len++;
      r -= dr;
      c -= dc;
    }

    maxLen = Math.max(maxLen, len);
  }

  return maxLen;
}

/**
 * Evaluate a move's score
 */
function evaluateMove(
  board: GomokuMark[],
  index: number,
  aiMark: GomokuMark,
  opponentMark: GomokuMark
): number {
  // Score based on line potential
  const aiScore = countLine(board, index, aiMark);
  const blockScore = countLine(board, index, opponentMark);

  // Prioritize winning, then blocking, then building
  return aiScore * 10 + blockScore * 5;
}
