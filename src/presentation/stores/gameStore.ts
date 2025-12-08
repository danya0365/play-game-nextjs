"use client";

import type {
  CoinFlipAction,
  CoinFlipState,
  CoinGuess,
} from "@/src/domain/types/coinFlipState";
import {
  applyCoinFlipAction,
  createCoinFlipState,
} from "@/src/domain/types/coinFlipState";
import type {
  ConnectFourAction,
  ConnectFourState,
} from "@/src/domain/types/connectFourState";
import {
  applyConnectFourAction,
  createConnectFourState,
} from "@/src/domain/types/connectFourState";
import type {
  DiceRollAction,
  DiceRollState,
  DiceValue,
} from "@/src/domain/types/diceRollState";
import {
  applyDiceRollAction,
  createDiceRollState,
} from "@/src/domain/types/diceRollState";
import type {
  GamePlayer,
  TicTacToeAction,
  TicTacToeState,
} from "@/src/domain/types/gameState";
import {
  applyTicTacToeAction,
  createTicTacToeState,
} from "@/src/domain/types/gameState";
import type { GomokuState } from "@/src/domain/types/gomokuState";
import {
  applyGomokuAction,
  createGomokuState,
} from "@/src/domain/types/gomokuState";
import type {
  RockPaperScissorsAction,
  RockPaperScissorsState,
  RPSChoice,
} from "@/src/domain/types/rockPaperScissorsState";
import {
  applyRockPaperScissorsAction,
  createRockPaperScissorsState,
} from "@/src/domain/types/rockPaperScissorsState";
import type { P2PMessage } from "@/src/domain/types/room";
import { peerManager } from "@/src/infrastructure/p2p/peerManager";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { useAIStore } from "./aiStore";
import { useRoomStore } from "./roomStore";
import { useUserStore } from "./userStore";

// Union type for all game states
type AnyGameState =
  | TicTacToeState
  | ConnectFourState
  | RockPaperScissorsState
  | CoinFlipState
  | DiceRollState
  | GomokuState;

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

  // Actions - Rock Paper Scissors
  makeRPSChoice: (choice: RPSChoice, forPlayerId?: string) => void;

  // Actions - Coin Flip
  makeCoinFlipGuess: (guess: CoinGuess, forPlayerId?: string) => void;

  // Actions - Dice Roll
  makeDiceRoll: (value: DiceValue, forPlayerId?: string) => void;

  // P2P handlers
  handleGameMessage: (message: P2PMessage) => void;
  registerMessageHandlers: () => void;

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
 * Game Store with persist (for Host to restore state on refresh)
 */
