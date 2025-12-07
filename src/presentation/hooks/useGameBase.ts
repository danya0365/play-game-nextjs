"use client";

import { useGameStore } from "@/src/presentation/stores/gameStore";
import { useRoomStore } from "@/src/presentation/stores/roomStore";
import { useSound } from "@/src/presentation/stores/soundStore";
import { useUserStore } from "@/src/presentation/stores/userStore";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import { useConnectionStatus } from "./useConnectionStatus";

export interface GameResult {
  type: "win" | "lose" | "draw";
  title: string;
  subtitle: string;
}

/**
 * Base hook for common game logic
 * Handles room management, sound effects, and navigation
 */
export function useGameBase() {
  const router = useRouter();
  const { user } = useUserStore();
  const { room, isHost, leaveRoom } = useRoomStore();
  const { gameState, showResult, setShowResult, initGame, resetGame } =
    useGameStore();

  // Sound effects
  const {
    playTurnStart,
    playWin,
    playLose,
    playDraw,
    playGameStart,
    playClick,
    startBgm,
    stopBgm,
  } = useSound();

  // Connection status (ping-pong)
  const connectionStatus = useConnectionStatus();

  // Track previous turn for sound effects
  const prevTurnRef = useRef<string | null>(null);

  // Initialize game
  useEffect(() => {
    if (room && !gameState) {
      console.log("[GameBase] Initializing game...");
      initGame();
      playGameStart();
      startBgm("game");
    } else if (!room) {
      console.log("[GameBase] No room found, redirecting...");
      router.push("/games");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Play sound on turn change
  useEffect(() => {
    if (gameState && gameState.currentTurn !== prevTurnRef.current) {
      if (prevTurnRef.current !== null) {
        if (gameState.currentTurn === user?.id) {
          playTurnStart();
        }
      }
      prevTurnRef.current = gameState.currentTurn;
    }
  }, [gameState?.currentTurn, user?.id, playTurnStart]);

  // Play sound on game end
  useEffect(() => {
    if (gameState?.status === "finished") {
      stopBgm();
      if (gameState.winner === user?.id) {
        playWin();
      } else if (gameState.winner === null) {
        playDraw();
      } else {
        playLose();
      }
    }
  }, [
    gameState?.status,
    gameState?.winner,
    user?.id,
    playWin,
    playLose,
    playDraw,
    stopBgm,
  ]);

  // Derived state
  const isPlaying = gameState?.status === "playing";
  const isFinished = gameState?.status === "finished";
  const isMyTurn = gameState?.currentTurn === user?.id;

  // Actions
  const handleRestart = useCallback(() => {
    playClick();
    resetGame();
    startBgm("game");
  }, [playClick, resetGame, startBgm]);

  const handleLeave = useCallback(() => {
    stopBgm();
    leaveRoom();
    router.push("/games");
  }, [stopBgm, leaveRoom, router]);

  const handleCloseResult = useCallback(() => {
    setShowResult(false);
  }, [setShowResult]);

  const handleShowResult = useCallback(() => {
    setShowResult(true);
  }, [setShowResult]);

  // Get result info (to be extended by specific games)
  const getBaseResultInfo = useCallback((): GameResult | null => {
    if (!gameState || gameState.status !== "finished") return null;

    if (!gameState.winner) {
      return {
        type: "draw",
        title: "เสมอ!",
        subtitle: "ไม่มีผู้ชนะในรอบนี้",
      };
    }

    const isWinner = gameState.winner === user?.id;
    const winnerPlayer = gameState.players.find(
      (p) => p.odId === gameState.winner
    );

    return {
      type: isWinner ? "win" : "lose",
      title: isWinner ? "คุณชนะ!" : "คุณแพ้",
      subtitle: isWinner
        ? "ยินดีด้วย! คุณเป็นผู้ชนะ"
        : `${winnerPlayer?.nickname} เป็นผู้ชนะ`,
    };
  }, [gameState, user?.id]);

  // Get current turn player
  const currentTurnPlayer = gameState?.players.find(
    (p) => p.odId === gameState.currentTurn
  );

  // Get player scores
  const playerScores =
    gameState?.players.map((p) => ({
      id: p.odId,
      nickname: p.nickname,
      avatar: p.avatar,
      score: p.score,
    })) ?? [];

  return {
    // Stores
    user,
    room,
    gameState,
    isHost,

    // State
    isPlaying,
    isFinished,
    isMyTurn,
    showResult,
    currentTurnPlayer,
    playerScores,

    // Actions
    handleRestart,
    handleLeave,
    handleCloseResult,
    handleShowResult,
    getBaseResultInfo,
    setShowResult,

    // Sound
    playClick,

    // Connection status
    connectionStatus,
  };
}
