"use client";

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
import { useRoomStore } from "./roomStore";
import { useUserStore } from "./userStore";

/**
 * Game Store State
 */
interface GameState {
  // Game state
  gameState: TicTacToeState | null;
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

  // Actions
  placeMark: (cellIndex: number) => void;
  selectCell: (cellIndex: number | null) => void;

  // P2P handlers
  handleGameMessage: (message: P2PMessage) => void;

  // State updates
  setGameState: (state: TicTacToeState) => void;
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
   * Initialize game
   */
  initGame: () => {
    const room = useRoomStore.getState().room;
    if (!room) return;

    // Convert room players to game players
    const gamePlayers: GamePlayer[] = room.players.map((p) => ({
      odId: p.odId,
      nickname: p.nickname,
      avatar: p.avatar,
      score: 0,
      isActive: false,
    }));

    // Create initial state
    const state = createTicTacToeState(room.id, gamePlayers);

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

    // Create new state with same players
    const newState = createTicTacToeState(room.id, gameState.players);

    set({ gameState: newState, isPlaying: true, showResult: false });

    // If host, broadcast
    const isHost = useRoomStore.getState().isHost;
    if (isHost) {
      peerManager.broadcast("game_state", { state: newState });
    }
  },

  /**
   * Place mark on cell
   */
  placeMark: (cellIndex: number) => {
    const { gameState, isPlaying } = get();
    if (!gameState || !isPlaying) return;

    const user = useUserStore.getState().user;
    if (!user) return;

    // Check if it's my turn
    if (gameState.currentTurn !== user.id) return;

    // Check if cell is empty
    if (gameState.board[cellIndex] !== null) return;

    // Create action
    const action: TicTacToeAction = {
      type: "place_mark",
      playerId: user.id,
      timestamp: Date.now(),
      data: { cellIndex },
    };

    // Apply action locally
    const newState = applyTicTacToeAction(gameState, action);

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
  setGameState: (state: TicTacToeState) => {
    set({ gameState: state });
  },

  /**
   * Set show result
   */
  setShowResult: (show: boolean) => {
    set({ showResult: show });
  },
}));