export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
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
          case "rock-paper-scissors":
            state = createRockPaperScissorsState(
              room.id,
              gamePlayers,
              aiGamePlayer
            );
            break;
          case "coin-flip":
            state = createCoinFlipState(room.id, gamePlayers, aiGamePlayer);
            break;
          case "dice-roll":
            state = createDiceRollState(room.id, gamePlayers, aiGamePlayer);
            break;
          case "gomoku":
            state = createGomokuState(room.id, gamePlayers, aiGamePlayer);
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

        // Register message handlers
        get().registerMessageHandlers();
      },

      /**
       * Register message handlers for P2P communication
       */
      registerMessageHandlers: () => {
        peerManager.onMessage("game_state", get().handleGameMessage);
        peerManager.onMessage("game_action", get().handleGameMessage);
        console.log("[GameStore] Message handlers registered");
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
          case "rock-paper-scissors":
            newState = createRockPaperScissorsState(
              room.id,
              gameState.players.filter((p) => !p.isAI),
              aiGamePlayer
            );
            break;
          case "coin-flip":
            newState = createCoinFlipState(
              room.id,
              gameState.players.filter((p) => !p.isAI),
              aiGamePlayer
            );
            break;
          case "dice-roll":
            newState = createDiceRollState(
              room.id,
              gameState.players.filter((p) => !p.isAI),
              aiGamePlayer
            );
            break;
          case "gomoku":
            newState = createGomokuState(
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

        const user = useUserStore.getState().user;
        const playerId = forPlayerId ?? user?.id;
        if (!playerId) return;

        // Handle TicTacToe
        if ("playerX" in gameState && "playerO" in gameState) {
          const ttState = gameState as TicTacToeState;

          if (ttState.currentTurn !== playerId) return;
          if (ttState.board[cellIndex] !== null) return;

          const action: TicTacToeAction = {
            type: "place_mark",
            playerId,
            timestamp: Date.now(),
            data: { cellIndex },
          };

          const newState = applyTicTacToeAction(ttState, action);
          newState.players = newState.players.map((p) => ({
            ...p,
            isActive: p.odId === newState.currentTurn,
          }));

          set({ gameState: newState, selectedCell: null });
          if (newState.status === "finished") {
            set({ isPlaying: false, showResult: true });
          }

          const room = useRoomStore.getState().room;
          if (room) {
            peerManager.broadcast("game_action", { action, newState });
          }
          return;
        }

        // Handle Gomoku (board size 225 = 15x15)
        if (
          "lastMove" in gameState &&
          "player1" in gameState &&
          "player2" in gameState &&
          Array.isArray((gameState as { board?: unknown[] }).board) &&
          (gameState as { board: unknown[] }).board.length === 225
        ) {
          const gmState = gameState as GomokuState;

          if (gmState.currentTurn !== playerId) return;
          if (gmState.board[cellIndex] !== null) return;

          const action = {
            type: "place_stone" as const,
            playerId,
            timestamp: Date.now(),
            data: { cellIndex },
          };

          const newState = applyGomokuAction(gmState, action);
          newState.players = newState.players.map((p) => ({
            ...p,
            isActive: p.odId === newState.currentTurn,
          }));

          set({ gameState: newState, selectedCell: null });
          if (newState.status === "finished") {
            set({ isPlaying: false, showResult: true });
          }

          const room = useRoomStore.getState().room;
          if (room) {
            peerManager.broadcast("game_action", { action, newState });
          }
          return;
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
       * Make RPS choice
       * @param choice - Rock, Paper, or Scissors
       * @param forPlayerId - Optional player ID (for AI moves)
       */
      makeRPSChoice: (choice: RPSChoice, forPlayerId?: string) => {
        const { gameState, isPlaying } = get();
        if (!gameState || !isPlaying) return;

        // Type guard for Rock Paper Scissors
        if (!("phase" in gameState) || !("player1CurrentChoice" in gameState))
          return;

        const rpsState = gameState as RockPaperScissorsState;
        const user = useUserStore.getState().user;

        // Determine which player is making the choice
        const playerId = forPlayerId ?? user?.id;
        if (!playerId) return;

        // Check if player is in the game
        if (playerId !== rpsState.player1 && playerId !== rpsState.player2) {
          console.log("[makeRPSChoice] Player not in game:", playerId);
          return;
        }

        // Create action
        const action: RockPaperScissorsAction = {
          type: "make_choice",
          playerId,
          timestamp: Date.now(),
          data: { choice },
        };

        // Apply action locally
        const newState = applyRockPaperScissorsAction(rpsState, action);

        set({ gameState: newState });

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
       * Make Coin Flip guess
       */
      makeCoinFlipGuess: (guess: CoinGuess, forPlayerId?: string) => {
        const { gameState, isPlaying } = get();
        if (!gameState || !isPlaying) return;

        // Type guard for Coin Flip
        if (!("currentFlipResult" in gameState)) return;

        const cfState = gameState as CoinFlipState;
        const user = useUserStore.getState().user;
        const playerId = forPlayerId ?? user?.id;
        if (!playerId) return;

        if (playerId !== cfState.player1 && playerId !== cfState.player2) {
          return;
        }

        const action: CoinFlipAction = {
          type: "make_guess",
          playerId,
          timestamp: Date.now(),
          data: { guess },
        };

        const newState = applyCoinFlipAction(cfState, action);
        set({ gameState: newState });

        if (newState.status === "finished") {
          set({ isPlaying: false, showResult: true });
        }

        const room = useRoomStore.getState().room;
        if (room) {
          peerManager.broadcast("game_action", { action, newState });
        }
      },

      /**
       * Make Dice Roll
       */
      makeDiceRoll: (value: DiceValue, forPlayerId?: string) => {
        const { gameState, isPlaying } = get();
        if (!gameState || !isPlaying) return;

        // Type guard for Dice Roll
        if (!("player1HasRolled" in gameState)) return;

        const drState = gameState as DiceRollState;
        const user = useUserStore.getState().user;
        const playerId = forPlayerId ?? user?.id;
        if (!playerId) return;

        if (playerId !== drState.player1 && playerId !== drState.player2) {
          return;
        }

        const action: DiceRollAction = {
          type: "roll_dice",
          playerId,
          timestamp: Date.now(),
          data: { value },
        };

        const newState = applyDiceRollAction(drState, action);
        set({ gameState: newState });

        if (newState.status === "finished") {
          set({ isPlaying: false, showResult: true });
        }

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
            console.log(
              "[GameStore] Received game_state, status:",
              state.status
            );
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
       * Set game state directly (used for sync)
       */
      setGameState: (state: AnyGameState) => {
        set({ gameState: state, isPlaying: true });
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
    }),
    {
      name: "game-storage",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        gameState: state.gameState,
        isPlaying: state.isPlaying,
      }),
    }
  )
);
