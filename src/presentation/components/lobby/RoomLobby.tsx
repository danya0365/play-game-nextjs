"use client";

import { useAIStore } from "@/src/presentation/stores/aiStore";
import { useRoomStore } from "@/src/presentation/stores/roomStore";
import { useSound } from "@/src/presentation/stores/soundStore";
import { useUserStore } from "@/src/presentation/stores/userStore";
import {
  Check,
  Copy,
  Loader2,
  LogOut,
  Play,
  Settings,
  Share2,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AISettings } from "../game/AISettings";
import { LobbyLayout } from "./LobbyLayout";
import { EmptyPlayerSlot, PlayerCard } from "./PlayerCard";

interface RoomLobbyProps {
  hostPeerId: string;
}

/**
 * Room Lobby Component
 * Waiting room before game starts
 */
export function RoomLobby({ hostPeerId }: RoomLobbyProps) {
  const router = useRouter();
  const { user } = useUserStore();
  const {
    room,
    isHost,
    isInRoom,
    isConnecting,
    isJoining,
    joinError,
    initializePeer,
    joinRoom,
    leaveRoom,
    setReady,
    kickPlayer,
    startGame,
    setError,
  } = useRoomStore();

  const [copied, setCopied] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const { playPlayerJoin, playPlayerReady, playGameStart, startBgm, stopBgm } =
    useSound();
  const prevPlayerCountRef = useRef(0);

  // AI state - must be at top level before any returns
  const { enabled: isAIEnabled, aiPlayer } = useAIStore();

  // Start waiting BGM when entering room
  useEffect(() => {
    startBgm("waiting");
    return () => stopBgm();
  }, [startBgm, stopBgm]);

  // Play sound when player joins
  useEffect(() => {
    const currentCount = room?.players.length ?? 0;
    if (
      currentCount > prevPlayerCountRef.current &&
      prevPlayerCountRef.current > 0
    ) {
      playPlayerJoin();
    }
    prevPlayerCountRef.current = currentCount;
  }, [room?.players.length, playPlayerJoin]);

  // Redirect to game when playing
  useEffect(() => {
    if (room?.status === "playing") {
      router.push(`/play/${hostPeerId}`);
    }
  }, [room?.status, hostPeerId, router]);

  // Initialize connection and join room
  useEffect(() => {
    const init = async () => {
      if (!user) {
        router.push(`/setup?redirect=/room/${hostPeerId}`);
        return;
      }

      try {
        const myPeerId = await initializePeer();

        // If this is the host, they already have the room
        // If not, they need to join
        if (myPeerId !== hostPeerId && !isInRoom) {
          await joinRoom(hostPeerId);
        }
      } catch (error) {
        console.error("Failed to initialize:", error);
      }
    };

    init();
  }, [hostPeerId, user, initializePeer, joinRoom, isInRoom, router]);

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(hostPeerId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/room/${hostPeerId}`;
    if (navigator.share) {
      await navigator.share({
        title: `เข้าร่วมเกม ${room?.gameName}`,
        text: `มาเล่น ${room?.gameName} กันเถอะ!`,
        url: shareUrl,
      });
    } else {
      handleCopyLink();
    }
  };

  const handleLeave = () => {
    setIsLeaving(true);
    leaveRoom();
    router.push("/games");
  };

  const handleReady = () => {
    const currentPlayer = room?.players.find((p) => p.odId === user?.id);
    if (currentPlayer) {
      playPlayerReady();
      setReady(!currentPlayer.isReady);
    }
  };

  const handleStart = () => {
    playGameStart();
    stopBgm();
    setError(null);
    startGame(isAIEnabled);
  };

  const handleKick = (odId: string) => {
    kickPlayer(odId);
  };

  // Loading state
  if (isConnecting || isJoining) {
    return (
      <LobbyLayout title="กำลังเชื่อมต่อ..." showBack={false}>
        <div className="h-full flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-12 h-12 text-info animate-spin" />
          <p className="text-muted">กำลังเชื่อมต่อกับห้อง...</p>
        </div>
      </LobbyLayout>
    );
  }

  // Error state
  if (joinError && !isInRoom) {
    return (
      <LobbyLayout title="เกิดข้อผิดพลาด" backHref="/games">
        <div className="h-full flex flex-col items-center justify-center gap-4 p-4">
          <div className="text-6xl">😕</div>
          <h2 className="text-xl font-semibold">ไม่สามารถเข้าร่วมห้องได้</h2>
          <p className="text-muted text-center max-w-sm">{joinError}</p>
          <button
            onClick={() => router.push("/games")}
            className="px-6 py-2 rounded-lg bg-info text-white font-medium hover:bg-info-dark transition-colors"
          >
            กลับหน้าเกม
          </button>
        </div>
      </LobbyLayout>
    );
  }

  // Not in room yet
  if (!room || !isInRoom) {
    return (
      <LobbyLayout title="กำลังโหลด..." showBack={false}>
        <div className="h-full flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-12 h-12 text-info animate-spin" />
          <p className="text-muted">กำลังโหลดข้อมูลห้อง...</p>
        </div>
      </LobbyLayout>
    );
  }

  const currentPlayer = room.players.find((p) => p.odId === user?.id);

  // AI counts as a player
  const effectivePlayerCount = room.players.length + (isAIEnabled ? 1 : 0);
  const hasEnoughPlayers = effectivePlayerCount >= room.config.minPlayers;

  // When playing vs AI, host doesn't need others to be ready
  // Otherwise, all human players must be ready
  const allPlayersReady = isAIEnabled
    ? room.players.length === 1 || room.players.every((p) => p.isReady)
    : room.players.every((p) => p.isReady);
  const canStart = isHost && allPlayersReady && hasEnoughPlayers;

  if (room.status === "playing" || room.status === "starting") {
    return (
      <LobbyLayout title="เกมกำลังเริ่ม..." showBack={false}>
        <div className="h-full flex flex-col items-center justify-center gap-4">
          <div className="text-6xl animate-bounce">{room.gameName}</div>
          <Loader2 className="w-8 h-8 text-info animate-spin" />
          <p className="text-muted">กำลังเริ่มเกม...</p>
        </div>
      </LobbyLayout>
    );
  }

  return (
    <LobbyLayout
      title={room.gameName}
      subtitle={`รหัสห้อง: ${room.code}`}
      onBack={handleLeave}
    >
      <div className="h-full flex flex-col lg:flex-row">
        {/* Left Panel - Players */}
        <div className="flex-1 flex flex-col p-4 overflow-hidden">
          {/* Players Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-muted" />
              <span className="font-medium">
                ผู้เล่น ({effectivePlayerCount}/{room.config.maxPlayers})
              </span>
            </div>
            {isHost && (
              <button className="p-2 rounded-lg hover:bg-muted-light dark:hover:bg-muted-dark transition-colors">
                <Settings className="w-5 h-5 text-muted" />
              </button>
            )}
          </div>

          {/* Players List */}
          <div className="flex-1 overflow-y-auto space-y-2">
            {room.players.map((player) => (
              <PlayerCard
                key={player.odId}
                player={player}
                isCurrentUser={player.odId === user?.id}
                canKick={isHost && player.odId !== user?.id}
                onKick={() => handleKick(player.odId)}
              />
            ))}

            {/* AI Player Card */}
            {isAIEnabled && aiPlayer && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-info/10 border-2 border-info/30">
                <span className="text-3xl">{aiPlayer.avatar}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">
                      {aiPlayer.nickname}
                    </span>
                    <span className="shrink-0 px-2 py-0.5 rounded-full bg-info/20 text-info text-xs">
                      AI
                    </span>
                  </div>
                  <span className="text-xs text-muted">พร้อมเล่นแล้ว</span>
                </div>
                <Check className="w-5 h-5 text-success" />
              </div>
            )}

            {/* Empty Slots */}
            {Array.from({
              length: Math.max(
                0,
                room.config.maxPlayers -
                  room.players.length -
                  (isAIEnabled ? 1 : 0)
              ),
            }).map((_, i) => (
              <EmptyPlayerSlot
                key={`empty-${i}`}
                index={room.players.length + (isAIEnabled ? 1 : 0) + i}
              />
            ))}
          </div>

          {/* Status Messages */}
          {!hasEnoughPlayers && !isAIEnabled && (
            <div className="mt-4 p-3 rounded-lg bg-warning/10 border border-warning/30 text-warning text-sm text-center">
              ต้องมีผู้เล่นอย่างน้อย {room.config.minPlayers} คนถึงจะเริ่มเกมได้
            </div>
          )}
          {hasEnoughPlayers && !allPlayersReady && !isAIEnabled && (
            <div className="mt-4 p-3 rounded-lg bg-info/10 border border-info/30 text-info text-sm text-center">
              รอผู้เล่นทุกคนกดพร้อม
            </div>
          )}
          {isAIEnabled && hasEnoughPlayers && (
            <div className="mt-4 p-3 rounded-lg bg-success/10 border border-success/30 text-success text-sm text-center">
              พร้อมเล่นกับ AI แล้ว! กดเริ่มเกมได้เลย
            </div>
          )}
        </div>

        {/* Right Panel - Actions */}
        <div className="shrink-0 lg:w-80 p-4 border-t lg:border-t-0 lg:border-l border-border bg-surface">
          <div className="h-full flex flex-col gap-4">
            {/* Invite Section */}
            <div className="p-4 rounded-xl bg-background border border-border">
              <h3 className="font-semibold mb-3">เชิญเพื่อน</h3>

              {/* Room Code */}
              <div className="mb-3">
                <label className="text-xs text-muted">รหัสห้อง (Peer ID)</label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 px-3 py-2 rounded-lg bg-muted-light dark:bg-muted-dark text-sm font-mono truncate">
                    {hostPeerId}
                  </code>
                  <button
                    onClick={handleCopyLink}
                    className="shrink-0 p-2 rounded-lg bg-info/10 text-info hover:bg-info/20 transition-colors"
                    title="คัดลอก"
                  >
                    {copied ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Share Button */}
              <button
                onClick={handleShare}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-border hover:border-info/50 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span>แชร์ลิงก์</span>
              </button>
            </div>

            {/* AI Settings - Host Only */}
            {isHost && <AISettings />}

            {/* Spacer */}
            <div className="flex-1" />

            {/* Action Buttons */}
            <div className="space-y-2">
              {/* Ready Button (non-host) */}
              {!isHost && currentPlayer && (
                <button
                  onClick={handleReady}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-colors ${
                    currentPlayer.isReady
                      ? "bg-success/10 text-success border border-success/30"
                      : "bg-info text-white hover:bg-info-dark"
                  }`}
                >
                  {currentPlayer.isReady ? (
                    <>
                      <Check className="w-5 h-5" />
                      <span>พร้อมแล้ว</span>
                    </>
                  ) : (
                    <span>กดพร้อม</span>
                  )}
                </button>
              )}

              {/* Start Button (host) */}
              {isHost && (
                <button
                  onClick={handleStart}
                  disabled={!canStart}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-success text-white font-semibold hover:bg-success-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Play className="w-5 h-5" />
                  <span>เริ่มเกม</span>
                </button>
              )}

              {/* Leave Button */}
              <button
                onClick={handleLeave}
                disabled={isLeaving}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-error hover:bg-error/10 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>{isHost ? "ปิดห้อง" : "ออกจากห้อง"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </LobbyLayout>
  );
}
