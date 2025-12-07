"use client";

import type {
  ConnectFourAction,
  ConnectFourState,
} from "@/src/domain/types/connectFourState";
import {
  applyConnectFourAction,
  createConnectFourState,
} from "@/src/domain/types/connectFourState";
import type {
  GamePlayer,
  TicTacToeAction,
  TicTacToeState,
} from "@/src/domain/types/gameState";
import {
  applyTicTacToeAction,
  createTicTacToeState,
} from "@/src/domain/types/gameState";
import type { P2PMessage } from "@/src/domain/types/room";
import { peerManager } from "@/src/infrastructure/p2p/peerManager";
import { create } from "zustand";
import { useAIStore } from "./aiStore";
import { useRoomStore } from "./roomStore";
import { useUserStore } from "./userStore";

// Union type for all game states
type AnyGameState = TicTacToeState | ConnectFourState;

/**
 * Game Store State
 */
interface GameState {
  // Game state
  gameState: AnyGameState | null;
  isPlaying: boolean;

  // UI state
  selectedCell: number | null;
  showResult: boolean;
}

/**
 * Game Store Actions
 */
interface GameActions {
  // Game lifecycle
  initGame: () => void;
  endGame: () => void;
  resetGame: () => void;
  clearGame: () => void; // Reset to initial state

  // Actions - TicTacToe
  placeMark: (cellIndex: number, forPlayerId?: string) => void;
  selectCell: (cellIndex: number | null) => void;

  // Actions - Connect Four
  dropPiece: (column: number, forPlayerId?: string) => void;

  // P2P handlers
  handleGameMessage: (message: P2PMessage) => void;

  // State updates
  setGameState: (state: AnyGameState) => void;
  setShowResult: (show: boolean) => void;
}

type GameStore = GameState & GameActions;

const initialState: GameState = {
  gameState: null,
  isPlaying: false,
  selectedCell: null,
  showResult: false,
};

/**
 * Game Store
 */
