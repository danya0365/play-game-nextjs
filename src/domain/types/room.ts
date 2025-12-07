/**
 * Room and P2P Types for Game System
 */

/**
 * Player in a room
 */
export interface RoomPlayer {
  odId: string;
  peerId: string;
  nickname: string;
  avatar: string;
  isHost: boolean;
  isReady: boolean;
  isConnected: boolean;
  joinedAt: number;
}

/**
 * Room status
 */
export type RoomStatus = "waiting" | "starting" | "playing" | "finished";

/**
 * Room configuration
 */
export interface RoomConfig {
  maxPlayers: number;
  minPlayers: number;
  isPrivate: boolean;
  gameSlug: string;
}

/**
 * Room state
 */
export interface Room {
  id: string;
  code: string; // 6-character room code for easy sharing
  hostId: string;
  hostPeerId: string;
  gameSlug: string;
  gameName: string;
  status: RoomStatus;
  players: RoomPlayer[];
  config: RoomConfig;
  createdAt: number;
  updatedAt: number;
}

/**
 * P2P Message Types
 */
export type P2PMessageType =
  | "join_request"
  | "join_accepted"
  | "join_rejected"
  | "player_joined"
  | "player_left"
  | "player_ready"
  | "player_unready"
  | "game_start"
  | "game_state"
  | "game_action"
  | "chat"
  | "ping"
  | "pong"
  | "kick"
  | "room_update"
  | "sync_request"
  | "sync_response";

/**
 * Base P2P Message
 */
export interface P2PMessage<T = unknown> {
  type: P2PMessageType;
  senderId: string;
  timestamp: number;
  payload: T;
}

/**
 * Join Request Payload
 */
export interface JoinRequestPayload {
  odId: string;
  nickname: string;
  avatar: string;
}

/**
 * Join Response Payload
 */
export interface JoinResponsePayload {
  success: boolean;
  room?: Room;
  reason?: string;
}

/**
 * Player Update Payload
 */
export interface PlayerUpdatePayload {
  player: RoomPlayer;
}

/**
 * Game Action Payload (generic for any game)
 */
export interface GameActionPayload<T = unknown> {
  action: string;
  data: T;
}

/**
 * Generate room code (6 characters)
 */
export function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Generate unique ID
 */
export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
