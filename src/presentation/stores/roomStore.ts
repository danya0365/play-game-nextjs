"use client";

import type {
  JoinRequestPayload,
  JoinResponsePayload,
  P2PMessage,
  PlayerUpdatePayload,
  Room,
  RoomConfig,
  RoomPlayer,
  RoomStatus,
} from "@/src/domain/types/room";
import { generateId, generateRoomCode } from "@/src/domain/types/room";
import { peerManager } from "@/src/infrastructure/p2p/peerManager";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { useAIStore } from "./aiStore";
import { useGameStore } from "./gameStore";
import { useUserStore } from "./userStore";

/**
 * Room Store State
 */
interface RoomState {
  // Connection state
  peerId: string | null;
  isConnecting: boolean;
  isConnected: boolean;
  connectionError: string | null;

  // Room state
  room: Room | null;
  isHost: boolean;
  isInRoom: boolean;

  // UI state
  isJoining: boolean;
  joinError: string | null;
}

/**
 * Room Store Actions
 */
interface RoomActions {
  // Connection actions
  initializePeer: () => Promise<string>;
  disconnect: () => void;
  reconnect: () => Promise<boolean>;

  // Room actions
  createRoom: (
    gameSlug: string,
    gameName: string,
    config: Partial<RoomConfig>
  ) => Promise<Room>;
  joinRoom: (hostPeerId: string) => Promise<void>;
  leaveRoom: () => void;

  // Player actions
  setReady: (ready: boolean) => void;
  kickPlayer: (odId: string) => void;

  // Game actions
  startGame: (isAIEnabled?: boolean) => void;

  // Internal actions
  handleMessage: (message: P2PMessage, senderPeerId: string) => void;
  updateRoom: (room: Partial<Room>) => void;
  addPlayer: (player: RoomPlayer) => void;
  removePlayer: (odId: string) => void;
  updatePlayer: (odId: string, data: Partial<RoomPlayer>) => void;
  setError: (error: string | null) => void;
  reset: () => void;
  clearPersistedRoom: () => void;
}

type RoomStore = RoomState & RoomActions;

/**
 * Initial state
 */
const initialState: RoomState = {
  peerId: null,
  isConnecting: false,
  isConnected: false,
  connectionError: null,
  room: null,
  isHost: false,
  isInRoom: false,
  isJoining: false,
  joinError: null,
};

/**
 * Room Store with persist
 */
