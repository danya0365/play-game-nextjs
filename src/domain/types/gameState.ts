/**
 * Base Game State Types
 * Shared types for all games
 */

/**
 * Base game state that all games extend
 */
export interface BaseGameState {
  gameId: string;
  roomId: string;
  status: "waiting" | "playing" | "paused" | "finished";
  currentTurn: string; // Player ID
  turnNumber: number;
  winner: string | null;
  players: GamePlayer[];
  startedAt: number;
  lastActionAt: number;
}

/**
 * Player in a game
 */
export interface GamePlayer {
  odId: string;
  nickname: string;
  avatar: string;
  score: number;
  isActive: boolean;
  isAI?: boolean;
}

/**
 * Base game action
 */
export interface BaseGameAction<T = unknown> {
  type: string;
  playerId: string;
  timestamp: number;
  data: T;
}

/**
 * Game result
 */
export interface GameResult {
  winnerId: string | null;
  isDraw: boolean;
  scores: Record<string, number>;
  duration: number;
}

// ============================================
// Tic Tac Toe Types
// ============================================

export type TicTacToeMark = "X" | "O" | null;

export interface TicTacToeState extends BaseGameState {
  board: TicTacToeMark[]; // 9 cells, index 0-8
  playerX: string; // Player ID for X
  playerO: string; // Player ID for O
  winningLine: number[] | null; // Indexes of winning cells
}

export interface TicTacToeAction extends BaseGameAction<{ cellIndex: number }> {
  type: "place_mark";
}

/**
 * Create initial Tic Tac Toe state
 * @param roomId - Room ID
 * @param players - List of players (can include AI player)
 * @param aiPlayer - Optional AI player to add if not enough players
 */
export function createTicTacToeState(
  roomId: string,
  players: GamePlayer[],
  aiPlayer?: GamePlayer | null
): TicTacToeState {
  // Add AI player if provided and needed
  const allPlayers =
    aiPlayer && players.length < 2 ? [...players, aiPlayer] : [...players];

  // Ensure we have at least 2 players
  if (allPlayers.length < 2) {
    throw new Error("Need at least 2 players to start TicTacToe");
  }

  // Randomly assign X and O
  const shuffled = [...allPlayers].sort(() => Math.random() - 0.5);

  return {
    gameId: `ttt_${Date.now()}`,
    roomId,
    status: "playing",
    currentTurn: shuffled[0].odId, // X goes first
    turnNumber: 1,
    winner: null,
    players: allPlayers,
    startedAt: Date.now(),
    lastActionAt: Date.now(),
    board: Array(9).fill(null),
    playerX: shuffled[0].odId,
    playerO: shuffled[1].odId,
    winningLine: null,
  };
}

/**
 * Winning combinations for Tic Tac Toe
 */
export const TTT_WIN_LINES = [
  [0, 1, 2], // Top row
  [3, 4, 5], // Middle row
  [6, 7, 8], // Bottom row
  [0, 3, 6], // Left column
  [1, 4, 7], // Middle column
  [2, 5, 8], // Right column
  [0, 4, 8], // Diagonal
  [2, 4, 6], // Anti-diagonal
];

/**
 * Check for winner
 */
export function checkTicTacToeWinner(
  board: TicTacToeMark[]
): { winner: TicTacToeMark; line: number[] } | null {
  for (const line of TTT_WIN_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line };
    }
  }
  return null;
}

/**
 * Check for draw
 */
export function checkTicTacToeDraw(board: TicTacToeMark[]): boolean {
  return board.every((cell) => cell !== null);
}

/**
 * Apply action to Tic Tac Toe state
 */
export function applyTicTacToeAction(
  state: TicTacToeState,
  action: TicTacToeAction
): TicTacToeState {
  const { cellIndex } = action.data;
  const { playerId } = action;

  // Validate action
  if (state.status !== "playing") return state;
  if (state.currentTurn !== playerId) return state;
  if (state.board[cellIndex] !== null) return state;
  if (cellIndex < 0 || cellIndex > 8) return state;

  // Determine mark
  const mark: TicTacToeMark = playerId === state.playerX ? "X" : "O";

  // Update board
  const newBoard = [...state.board];
  newBoard[cellIndex] = mark;

  // Check for winner
  const winResult = checkTicTacToeWinner(newBoard);
  if (winResult) {
    const winnerId = winResult.winner === "X" ? state.playerX : state.playerO;
    return {
      ...state,
      board: newBoard,
      status: "finished",
      winner: winnerId,
      winningLine: winResult.line,
      lastActionAt: Date.now(),
      players: state.players.map((p) => ({
        ...p,
        score: p.odId === winnerId ? p.score + 1 : p.score,
      })),
    };
  }

  // Check for draw
  if (checkTicTacToeDraw(newBoard)) {
    return {
      ...state,
      board: newBoard,
      status: "finished",
      winner: null,
      lastActionAt: Date.now(),
    };
  }

  // Next turn
  const nextPlayer = playerId === state.playerX ? state.playerO : state.playerX;

  return {
    ...state,
    board: newBoard,
    currentTurn: nextPlayer,
    turnNumber: state.turnNumber + 1,
    lastActionAt: Date.now(),
  };
}
