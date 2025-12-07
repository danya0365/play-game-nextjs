"use client";

import type { P2PMessage, P2PMessageType } from "@/src/domain/types/room";
import Peer, { DataConnection } from "peerjs";

/**
 * PeerJS Configuration
 */
const PEER_CONFIG = {
  host: "0.peerjs.com",
  port: 443,
  secure: true,
  debug: process.env.NODE_ENV === "development" ? 2 : 0,
};

/**
 * Connection state
 */
export type ConnectionState =
  | "disconnected"
  | "connecting"
  | "connected"
  | "error";

/**
 * Message handler type
 */
export type MessageHandler = (message: P2PMessage, peerId: string) => void;

/**
 * Connection event handlers
 */
export interface PeerEventHandlers {
  onOpen?: (peerId: string) => void;
  onClose?: () => void;
  onError?: (error: Error) => void;
  onConnection?: (peerId: string) => void;
  onDisconnection?: (peerId: string) => void;
  onMessage?: MessageHandler;
}

/**
 * PeerJS Connection Manager
 * Singleton pattern for managing P2P connections
 */
class PeerManager {
  private peer: Peer | null = null;
  private connections: Map<string, DataConnection> = new Map();
  private messageHandlers: Map<P2PMessageType, Set<MessageHandler>> = new Map();
  private eventHandlers: PeerEventHandlers = {};
  private _peerId: string | null = null;
  private _state: ConnectionState = "disconnected";
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;

  /**
   * Get current peer ID
   */
  get peerId(): string | null {
    return this._peerId;
  }

  /**
   * Get connection state
   */
  get state(): ConnectionState {
    return this._state;
  }

  /**
   * Get connected peer IDs
   */
  get connectedPeers(): string[] {
    return Array.from(this.connections.keys()).filter(
      (id) => this.connections.get(id)?.open
    );
  }

  /**
   * Initialize peer connection
   */
  async initialize(handlers?: PeerEventHandlers): Promise<string> {
    if (handlers) {
      this.eventHandlers = handlers;
    }

    // If already connected, return existing peer ID
    if (this.peer && this._peerId && this._state === "connected") {
      return this._peerId;
    }

    // Clean up existing connection
    this.cleanup();

    return new Promise((resolve, reject) => {
      this._state = "connecting";

      try {
        this.peer = new Peer(PEER_CONFIG);

        this.peer.on("open", (id) => {
          this._peerId = id;
          this._state = "connected";
          this.reconnectAttempts = 0;
          console.log("[PeerManager] Connected with ID:", id);
          this.eventHandlers.onOpen?.(id);
          resolve(id);
        });

        this.peer.on("connection", (conn) => {
          this.handleIncomingConnection(conn);
        });

        this.peer.on("disconnected", () => {
          console.log("[PeerManager] Disconnected from server");
          this._state = "disconnected";
          this.attemptReconnect();
        });

        this.peer.on("close", () => {
          console.log("[PeerManager] Peer closed");
          this._state = "disconnected";
          this._peerId = null;
          this.eventHandlers.onClose?.();
        });

        this.peer.on("error", (err) => {
          console.error("[PeerManager] Error:", err);
          this._state = "error";
          this.eventHandlers.onError?.(err);

          // Only reject if we haven't connected yet
          if (!this._peerId) {
            reject(err);
          }
        });
      } catch (error) {
        this._state = "error";
        reject(error);
      }
    });
  }

  /**
   * Connect to a remote peer
   */
  async connectToPeer(remotePeerId: string): Promise<DataConnection> {
    if (!this.peer || this._state !== "connected") {
      throw new Error("Peer not initialized");
    }

    // Check if already connected
    const existingConn = this.connections.get(remotePeerId);
    if (existingConn?.open) {
      return existingConn;
    }

    return new Promise((resolve, reject) => {
      const conn = this.peer!.connect(remotePeerId, {
        reliable: true,
      });

      const timeout = setTimeout(() => {
        reject(new Error("Connection timeout"));
      }, 10000);

      conn.on("open", () => {
        clearTimeout(timeout);
        this.setupConnection(conn);
        console.log("[PeerManager] Connected to peer:", remotePeerId);
        resolve(conn);
      });

      conn.on("error", (err) => {
        clearTimeout(timeout);
        reject(err);
      });
    });
  }

