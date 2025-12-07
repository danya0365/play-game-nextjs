"use client";

import { ChatHUD } from "@/src/presentation/components/game/ChatHUD";
import { GameCanvas } from "@/src/presentation/components/game/GameCanvas";
import { GameLayout } from "@/src/presentation/components/game/GameLayout";
import { useGameStore } from "@/src/presentation/stores/gameStore";
import { useRoomStore } from "@/src/presentation/stores/roomStore";
import { useUserStore } from "@/src/presentation/stores/userStore";
import { Frown, Handshake, RotateCcw, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { TicTacToe3D } from "./TicTacToe3D";

/**
 * Tic Tac Toe Game View
 */
export function TicTacToeView() {
  const router = useRouter();
  const { user } = useUserStore();
  const { room, leaveRoom, isHost } = useRoomStore();
  const {
    gameState,
    isPlaying,
    showResult,
    initGame,
    placeMark,
    resetGame,
    setShowResult,
  } = useGameStore();

  // Debug logging
  useEffect(() => {
    console.log(
      "[TicTacToe] Mount - room:",
      room,
      "gameState:",
      gameState,
      "user:",
      user
    );
  }, []);

  // Initialize game when component mounts
  useEffect(() => {
    // Initialize game if room exists and no game state yet
    if (room && !gameState) {
      console.log("[TicTacToe] Initializing game, room status:", room.status);
      initGame();
    } else if (!room) {
      console.log("[TicTacToe] No room found, redirecting...");
      // If no room, redirect back to games
      router.push("/games");
    }
  }, [room, gameState, initGame, router]);

  const handleLeave = () => {
    leaveRoom();
    router.push("/games");
  };

  const handleRestart = () => {
    if (isHost) {
      resetGame();
    }
  };

  const handleCellClick = (index: number) => {
    placeMark(index);
  };

  const handleCloseResult = () => {
    setShowResult(false);
  };

  // Loading state
  if (!room || !gameState) {
    return (
      <GameLayout gameName="โอเอ็กซ์" onLeave={handleLeave}>
        <div className="h-full flex items-center justify-center">
          <p className="text-muted">กำลังโหลดเกม...</p>
        </div>
      </GameLayout>
    );
  }

  // Determine player info
  const isMyTurn = gameState.currentTurn === user?.id;
  const myMark = gameState.playerX === user?.id ? "X" : "O";
  const currentTurnPlayer = gameState.players.find(
    (p) => p.odId === gameState.currentTurn
  );

  // Game result
  const getResultInfo = () => {
    if (!gameState.winner) {
      return {
        icon: <Handshake className="w-16 h-16 text-warning" />,
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
      icon: isWinner ? (
        <Trophy className="w-16 h-16 text-warning" />
      ) : (
        <Frown className="w-16 h-16 text-error" />
      ),
      title: isWinner ? "คุณชนะ!" : "คุณแพ้",
      subtitle: isWinner
        ? "ยินดีด้วย! คุณเป็นผู้ชนะ"
        : `${winnerPlayer?.nickname} เป็นผู้ชนะ`,
      isWin: isWinner,
    };
  };

  return (
    <GameLayout
      gameName="โอเอ็กซ์"
      roomCode={room.code}
      currentTurn={currentTurnPlayer?.nickname}
      isMyTurn={isMyTurn}
      turnNumber={gameState.turnNumber}
      players={gameState.players.map((p) => ({
        id: p.odId,
        nickname: p.nickname,
        avatar: p.avatar,
        score: p.score,
        isActive: p.odId === gameState.currentTurn,
      }))}
      onLeave={handleLeave}
      onRestart={handleRestart}
      showRestart={isHost && gameState.status === "finished"}
    >
      {/* 3D Game Canvas */}
      <GameCanvas
        cameraPosition={[0, 8, 8]}
        cameraFov={45}
        enableOrbit={true}
        backgroundColor="#0f0f1a"
      >
        <TicTacToe3D
          board={gameState.board}
          winningLine={gameState.winningLine}
          isMyTurn={isMyTurn && isPlaying}
          onCellClick={handleCellClick}
        />
      </GameCanvas>

      {/* Turn Indicator Overlay */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none">
        <div
          className={`px-6 py-3 rounded-full font-medium shadow-lg ${
            isMyTurn
              ? "bg-success text-white"
              : "bg-surface border border-border text-foreground"
          }`}
        >
          {isMyTurn ? (
            <span>ตาคุณ! ({myMark})</span>
          ) : (
            <span>รอ {currentTurnPlayer?.nickname}...</span>
          )}
        </div>
      </div>

      {/* My Mark Indicator */}
      <div className="absolute top-4 left-4">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface border border-border">
          <span className="text-sm text-muted">คุณเป็น:</span>
          <span
            className={`text-xl font-bold ${
              myMark === "X" ? "text-error" : "text-info"
            }`}
          >
            {myMark}
          </span>
        </div>
      </div>

      {/* Chat HUD */}
      <ChatHUD />

      {/* Result Modal */}
      {showResult && gameState.status === "finished" && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-surface border border-border rounded-2xl p-8 max-w-sm w-full mx-4 text-center animate-in zoom-in-95">
            {(() => {
              const result = getResultInfo();
              return (
                <>
                  <div className="flex justify-center mb-4">{result.icon}</div>
                  <h2 className="text-2xl font-bold mb-2">{result.title}</h2>
                  <p className="text-muted mb-6">{result.subtitle}</p>

                  {/* Scores */}
                  <div className="flex justify-center gap-8 mb-6">
                    {gameState.players.map((p) => (
                      <div key={p.odId} className="text-center">
                        <span className="text-3xl">{p.avatar}</span>
                        <p className="text-sm font-medium mt-1">{p.nickname}</p>
                        <p className="text-2xl font-bold text-info">
                          {p.score}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    {isHost && (
                      <button
                        onClick={handleRestart}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-info text-white font-medium hover:bg-info-dark transition-colors"
                      >
                        <RotateCcw className="w-5 h-5" />
                        เล่นอีกครั้ง
                      </button>
                    )}
                    <button
                      onClick={handleCloseResult}
                      className="flex-1 px-4 py-3 rounded-xl border border-border hover:bg-muted-light dark:hover:bg-muted-dark transition-colors"
                    >
                      ปิด
                    </button>
                  </div>

                  {!isHost && (
                    <p className="text-xs text-muted mt-4">
                      รอ Host เริ่มเกมใหม่...
                    </p>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      )}
    </GameLayout>
  );
}
