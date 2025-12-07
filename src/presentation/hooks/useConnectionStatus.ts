"use client";

import { peerManager } from "@/src/infrastructure/p2p/peerManager";
import {
  ConnectionQuality,
  useConnectionStore,
} from "@/src/presentation/stores/connectionStore";
import { useRoomStore } from "@/src/presentation/stores/roomStore";
import { useCallback, useEffect, useMemo, useRef } from "react";

interface PingPayload {
  timestamp: number;
}

interface PongPayload {
  timestamp: number;
}

/**
 * Hook for managing connection status with ping-pong
 * Automatically handles ping/pong based on host/client role
 */
export function useConnectionStatus() {
  const { isHost, isInRoom } = useRoomStore();
  const {
    hostStatus,
    peerStatuses,
    startHostPing,
    stopHostPing,
    handlePing,
    handlePong,
    checkTimeouts,
    reset,
  } = useConnectionStore();

  // Track if we've set up handlers
  const handlersSetup = useRef(false);
  const timeoutCheckInterval = useRef<NodeJS.Timeout | null>(null);

  // Setup ping/pong message handlers
  useEffect(() => {
    if (!isInRoom || handlersSetup.current) return;

    // Register ping handler (for clients)
    const unsubPing = peerManager.onMessage("ping", (message) => {
      const payload = message.payload as PingPayload;
      handlePing(message.senderId, payload.timestamp);
    });

    // Register pong handler (for hosts)
    const unsubPong = peerManager.onMessage("pong", (message) => {
      const payload = message.payload as PongPayload;
      handlePong(message.senderId, payload.timestamp);
    });

    handlersSetup.current = true;

    return () => {
      unsubPing();
      unsubPong();
      handlersSetup.current = false;
    };
  }, [isInRoom, handlePing, handlePong]);

  // Start/stop ping based on host role
  useEffect(() => {
    if (!isInRoom) {
      stopHostPing();
      reset();
      return;
    }

    if (isHost) {
      // Host: start pinging clients
      startHostPing();
    }

    // Start timeout check interval for clients
    if (!isHost && !timeoutCheckInterval.current) {
      timeoutCheckInterval.current = setInterval(() => {
        checkTimeouts();
      }, 1000);
    }

    return () => {
      if (isHost) {
        stopHostPing();
      }
      if (timeoutCheckInterval.current) {
        clearInterval(timeoutCheckInterval.current);
        timeoutCheckInterval.current = null;
      }
    };
  }, [isInRoom, isHost, startHostPing, stopHostPing, checkTimeouts, reset]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopHostPing();
      reset();
      if (timeoutCheckInterval.current) {
        clearInterval(timeoutCheckInterval.current);
      }
    };
  }, [stopHostPing, reset]);

  // Get connection status for a specific player
  const getPlayerConnectionStatus = useCallback(
    (peerId: string) => {
      if (isHost) {
        return peerStatuses.get(peerId) ?? null;
      }
      // For clients, only host status is relevant
      return hostStatus?.peerId === peerId ? hostStatus : null;
    },
    [isHost, peerStatuses, hostStatus]
  );

  // Overall connection status (for clients: connection to host)
  const connectionStatus = useMemo(() => {
    if (!isInRoom) {
      return {
        isConnected: false,
        quality: "disconnected" as ConnectionQuality,
        latency: 0,
      };
    }

    if (isHost) {
      // Host is always connected
      return {
        isConnected: true,
        quality: "excellent" as ConnectionQuality,
        latency: 0,
      };
    }

    // Client: check host status
    if (hostStatus) {
      return {
        isConnected: hostStatus.isConnected,
        quality: hostStatus.quality,
        latency: hostStatus.latency,
      };
    }

    // No host status yet - waiting for first ping
    return {
      isConnected: true, // Assume connected until proven otherwise
      quality: "good" as ConnectionQuality,
      latency: 0,
    };
  }, [isInRoom, isHost, hostStatus]);

  // Get all peer statuses (for host)
  const allPeerStatuses = useMemo(() => {
    return Array.from(peerStatuses.values());
  }, [peerStatuses]);

  // Check if any peer is disconnected (for host)
  const hasDisconnectedPeers = useMemo(() => {
    return allPeerStatuses.some((status) => !status.isConnected);
  }, [allPeerStatuses]);

  return {
    // Connection status
    isConnected: connectionStatus.isConnected,
    quality: connectionStatus.quality,
    latency: connectionStatus.latency,

    // Host-specific
    hostStatus,
    peerStatuses: allPeerStatuses,
    hasDisconnectedPeers,

    // Actions
    getPlayerConnectionStatus,
  };
}

/**
 * Get quality color for UI
 */
export function getQualityColor(quality: ConnectionQuality): string {
  switch (quality) {
    case "excellent":
      return "text-success";
    case "good":
      return "text-info";
    case "poor":
      return "text-warning";
    case "disconnected":
      return "text-error";
    default:
      return "text-muted";
  }
}

/**
 * Get quality icon
 */
export function getQualityIcon(quality: ConnectionQuality): string {
  switch (quality) {
    case "excellent":
      return "📶"; // Full signal
    case "good":
      return "📶"; // Good signal
    case "poor":
      return "📶"; // Weak signal
    case "disconnected":
      return "📵"; // No signal
    default:
      return "❓";
  }
}

/**
 * Get quality label
 */
export function getQualityLabel(quality: ConnectionQuality): string {
  switch (quality) {
    case "excellent":
      return "ดีมาก";
    case "good":
      return "ดี";
    case "poor":
      return "ไม่เสถียร";
    case "disconnected":
      return "ขาดการเชื่อมต่อ";
    default:
      return "ไม่ทราบ";
  }
}