export const useRoomStore = create<RoomStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      /**
       * Initialize PeerJS connection
       */
      initializePeer: async () => {
        const { isConnected, peerId } = get();
        if (isConnected && peerId) return peerId;

        set({ isConnecting: true, connectionError: null });

        try {
          const id = await peerManager.initialize({
            onOpen: (peerId) => {
              set({ peerId, isConnected: true, isConnecting: false });
            },
            onClose: () => {
              set({ isConnected: false, peerId: null });
            },
            onError: (error) => {
              set({ connectionError: error.message, isConnecting: false });
            },
            onConnection: (remotePeerId) => {
              console.log("[RoomStore] New connection:", remotePeerId);
            },
            onDisconnection: (remotePeerId) => {
              const { room, isHost } = get();
              if (room && isHost) {
                // Find player by peerId and mark as disconnected
                const player = room.players.find(
                  (p) => p.peerId === remotePeerId
                );
                if (player) {
                  get().updatePlayer(player.odId, { isConnected: false });
                }
              }
            },
            onMessage: (message, senderPeerId) => {
              get().handleMessage(message, senderPeerId);
            },
          });

          return id;
        } catch (error) {
          set({
            connectionError:
              error instanceof Error ? error.message : "Connection failed",
            isConnecting: false,
          });
          throw error;
        }
      },

      /**
       * Reconnect to room after page refresh
       */
      reconnect: async () => {
        const { room, isHost } = get();
        if (!room) return false;

        console.log("[RoomStore] Attempting to reconnect...", {
          isHost,
          roomId: room.id,
        });

        try {
          // Re-initialize peer connection
          await get().initializePeer();

          if (isHost) {
            // Host just needs to re-init peer, room state is persisted
            set({ isInRoom: true });
            console.log("[RoomStore] Host reconnected successfully");
            return true;
          } else {
            // Guest needs to reconnect to host
            await peerManager.connectToPeer(room.hostPeerId);

            // Send reconnect request
            const user = useUserStore.getState().user;
            if (user) {
              peerManager.send<JoinRequestPayload>(
                room.hostPeerId,
                "join_request",
                {
                  odId: user.id,
                  nickname: user.nickname,
                  avatar: user.avatar,
                }
              );
            }

            set({ isInRoom: true });
            console.log("[RoomStore] Guest reconnected successfully");
            return true;
          }
        } catch (error) {
          console.error("[RoomStore] Reconnect failed:", error);
          // Clear persisted room on failure
          get().clearPersistedRoom();
          return false;
        }
      },

      /**
       * Clear persisted room data
       */
      clearPersistedRoom: () => {
        set({
          room: null,
          isHost: false,
          isInRoom: false,
          isConnected: false,
          peerId: null,
        });
      },

      /**
       * Handle incoming P2P messages
       */
      handleMessage: (message: P2PMessage, senderPeerId: string) => {
        const { room, isHost } = get();

        switch (message.type) {
          case "join_request": {
            if (!isHost || !room) return;

            const payload = message.payload as JoinRequestPayload;

            // Check if room is full
            if (room.players.length >= room.config.maxPlayers) {
              peerManager.send<JoinResponsePayload>(
                senderPeerId,
                "join_rejected",
                {
                  success: false,
                  reason: "ห้องเต็มแล้ว",
                }
              );
              return;
            }

            // Check if game already started
            if (room.status !== "waiting") {
              peerManager.send<JoinResponsePayload>(
                senderPeerId,
                "join_rejected",
                {
                  success: false,
                  reason: "เกมเริ่มไปแล้ว",
                }
              );
              return;
            }

            // Add new player
            const newPlayer: RoomPlayer = {
              odId: payload.odId,
              peerId: senderPeerId,
              nickname: payload.nickname,
              avatar: payload.avatar,
              isHost: false,
              isReady: false,
              isConnected: true,
              joinedAt: Date.now(),
            };

            get().addPlayer(newPlayer);

            // Send acceptance with current room state
            const updatedRoom = get().room!;
            peerManager.send<JoinResponsePayload>(
              senderPeerId,
              "join_accepted",
              {
                success: true,
                room: updatedRoom,
              }
            );

            // Broadcast to other players
            peerManager.broadcast<PlayerUpdatePayload>(
              "player_joined",
              { player: newPlayer },
              senderPeerId
            );
            break;
          }

          case "join_accepted": {
            const payload = message.payload as JoinResponsePayload;
            if (payload.success && payload.room) {
              set({
                room: payload.room,
                isInRoom: true,
                isHost: false,
                isJoining: false,
                joinError: null,
              });
            }
            break;
          }

          case "join_rejected": {
            const payload = message.payload as JoinResponsePayload;
            set({
              isJoining: false,
              joinError: payload.reason || "ไม่สามารถเข้าห้องได้",
            });
            break;
          }

          case "player_joined": {
            const payload = message.payload as PlayerUpdatePayload;
            get().addPlayer(payload.player);
            break;
          }

          case "player_left": {
            const payload = message.payload as { odId: string };
            get().removePlayer(payload.odId);
            break;
          }

          case "player_ready": {
            const payload = message.payload as { odId: string; ready: boolean };
            get().updatePlayer(payload.odId, { isReady: payload.ready });
            break;
          }

          case "room_update": {
            const payload = message.payload as Partial<Room>;
            get().updateRoom(payload);
            break;
          }

          case "game_start": {
            get().updateRoom({ status: "playing" });
            break;
          }

          case "kick": {
            const user = useUserStore.getState().user;
            const payload = message.payload as { odId: string };
            if (user && payload.odId === user.id) {
              get().leaveRoom();
              set({ joinError: "คุณถูกเตะออกจากห้อง" });
            }
            break;
          }

          default:
            break;
        }
      },

      /**
       * Disconnect from peer network
       */
      disconnect: () => {
        peerManager.cleanup();
        set(initialState);
      },

      /**
       * Create a new room as host
       */
      createRoom: async (gameSlug, gameName, config) => {
        // Reset previous game state
        useAIStore.getState().resetAI();
        useGameStore.getState().clearGame();

        const user = useUserStore.getState().user;
        if (!user) throw new Error("User not found");

        const peerId = await get().initializePeer();

        const room: Room = {
          id: generateId(),
          code: generateRoomCode(),
          hostId: user.id,
          hostPeerId: peerId,
          gameSlug,
          gameName,
          status: "waiting",
          players: [
            {
              odId: user.id,
              peerId,
              nickname: user.nickname,
              avatar: user.avatar,
              isHost: true,
              isReady: true,
              isConnected: true,
              joinedAt: Date.now(),
            },
          ],
          config: {
            maxPlayers: config.maxPlayers || 4,
            minPlayers: config.minPlayers || 2,
            isPrivate: config.isPrivate || false,
            gameSlug,
          },
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        set({ room, isHost: true, isInRoom: true });
        return room;
      },

      /**
       * Join an existing room
       */
      joinRoom: async (hostPeerId) => {
        // Reset previous game state
        useAIStore.getState().resetAI();
        useGameStore.getState().clearGame();

        const user = useUserStore.getState().user;
        if (!user) throw new Error("User not found");

        set({ isJoining: true, joinError: null });

        try {
          await get().initializePeer();
          await peerManager.connectToPeer(hostPeerId);

          // Send join request
          peerManager.send<JoinRequestPayload>(hostPeerId, "join_request", {
            odId: user.id,
            nickname: user.nickname,
            avatar: user.avatar,
          });

          // Wait for response (handled in handleMessage)
          // Timeout after 10 seconds
          setTimeout(() => {
            const { isJoining } = get();
            if (isJoining) {
              set({ isJoining: false, joinError: "การเชื่อมต่อหมดเวลา" });
            }
          }, 10000);
        } catch (error) {
          set({
            isJoining: false,
            joinError:
              error instanceof Error ? error.message : "ไม่สามารถเชื่อมต่อได้",
          });
          throw error;
        }
      },

      /**
       * Leave the current room
       */
      leaveRoom: () => {
        const { room, isHost } = get();
        if (!room) return;

        const user = useUserStore.getState().user;

        if (isHost) {
          // Notify all players room is closing
          peerManager.broadcast("room_update", {
            status: "finished" as RoomStatus,
          });
        } else if (user) {
          // Notify host that we're leaving
          peerManager.send(room.hostPeerId, "player_left", { odId: user.id });
        }

        // Disconnect all peers
        peerManager.connectedPeers.forEach((pid) =>
          peerManager.disconnectPeer(pid)
        );

        // Reset AI and game state
        useAIStore.getState().resetAI();
        useGameStore.getState().clearGame();

        set({
          room: null,
          isHost: false,
          isInRoom: false,
        });
      },

      /**
       * Set ready status
       */
      setReady: (ready) => {
        const { room, isHost } = get();
        const user = useUserStore.getState().user;
        if (!room || !user) return;

        get().updatePlayer(user.id, { isReady: ready });

        if (isHost) {
          peerManager.broadcast("player_ready", { odId: user.id, ready });
        } else {
          peerManager.send(room.hostPeerId, "player_ready", {
            odId: user.id,
            ready,
          });
        }
      },

      /**
       * Kick a player (host only)
       */
      kickPlayer: (odId) => {
        const { room, isHost } = get();
        if (!room || !isHost) return;

        const player = room.players.find((p) => p.odId === odId);
        if (!player || player.isHost) return;

        // Send kick message to player
        peerManager.send(player.peerId, "kick", { odId });

        // Disconnect from that peer
        peerManager.disconnectPeer(player.peerId);

        // Remove from room
        get().removePlayer(odId);

        // Broadcast update
        peerManager.broadcast("player_left", { odId });
      },

      /**
       * Start the game (host only)
       * @param isAIEnabled - Whether AI is enabled (counts as a player)
       */
      startGame: (isAIEnabled = false) => {
        const { room, isHost } = get();
        if (!room || !isHost) return;

        // Calculate effective player count (AI counts as 1)
        const effectivePlayerCount =
          room.players.length + (isAIEnabled ? 1 : 0);

        // Check minimum players
        if (effectivePlayerCount < room.config.minPlayers) {
          set({
            joinError: `ต้องมีผู้เล่นอย่างน้อย ${room.config.minPlayers} คน`,
          });
          return;
        }

        // Check all players ready (skip for AI mode with single player)
        if (!isAIEnabled || room.players.length > 1) {
          const allReady = room.players.every((p) => p.isReady);
          if (!allReady) {
            set({ joinError: "ผู้เล่นทุกคนต้องพร้อม" });
            return;
          }
        }

        get().updateRoom({ status: "starting" });
        peerManager.broadcast("game_start", {});

        // After short delay, change to playing
        setTimeout(() => {
          get().updateRoom({ status: "playing" });
        }, 1000);
      },

      /**
       * Update room state
       */
      updateRoom: (data) => {
        set((state) => ({
          room: state.room
            ? { ...state.room, ...data, updatedAt: Date.now() }
            : null,
        }));
      },

      /**
       * Add player to room
       */
      addPlayer: (player) => {
        set((state) => ({
          room: state.room
            ? {
                ...state.room,
                players: [...state.room.players, player],
                updatedAt: Date.now(),
              }
            : null,
        }));
      },

      /**
       * Remove player from room
       */
      removePlayer: (odId) => {
        set((state) => ({
          room: state.room
            ? {
                ...state.room,
                players: state.room.players.filter((p) => p.odId !== odId),
                updatedAt: Date.now(),
              }
            : null,
        }));
      },

      /**
       * Update player data
       */
      updatePlayer: (odId, data) => {
        set((state) => ({
          room: state.room
            ? {
                ...state.room,
                players: state.room.players.map((p) =>
                  p.odId === odId ? { ...p, ...data } : p
                ),
                updatedAt: Date.now(),
              }
            : null,
        }));
      },

      /**
       * Set error message
       */
      setError: (error) => {
        set({ joinError: error });
      },

      /**
       * Reset store
       */
      reset: () => {
        peerManager.cleanup();
        set(initialState);
      },
    }),
    {
      name: "room-storage",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        room: state.room,
        isHost: state.isHost,
        isInRoom: state.isInRoom,
      }),
    }
  )
);
