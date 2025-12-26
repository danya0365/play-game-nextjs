"use client";

import { useDevicePerformance } from "@/src/presentation/hooks/useDevicePerformance";
import { useAIStore } from "@/src/presentation/stores/aiStore";
import { Frown, Handshake, Trophy } from "lucide-react";
import { ReactNode, useState } from "react";
import { ChatHUD } from "./ChatHUD";
import { ReconnectingOverlay } from "./ConnectionStatus";
import { GameCanvas } from "./GameCanvas";
import { GameLayout } from "./GameLayout";
import {
    GameResult,
    GameResultModal,
    GameStatus,
    HostActionBar,
    PlayerIndicator,
    PlayerScore,
    RenderModeToggle,
    WaitingOverlay,
} from "./GameOverlays";

/**
 * Props for GameViewBase
 */
export interface GameViewBaseProps {
  // Game info
  gameName: string;
  roomCode?: string;

  // Players
  players: PlayerScore[];
  currentTurnPlayer?: { nickname: string };
  isHost: boolean;

  // Game state
  isMyTurn: boolean;
  isPlaying: boolean;
  isFinished: boolean;
  showResult: boolean;
  turnNumber?: number;

  // Player symbol/role
  mySymbol?: string;
  symbolColor?: "error" | "info" | "success" | "warning";

  // Result
  result?: GameResult | null;

  // Actions
  onCellClick?: (index: number) => void;
  onRestart: () => void;
  onLeave: () => void;
  onCloseResult: () => void;
  onShowResult: () => void;

  // 3D Canvas settings
  cameraPosition?: [number, number, number];
  mobileCameraPosition?: [number, number, number];
  cameraFov?: number;
  mobileCameraFov?: number;
  backgroundColor?: string;

  // Render content
  render2D: ReactNode;
  render3D: ReactNode;

  // Optional: force render mode
  forceRenderMode?: "2d" | "3d";
}

/**
 * GameViewBase - Base component for all games
 * Handles 2D/3D switching, overlays, and common UI
 */
export function GameViewBase({
  gameName,
  roomCode,
  players,
  currentTurnPlayer,
  isHost,
  isMyTurn,
  isPlaying,
  isFinished,
  showResult,
  turnNumber,
  mySymbol,
  symbolColor = "info",
  result,
  onRestart,
  onLeave,
  onCloseResult,
  onShowResult,
  cameraPosition = [0, 8, 8],
  mobileCameraPosition = [0, 12, 10],
  cameraFov = 45,
  mobileCameraFov = 55,
  backgroundColor = "#0f0f1a",
  render2D,
  render3D,
  forceRenderMode,
}: GameViewBaseProps) {
  // Device performance detection
  const { isLowEnd, supportsWebGL } = useDevicePerformance();

  // AI state (used by GameStatus)
  const {
    enabled: isAIEnabled,
    aiPlayer,
    difficulty: aiDifficulty,
  } = useAIStore();

  // Get opponent name (AI or real player)
  const opponentName =
    isAIEnabled && aiPlayer ? aiPlayer.nickname : currentTurnPlayer?.nickname;

  // AI difficulty label
  const aiDifficultyLabel =
    aiDifficulty === "easy"
      ? "ง่าย"
      : aiDifficulty === "medium"
      ? "ปานกลาง"
      : "ยาก";

  // Render mode state
  const [renderMode, setRenderMode] = useState<"auto" | "3d" | "2d">(
    forceRenderMode ?? "auto"
  );

  // Determine if should use 2D
  // Default: 2D for all modes (auto defaults to 2D, user can toggle to 3D)
  const shouldUse2D =
    renderMode === "2d" ||
    renderMode === "auto" ||
    (renderMode === "3d" && (isLowEnd || !supportsWebGL));

  // Toggle render mode
  const handleToggleRenderMode = () => {
    setRenderMode((prev) => {
      if (prev === "auto" || prev === "3d") return "2d";
      return "3d";
    });
  };

  // Get result icon
  const getResultIcon = () => {
    if (!result) return null;
    switch (result.type) {
      case "draw":
        return <Handshake className="w-16 h-16 text-warning" />;
      case "win":
        return <Trophy className="w-16 h-16 text-warning" />;
      case "lose":
        return <Frown className="w-16 h-16 text-error" />;
    }
  };

  return (
    <GameLayout
      gameName={gameName}
      roomCode={roomCode}
      players={players.map((p) => ({
        id: p.id,
        nickname: p.nickname,
        avatar: p.avatar,
        score: p.score,
        isActive: false, // Will be set by game-specific logic
      }))}
      onLeave={onLeave}
      onRestart={onRestart}
      showRestart={isHost && isFinished}
    >
      {/* Game Board - 2D or 3D */}
      {shouldUse2D ? (
        <div className="absolute inset-0" style={{ backgroundColor }}>
          {render2D}
        </div>
      ) : (
        <GameCanvas
          cameraPosition={cameraPosition}
          mobileCameraPosition={mobileCameraPosition}
          cameraFov={cameraFov}
          mobileCameraFov={mobileCameraFov}
          enableOrbit={true}
          backgroundColor={backgroundColor}
        >
          {render3D}
        </GameCanvas>
      )}

      {/* Render Mode Toggle */}
      <RenderModeToggle is2D={shouldUse2D} onToggle={handleToggleRenderMode} />

      {/* Game Status Bar */}
      {isPlaying && (
        <GameStatus
          turnNumber={turnNumber}
          isMyTurn={isMyTurn}
          mySymbol={mySymbol}
          opponentName={opponentName}
          isAIEnabled={isAIEnabled}
          aiDifficulty={aiDifficultyLabel}
        />
      )}

      {/* Player Symbol Indicator */}
      {mySymbol && (
        <PlayerIndicator symbol={mySymbol} symbolColor={symbolColor} />
      )}

      {/* Chat HUD */}
      <ChatHUD />

      {/* Connection Status is now in GameLayout header */}

      {/* Reconnecting Overlay */}
      <ReconnectingOverlay />

      {/* Waiting for Host Overlay */}
      {!showResult && isFinished && !isHost && (
        <WaitingOverlay onViewResult={onShowResult} />
      )}

      {/* Host Action Bar */}
      {!showResult && isFinished && isHost && (
        <HostActionBar onRestart={onRestart} onViewResult={onShowResult} />
      )}

      {/* Result Modal */}
      {showResult && isFinished && result && (
        <GameResultModal
          result={result}
          players={players}
          isHost={isHost}
          icon={getResultIcon()}
          onRestart={onRestart}
          onClose={onCloseResult}
        />
      )}
    </GameLayout>
  );
}
