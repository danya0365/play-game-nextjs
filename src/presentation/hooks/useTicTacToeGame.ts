"use client";

import { useGameStore } from "@/src/presentation/stores/gameStore";
import { useRoomStore } from "@/src/presentation/stores/roomStore";
import { useSound } from "@/src/presentation/stores/soundStore";
import { useUserStore } from "@/src/presentation/stores/userStore";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";

/**
 * Custom hook for Tic Tac Toe game logic
 * Separates business logic from UI components
 */
export function useTicTacToeGame() {
  const router = useRouter();
  const { user } = useUserStore();
  const { room, isHost, leaveRoom } = useRoomStore();
  const {
    gameState,
    showResult,
    setShowResult,
    initGame,
    placeMark,
    resetGame,
  } = useGameStore();

  // Sound effects
  const {
    playPlaceMark,
    playTurnStart,
    playWin,
    playLose,
    playDraw,
    playGameStart,
    startBgm,
    stopBgm,
  } = useSound();

  // Track previous turn for sound effects
  const prevTurnRef = useRef<string | null>(null);

  // Initialize game
  useEffect(() => {
    if (room && !gameState) {
      console.log("[TicTacToe] Initializing game...");
      initGame();
      playGameStart();
      startBgm("game");
    } else if (!room) {
      console.log("[TicTacToe] No room found, redirecting...");
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
  const myMark = gameState?.playerX === user?.id ? "X" : "O";
  const currentTurnPlayer = gameState?.players.find(
    (p) => p.odId === gameState.currentTurn
  );

  // Actions
  const handleCellClick = useCallback(
    (index: number) => {
      if (!isMyTurn || !isPlaying) return;
      playPlaceMark();
      placeMark(index);
    },
    [isMyTurn, isPlaying, playPlaceMark, placeMark]
  );

  const handleRestart = useCallback(() => {
    resetGame();
    startBgm("game");
  }, [resetGame, startBgm]);

  const handleLeave = useCallback(() => {
    stopBgm();
    leaveRoom();
    router.push("/games");
  }, [stopBgm, leaveRoom, router]);

  const handleCloseResult = useCallback(() => {
    setShowResult(false);
  }, [setShowResult]);

  // Result info
  const getResultInfo = useCallback(() => {
    if (!gameState) return null;

    if (!gameState.winner) {
      return {
        type: "draw" as const,
        title: "เสมอ!",
        subtitle: "ไม่มีผู้ชนะในรอบนี้",
        isWin: false,
      };
    }

    const isWinner = gameState.winner === user?.id;
    const winnerPlayer = gameState.players.find(
      (p) => p.odId === gameState.winner
    );

    return {
      type: isWinner ? ("win" as const) : ("lose" as const),
      title: isWinner ? "คุณชนะ!" : "คุณแพ้",
      subtitle: isWinner
        ? "ยินดีด้วย! คุณเป็นผู้ชนะ"
        : `${winnerPlayer?.nickname} เป็นผู้ชนะ`,
      isWin: isWinner,
    };
  }, [gameState, user?.id]);

  return {
    // State
    room,
    gameState,
    user,
    isHost,
    isPlaying,
    isFinished,
    isMyTurn,
    myMark,
    currentTurnPlayer,
    showResult,
    setShowResult,

    // Derived data
    board: gameState?.board ?? Array(9).fill(null),
    winningLine: gameState?.winningLine ?? null,
    players: gameState?.players ?? [],
    turnNumber: gameState?.turnNumber ?? 0,

    // Actions
    handleCellClick,
    handleRestart,
    handleLeave,
    handleCloseResult,
    getResultInfo,
  };
}
