"use client";

import type { GameMeta } from "@/src/domain/types/game";
import { useRoomStore } from "@/src/presentation/stores/roomStore";
import { useUserStore } from "@/src/presentation/stores/userStore";
import { ArrowRight, Loader2, Plus, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LobbyLayout } from "./LobbyLayout";

interface GameLobbyProps {
  game: GameMeta;
}

/**
 * Game Lobby Component
 * Create or join room for a specific game
 */
export function GameLobby({ game }: GameLobbyProps) {
  const router = useRouter();
  const { user, isHydrated } = useUserStore();
  const { createRoom, joinRoom, isConnecting, isJoining, joinError, setError } =
    useRoomStore();

  const [mode, setMode] = useState<"select" | "create" | "join">("select");
  const [joinCode, setJoinCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Redirect to setup if no user
  if (isHydrated && !user) {
    router.push(`/setup?redirect=/games/${game.slug}`);
    return null;
  }

  const handleCreateRoom = async () => {
    setIsCreating(true);
    setError(null);

    try {
      const room = await createRoom(game.slug, game.nameTh || game.name, {
        maxPlayers: game.maxPlayers,
        minPlayers: game.minPlayers,
      });
      router.push(`/room/${room.hostPeerId}`);
    } catch (error) {
      console.error("Failed to create room:", error);
      setError("ไม่สามารถสร้างห้องได้ กรุณาลองใหม่");
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!joinCode.trim()) {
      setError("กรุณาใส่รหัสห้อง");
      return;
    }

    setError(null);

    try {
      await joinRoom(joinCode.trim());
      router.push(`/room/${joinCode.trim()}`);
    } catch (error) {
      console.error("Failed to join room:", error);
    }
  };

  const isLoading = isConnecting || isJoining || isCreating;

  return (
    <LobbyLayout
      title={game.nameTh || game.name}
      subtitle={`${game.minPlayers}-${game.maxPlayers} ผู้เล่น`}
      backHref="/games"
    >
      <div className="h-full flex flex-col items-center justify-center px-4 py-6 sm:p-6">
        <div className="w-full max-w-md">
          {/* Game Icon */}
          <div className="text-center mb-6 sm:mb-8">
            <span className="text-5xl sm:text-7xl">{game.icon}</span>
            <h2 className="text-xl sm:text-2xl font-bold mt-3 sm:mt-4">
              {game.nameTh || game.name}
            </h2>
            <p className="text-muted mt-1">
              {game.minPlayers === game.maxPlayers
                ? `${game.minPlayers} ผู้เล่น`
                : `${game.minPlayers}-${game.maxPlayers} ผู้เล่น`}
            </p>
          </div>

          {/* Error Message */}
          {joinError && (
            <div className="mb-4 p-3 rounded-lg bg-error/10 border border-error/30 text-error text-sm text-center">
              {joinError}
            </div>
          )}

          {/* Mode Selection */}
          {mode === "select" && (
            <div className="space-y-3">
              <button
                onClick={() => setMode("create")}
                disabled={isLoading}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-info text-white font-semibold hover:bg-info-dark disabled:opacity-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Plus className="w-6 h-6" />
                  <span>สร้างห้องใหม่</span>
                </div>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => setMode("join")}
                disabled={isLoading}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-surface border border-border font-semibold hover:border-info/50 disabled:opacity-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Users className="w-6 h-6" />
                  <span>เข้าร่วมห้อง</span>
                </div>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Create Room */}
          {mode === "create" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-surface border border-border">
                <h3 className="font-semibold mb-2">สร้างห้องใหม่</h3>
                <p className="text-sm text-muted">
                  คุณจะเป็น Host ของห้อง สามารถเชิญเพื่อนมาเล่นได้
                </p>
              </div>

              <button
                onClick={handleCreateRoom}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-info text-white font-semibold hover:bg-info-dark disabled:opacity-50 transition-colors"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>กำลังสร้างห้อง...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    <span>สร้างห้อง</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setMode("select")}
                disabled={isLoading}
                className="w-full p-3 text-muted hover:text-foreground transition-colors"
              >
                ยกเลิก
              </button>
            </div>
          )}

          {/* Join Room */}
          {mode === "join" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  รหัสห้อง (Peer ID)
                </label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.trim())}
                  placeholder="วางรหัสห้องที่ได้รับจากเพื่อน"
                  disabled={isLoading}
                  className="w-full px-4 py-3 rounded-xl bg-surface border border-border focus:outline-none focus:ring-2 focus:ring-info/50 focus:border-info disabled:opacity-50 transition-colors"
                />
                <p className="text-xs text-muted mt-2">
                  ขอรหัสห้องจากเพื่อนที่สร้างห้อง
                </p>
              </div>

              <button
                onClick={handleJoinRoom}
                disabled={isLoading || !joinCode.trim()}
                className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-info text-white font-semibold hover:bg-info-dark disabled:opacity-50 transition-colors"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>กำลังเข้าร่วม...</span>
                  </>
                ) : (
                  <>
                    <Users className="w-5 h-5" />
                    <span>เข้าร่วมห้อง</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setMode("select")}
                disabled={isLoading}
                className="w-full p-3 text-muted hover:text-foreground transition-colors"
              >
                ยกเลิก
              </button>
            </div>
          )}

          {/* User Info */}
          {user && (
            <div className="mt-6 sm:mt-8 flex items-center justify-center gap-2 text-sm text-muted">
              <span>{user.avatar}</span>
              <span>เล่นในนาม</span>
              <span className="font-medium text-foreground">
                {user.nickname}
              </span>
            </div>
          )}
        </div>
      </div>
    </LobbyLayout>
  );
}
