"use client";

import { create } from "zustand";

/**
 * Connection quality based on latency
 */
export type ConnectionQuality = "excellent" | "good" | "poor" | "disconnected";

/**
 * Peer connection status
 */
export interface PeerConnectionStatus {
  peerId: string;
  lastPingAt: number;
  lastPongAt: number;
  latency: number; // ms
  isConnected: boolean;
  quality: ConnectionQuality;
}

/**
 * Connection Store State
 */
interface ConnectionState {
  // Host connection status (for clients)
  hostStatus: PeerConnectionStatus | null;

  // Peer statuses (for host)
  peerStatuses: Map<string, PeerConnectionStatus>;

  // Ping interval
  pingInterval: NodeJS.Timeout | null;

  // Settings
  pingIntervalMs: number;
  timeoutMs: number;
}

/**
 * Connection Store Actions
 */
interface ConnectionActions {
  // Host actions (ping clients)
  startHostPing: () => void;
  stopHostPing: () => void;
  handlePong: (peerId: string, timestamp: number) => void;

  // Client actions (respond to ping, track host)
  handlePing: (hostPeerId: string, timestamp: number) => void;
  updateHostStatus: (status: Partial<PeerConnectionStatus>) => void;

  // Common
  checkTimeouts: () => void;
  getQuality: (latency: number, isConnected: boolean) => ConnectionQuality;
  reset: () => void;
}

type ConnectionStore = ConnectionState & ConnectionActions;

/**
 * Calculate connection quality based on latency
 */
function calculateQuality(
  latency: number,
  isConnected: boolean
): ConnectionQuality {
  if (!isConnected) return "disconnected";
  if (latency < 100) return "excellent";
  if (latency < 300) return "good";
  return "poor";
}

/**
 * Initial state
 */
const initialState: ConnectionState = {
  hostStatus: null,
  peerStatuses: new Map(),
  pingInterval: null,
  pingIntervalMs: 1000, // 1 second
  timeoutMs: 3000, // 3 seconds without ping = disconnected
};

/**
 * Connection Store
 * Manages ping-pong and connection status
 */
export const useConnectionStore = create<ConnectionStore>((set, get) => ({
  ...initialState,

  /**
   * Start ping interval (host only)
   */
  startHostPing: () => {
    const { pingInterval, pingIntervalMs } = get();

    // Already running
    if (pingInterval) return;

    // Import peerManager dynamically to avoid circular dependency
    import("@/src/infrastructure/p2p/peerManager").then(({ peerManager }) => {
      const interval = setInterval(() => {
        const timestamp = Date.now();

        // Update all peer statuses with new ping time
        const { peerStatuses } = get();
        const connectedPeers = peerManager.connectedPeers;

        connectedPeers.forEach((peerId) => {
          // Send ping
          peerManager.send(peerId, "ping", { timestamp });

          // Update ping time
          const existing = peerStatuses.get(peerId);
          peerStatuses.set(peerId, {
            peerId,
            lastPingAt: timestamp,
            lastPongAt: existing?.lastPongAt ?? 0,
            latency: existing?.latency ?? 0,
            isConnected: existing?.isConnected ?? true,
            quality: existing?.quality ?? "good",
          });
        });

        set({ peerStatuses: new Map(peerStatuses) });

        // Check for timeouts
        get().checkTimeouts();
      }, pingIntervalMs);

      set({ pingInterval: interval });
    });
  },

  /**
   * Stop ping interval
   */
  stopHostPing: () => {
    const { pingInterval } = get();
    if (pingInterval) {
      clearInterval(pingInterval);
      set({ pingInterval: null });
    }
  },

  /**
   * Handle pong from client (host)
   */
  handlePong: (peerId: string, timestamp: number) => {
    const { peerStatuses } = get();
    const now = Date.now();
    const latency = now - timestamp;

    const existing = peerStatuses.get(peerId);
    const quality = calculateQuality(latency, true);

    peerStatuses.set(peerId, {
      peerId,
      lastPingAt: existing?.lastPingAt ?? now,
      lastPongAt: now,
      latency,
      isConnected: true,
      quality,
    });

    set({ peerStatuses: new Map(peerStatuses) });
  },

  /**
   * Handle ping from host (client)
   */
  handlePing: (hostPeerId: string, timestamp: number) => {
    const now = Date.now();
    const latency = now - timestamp;
    const quality = calculateQuality(latency, true);

    set({
      hostStatus: {
        peerId: hostPeerId,
        lastPingAt: now,
        lastPongAt: now,
        latency,
        isConnected: true,
        quality,
      },
    });

    // Send pong back
    import("@/src/infrastructure/p2p/peerManager").then(({ peerManager }) => {
      peerManager.send(hostPeerId, "pong", { timestamp });
    });
  },

  /**
   * Update host status
   */
  updateHostStatus: (status: Partial<PeerConnectionStatus>) => {
    const { hostStatus } = get();
    if (hostStatus) {
      set({
        hostStatus: { ...hostStatus, ...status },
      });
    }
  },

  /**
   * Check for connection timeouts
   */
  checkTimeouts: () => {
    const { peerStatuses, hostStatus, timeoutMs } = get();
    const now = Date.now();

    // Check host status (for clients)
    if (hostStatus) {
      const timeSinceLastPing = now - hostStatus.lastPingAt;
      if (timeSinceLastPing > timeoutMs && hostStatus.isConnected) {
        set({
          hostStatus: {
            ...hostStatus,
            isConnected: false,
            quality: "disconnected",
          },
        });
      }
    }

    // Check peer statuses (for host)
    let hasChanges = false;
    peerStatuses.forEach((status, peerId) => {
      const timeSinceLastPong = now - status.lastPongAt;
      if (timeSinceLastPong > timeoutMs && status.isConnected) {
        peerStatuses.set(peerId, {
          ...status,
          isConnected: false,
          quality: "disconnected",
        });
        hasChanges = true;
      }
    });

    if (hasChanges) {
      set({ peerStatuses: new Map(peerStatuses) });
    }
  },

  /**
   * Get connection quality
   */
  getQuality: (latency: number, isConnected: boolean) => {
    return calculateQuality(latency, isConnected);
  },

  /**
   * Reset store
   */
  reset: () => {
    const { pingInterval } = get();
    if (pingInterval) {
      clearInterval(pingInterval);
    }
    set({
      ...initialState,
      peerStatuses: new Map(),
    });
  },
}));
