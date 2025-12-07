"use client";

import { ChatHUD } from "@/src/presentation/components/game/ChatHUD";
import { GameCanvas } from "@/src/presentation/components/game/GameCanvas";
import { GameLayout } from "@/src/presentation/components/game/GameLayout";
import { useDevicePerformance } from "@/src/presentation/hooks/useDevicePerformance";
import { useTicTacToeGame } from "@/src/presentation/hooks/useTicTacToeGame";
import {
  Frown,
  Handshake,
  Monitor,
  RotateCcw,
  Smartphone,
  Trophy,
} from "lucide-react";
import { useState } from "react";
import { TicTacToe2D } from "./TicTacToe2D";
import { TicTacToe3D } from "./TicTacToe3D";

/**
 * Tic Tac Toe Game View
 * Supports both 3D (WebGL) and 2D (HTML) rendering based on device performance
 */
export function TicTacToeView() {
  // Game logic hook
  const {
    room,
    gameState,
    isHost,
    isPlaying,
    isMyTurn,
    myMark,
    currentTurnPlayer,
    showResult,
    setShowResult,
    board,
    winningLine,
    handleCellClick,
    handleRestart,
    handleLeave,
    handleCloseResult,
    getResultInfo,
  } = useTicTacToeGame();

  // Device performance detection
  const { isLowEnd, supportsWebGL } = useDevicePerformance();

  // Allow user to manually toggle render mode
  const [forceMode, setForceMode] = useState<"auto" | "3d" | "2d">("auto");

  // Determine render mode
  const shouldUse2D =
    forceMode === "2d" ||
    (forceMode === "auto" && (isLowEnd || !supportsWebGL));

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
      {/* Game Board - 3D or 2D based on device performance */}
      {shouldUse2D ? (
        <div className="absolute inset-0 bg-[#0f0f1a]">
          <TicTacToe2D
            board={board}
            winningLine={winningLine}
            isMyTurn={isMyTurn && isPlaying}
            onCellClick={handleCellClick}
          />
        </div>
      ) : (
        <GameCanvas
          cameraPosition={[0, 8, 8]}
          mobileCameraPosition={[0, 12, 10]}
          cameraFov={45}
          mobileCameraFov={55}
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
      )}

      {/* Render Mode Toggle */}
      <div className="absolute top-2 md:top-4 right-2 md:right-4 z-10">
        <div className="flex items-center gap-1 bg-surface/90 backdrop-blur-sm border border-border rounded-lg p-1">
          <button
            onClick={() => setForceMode(forceMode === "3d" ? "2d" : "3d")}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
              !shouldUse2D
                ? "bg-info text-white"
                : "hover:bg-muted-light dark:hover:bg-muted-dark"
            }`}
            title="สลับโหมด 3D/2D"
          >
            {shouldUse2D ? (
              <>
                <Smartphone className="w-3 h-3" />
                <span className="hidden sm:inline">2D</span>
              </>
            ) : (
              <>
                <Monitor className="w-3 h-3" />
                <span className="hidden sm:inline">3D</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Turn Indicator Overlay - mobile responsive */}
      <div className="absolute bottom-20 md:bottom-4 left-1/2 -translate-x-1/2 pointer-events-none z-10">
        <div
          className={`px-4 md:px-6 py-2 md:py-3 rounded-full font-medium shadow-lg text-sm md:text-base ${
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

      {/* My Mark Indicator - mobile responsive */}
      <div className="absolute top-2 md:top-4 left-2 md:left-4 z-10">
        <div className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 md:py-2 rounded-lg bg-surface/90 backdrop-blur-sm border border-border">
          <span className="text-xs md:text-sm text-muted">คุณเป็น:</span>
          <span
            className={`text-lg md:text-xl font-bold ${
              myMark === "X" ? "text-error" : "text-info"
            }`}
          >
            {myMark}
          </span>
        </div>
      </div>

      {/* Chat HUD */}
      <ChatHUD />

      {/* Waiting for Host Overlay - shown when game finished, modal closed, and not host */}
      {!showResult && gameState.status === "finished" && !isHost && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-40">
          <div className="bg-surface border border-border rounded-2xl p-6 max-w-xs w-full mx-4 text-center">
            <div className="flex justify-center mb-3">
              <div className="w-12 h-12 rounded-full bg-info/10 flex items-center justify-center">
                <RotateCcw className="w-6 h-6 text-info animate-spin" />
              </div>
            </div>
            <h3 className="font-semibold mb-1">รอ Host</h3>
            <p className="text-sm text-muted mb-4">รอ Host เริ่มเกมใหม่...</p>
            <button
              onClick={() => setShowResult(true)}
              className="text-sm text-info hover:underline"
            >
              ดูผลลัพธ์อีกครั้ง
            </button>
          </div>
        </div>
      )}

      {/* Host Action Bar - shown when game finished, modal closed, and is host */}
      {!showResult && gameState.status === "finished" && isHost && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-40">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface border border-border shadow-lg">
            <span className="text-sm text-muted">เกมจบแล้ว</span>
            <button
              onClick={handleRestart}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-info text-white font-medium hover:bg-info-dark transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              เล่นใหม่
            </button>
            <button
              onClick={() => setShowResult(true)}
              className="px-4 py-2 rounded-lg border border-border hover:bg-muted-light dark:hover:bg-muted-dark transition-colors"
            >
              ดูผล
            </button>
          </div>
        </div>
      )}

      {/* Result Modal */}
      {showResult && gameState.status === "finished" && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-surface border border-border rounded-2xl p-8 max-w-sm w-full mx-4 text-center animate-in zoom-in-95">
            {(() => {
              const result = getResultInfo();
              if (!result) return null;
              return (
                <>
                  <div className="flex justify-center mb-4">
                    {result.type === "draw" && (
                      <Handshake className="w-16 h-16 text-warning" />
                    )}
                    {result.type === "win" && (
                      <Trophy className="w-16 h-16 text-warning" />
                    )}
                    {result.type === "lose" && (
                      <Frown className="w-16 h-16 text-error" />
                    )}
                  </div>
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