  /**
   * Handle incoming connection
   */
  private handleIncomingConnection(conn: DataConnection) {
    console.log("[PeerManager] Incoming connection from:", conn.peer);

    conn.on("open", () => {
      this.setupConnection(conn);
      this.eventHandlers.onConnection?.(conn.peer);
    });
  }

  /**
   * Setup connection handlers
   */
  private setupConnection(conn: DataConnection) {
    const peerId = conn.peer;
    this.connections.set(peerId, conn);

    conn.on("data", (data) => {
      try {
        const message = data as P2PMessage;
        this.handleMessage(message, peerId);
      } catch (error) {
        console.error("[PeerManager] Error parsing message:", error);
      }
    });

    conn.on("close", () => {
      console.log("[PeerManager] Connection closed:", peerId);
      this.connections.delete(peerId);
      this.eventHandlers.onDisconnection?.(peerId);
    });

    conn.on("error", (err) => {
      console.error("[PeerManager] Connection error:", peerId, err);
    });
  }

  /**
   * Handle incoming message
   */
  private handleMessage(message: P2PMessage, peerId: string) {
    // Call global message handler
    this.eventHandlers.onMessage?.(message, peerId);

    // Call type-specific handlers
    const handlers = this.messageHandlers.get(message.type);
    if (handlers) {
      handlers.forEach((handler) => handler(message, peerId));
    }
  }

  /**
   * Send message to a specific peer
   */
  send<T>(peerId: string, type: P2PMessageType, payload: T): boolean {
    const conn = this.connections.get(peerId);
    if (!conn?.open) {
      console.warn("[PeerManager] Cannot send - not connected to:", peerId);
      return false;
    }

    const message: P2PMessage<T> = {
      type,
      senderId: this._peerId!,
      timestamp: Date.now(),
      payload,
    };

    conn.send(message);
    return true;
  }

  /**
   * Broadcast message to all connected peers
   */
  broadcast<T>(type: P2PMessageType, payload: T, excludePeerId?: string): void {
    const message: P2PMessage<T> = {
      type,
      senderId: this._peerId!,
      timestamp: Date.now(),
      payload,
    };

    this.connections.forEach((conn, peerId) => {
      if (conn.open && peerId !== excludePeerId) {
        conn.send(message);
      }
    });
  }

  /**
   * Register message handler for specific type
   */
  onMessage(type: P2PMessageType, handler: MessageHandler): () => void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, new Set());
    }
    this.messageHandlers.get(type)!.add(handler);

    // Return unsubscribe function
    return () => {
      this.messageHandlers.get(type)?.delete(handler);
    };
  }

  /**
   * Disconnect from a specific peer
   */
  disconnectPeer(peerId: string): void {
    const conn = this.connections.get(peerId);
    if (conn) {
      conn.close();
      this.connections.delete(peerId);
    }
  }

  /**
   * Attempt to reconnect
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log("[PeerManager] Max reconnect attempts reached");
      return;
    }

    this.reconnectAttempts++;
    console.log(
      `[PeerManager] Reconnecting... attempt ${this.reconnectAttempts}`
    );

    setTimeout(() => {
      this.peer?.reconnect();
    }, 1000 * this.reconnectAttempts);
  }

  /**
   * Cleanup all connections
   */
  cleanup(): void {
    this.connections.forEach((conn) => conn.close());
    this.connections.clear();
    this.peer?.destroy();
    this.peer = null;
    this._peerId = null;
    this._state = "disconnected";
  }

  /**
   * Destroy the manager
   */
  destroy(): void {
    this.cleanup();
    this.messageHandlers.clear();
    this.eventHandlers = {};
  }
}

// Export singleton instance
export const peerManager = new PeerManager();