export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  /**
   * Initialize game based on room.gameSlug
   */
  initGame: () => {
    const room = useRoomStore.getState().room;
    if (!room) return;

    // Get AI state
    const { enabled: isAIEnabled, aiPlayer } = useAIStore.getState();

    // Convert room players to game players
    const gamePlayers: GamePlayer[] = room.players.map((p) => ({
      odId: p.odId,
      nickname: p.nickname,
      avatar: p.avatar,
      score: 0,
      isActive: false,
      isAI: false,
    }));

    // Create AI game player if enabled
    const aiGamePlayer: GamePlayer | null =
      isAIEnabled && aiPlayer
        ? {
            odId: aiPlayer.id,
            nickname: aiPlayer.nickname,
            avatar: aiPlayer.avatar,
            score: 0,
            isActive: false,
            isAI: true,
          }
        : null;

    // Create initial state based on game type
    let state: AnyGameState;

    switch (room.gameSlug) {
      case "connect-four":
        state = createConnectFourState(room.id, gamePlayers, aiGamePlayer);
        break;
      case "tic-tac-toe":
      default:
        state = createTicTacToeState(room.id, gamePlayers, aiGamePlayer);
        break;
    }

    // Mark current turn player as active
    state.players = state.players.map((p) => ({
      ...p,
      isActive: p.odId === state.currentTurn,
    }));

    set({ gameState: state, isPlaying: true, showResult: false });

    // If host, broadcast initial state
    const isHost = useRoomStore.getState().isHost;
    if (isHost) {
      peerManager.broadcast("game_state", { state });
    }

    // Register message handler
    peerManager.onMessage("game_state", get().handleGameMessage);
    peerManager.onMessage("game_action", get().handleGameMessage);
  },

  /**
   * End game
   */
  endGame: () => {
    set({ isPlaying: false, showResult: true });
  },

  /**
   * Reset game for rematch
   */
  resetGame: () => {
    const { gameState } = get();
    if (!gameState) return;

    const room = useRoomStore.getState().room;
    if (!room) return;

    // Get AI state
    const { enabled: isAIEnabled, aiPlayer } = useAIStore.getState();

    // Create AI game player if enabled
    const aiGamePlayer =
      isAIEnabled && aiPlayer
        ? {
            odId: aiPlayer.id,
            nickname: aiPlayer.nickname,
            avatar: aiPlayer.avatar,
            score: 0,
            isActive: false,
            isAI: true,
          }
        : null;

    // Create new state based on game type
    let newState: AnyGameState;

    switch (room.gameSlug) {
      case "connect-four":
        newState = createConnectFourState(
          room.id,
          gameState.players.filter((p) => !p.isAI),
          aiGamePlayer
        );
        break;
      case "tic-tac-toe":
      default:
        newState = createTicTacToeState(
          room.id,
          gameState.players.filter((p) => !p.isAI),
          aiGamePlayer
        );
        break;
    }

    // Mark current turn player as active
    newState.players = newState.players.map((p) => ({
      ...p,
      isActive: p.odId === newState.currentTurn,
    }));

    set({ gameState: newState, isPlaying: true, showResult: false });

    // If host, broadcast
    const isHost = useRoomStore.getState().isHost;
    if (isHost) {
      peerManager.broadcast("game_state", { state: newState });
    }
  },

  /**
   * Place mark on cell
   * @param cellIndex - Cell index to place mark
   * @param forPlayerId - Optional player ID (for AI moves)
   */
  placeMark: (cellIndex: number, forPlayerId?: string) => {
    const { gameState, isPlaying } = get();
    if (!gameState || !isPlaying) return;

    // Type guard for TicTacToe
    if (!("playerX" in gameState) || !("playerO" in gameState)) return;

    const ttState = gameState as TicTacToeState;
    const user = useUserStore.getState().user;

    // Determine which player is making the move
    const playerId = forPlayerId ?? user?.id;
    if (!playerId) return;

    // Check if it's this player's turn
    if (ttState.currentTurn !== playerId) {
      console.log("[placeMark] Not this player's turn:", {
        currentTurn: ttState.currentTurn,
        playerId,
      });
      return;
    }

    // Check if cell is empty
    if (ttState.board[cellIndex] !== null) return;

    // Create action
    const action: TicTacToeAction = {
      type: "place_mark",
      playerId,
      timestamp: Date.now(),
      data: { cellIndex },
    };

    // Apply action locally
    const newState = applyTicTacToeAction(ttState, action);

    // Update active player
    newState.players = newState.players.map((p) => ({
      ...p,
      isActive: p.odId === newState.currentTurn,
    }));

    set({ gameState: newState, selectedCell: null });

    // Check if game ended
    if (newState.status === "finished") {
      set({ isPlaying: false, showResult: true });
    }

    // Broadcast action
    const room = useRoomStore.getState().room;
    if (room) {
      peerManager.broadcast("game_action", { action, newState });
    }
  },

  /**
   * Select cell (for mobile tap feedback)
   */
  selectCell: (cellIndex: number | null) => {
    set({ selectedCell: cellIndex });
  },

  /**
   * Drop piece in column (Connect Four)
   * @param column - Column index (0-6)
   * @param forPlayerId - Optional player ID (for AI moves)
   */
  dropPiece: (column: number, forPlayerId?: string) => {
    const { gameState, isPlaying } = get();
    if (!gameState || !isPlaying) return;

    // Type guard for Connect Four
    if (!("player1" in gameState) || !("player2" in gameState)) return;

    const cfState = gameState as ConnectFourState;
    const user = useUserStore.getState().user;

    // Determine which player is making the move
    const playerId = forPlayerId ?? user?.id;
    if (!playerId) return;

    // Check if it's this player's turn
    if (cfState.currentTurn !== playerId) {
      console.log("[dropPiece] Not this player's turn:", {
        currentTurn: cfState.currentTurn,
        playerId,
      });
      return;
    }

    // Create action
    const action: ConnectFourAction = {
      type: "drop_piece",
      playerId,
      timestamp: Date.now(),
      data: { column },
    };

    // Apply action locally
    const newState = applyConnectFourAction(cfState, action);

    // Update active player
    newState.players = newState.players.map((p) => ({
      ...p,
      isActive: p.odId === newState.currentTurn,
    }));

    set({ gameState: newState, selectedCell: null });

    // Check if game ended
    if (newState.status === "finished") {
      set({ isPlaying: false, showResult: true });
    }

    // Broadcast action
    const room = useRoomStore.getState().room;
    if (room) {
      peerManager.broadcast("game_action", { action, newState });
    }
  },

  /**
   * Handle incoming game messages
   */
  handleGameMessage: (message: P2PMessage) => {
    console.log("[GameStore] Received message:", message.type);
    switch (message.type) {
      case "game_state": {
        const { state } = message.payload as { state: TicTacToeState };
        console.log("[GameStore] Received game_state, status:", state.status);
        set({
          gameState: state,
          isPlaying: state.status === "playing",
          showResult: state.status === "finished",
        });
        break;
      }
      case "game_action": {
        const { newState } = message.payload as {
          action: TicTacToeAction;
          newState: TicTacToeState;
        };

        // Update with received state
        set({
          gameState: newState,
          isPlaying: newState.status === "playing",
          showResult: newState.status === "finished",
        });
        break;
      }
    }
  },

  /**
   * Set game state directly
   */
  setGameState: (state: AnyGameState) => {
    set({ gameState: state });
  },

  /**
   * Set show result
   */
  setShowResult: (show: boolean) => {
    set({ showResult: show });
  },

  /**
   * Clear game state completely (when leaving room)
   */
  clearGame: () => {
    set(initialState);
  },
}));
