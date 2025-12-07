"use client";

import { soundService } from "@/src/infrastructure/audio/soundService";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type GameBgmStyle =
  | "adventure"
  | "battle"
  | "castle"
  | "tavern"
  | "tension";

interface SoundState {
  // State
  enabled: boolean;
  volume: number;
  bgmVolume: number;
  bgmPlaying: boolean;
  gameBgmStyle: GameBgmStyle;

  // Actions
  syncToService: () => void;
  toggleSound: () => void;
  updateVolume: (volume: number) => void;
  updateBgmVolume: (volume: number) => void;
  startBgm: (type?: "waiting" | "game") => void;
  stopBgm: () => void;
  toggleBgm: (type?: "waiting" | "game") => void;
  setGameBgmStyle: (style: GameBgmStyle) => void;

  // Sound effects
  playClick: () => void;
  playPlaceMark: () => void;
  playTurnStart: () => void;
  playWin: () => void;
  playLose: () => void;
  playDraw: () => void;
  playGameStart: () => void;
  playError: () => void;
  playHover: () => void;
  playPlayerJoin: () => void;
  playPlayerReady: () => void;
  playCountdown: () => void;
  playChat: () => void;
}

export const useSoundStore = create<SoundState>()(
  persist(
    (set, get) => ({
      // Initial state
      enabled: true,
      volume: 0.3,
      bgmVolume: 0.15,
      bgmPlaying: false,
      gameBgmStyle: "tavern",

      // Sync state to soundService
      syncToService: () => {
        const { enabled, volume, bgmVolume, gameBgmStyle } = get();
        soundService.setEnabled(enabled);
        soundService.setVolume(volume);
        soundService.setBgmVolume(bgmVolume);
        soundService.setGameBgmStyle(gameBgmStyle);
      },

      // Toggle sound on/off
      toggleSound: () => {
        const newEnabled = !get().enabled;
        soundService.setEnabled(newEnabled);
        set({ enabled: newEnabled });

        if (!newEnabled) {
          soundService.stopBgm();
          set({ bgmPlaying: false });
        }
      },

      // Update volume
      updateVolume: (volume: number) => {
        soundService.setVolume(volume);
        set({ volume });
      },

      // Update BGM volume
      updateBgmVolume: (volume: number) => {
        soundService.setBgmVolume(volume);
        set({ bgmVolume: volume });
      },

      // Start BGM
      startBgm: (type: "waiting" | "game" = "game") => {
        if (!get().enabled) return;
        soundService.startBgm(type);
        set({ bgmPlaying: true });
      },

      // Stop BGM
      stopBgm: () => {
        soundService.stopBgm();
        set({ bgmPlaying: false });
      },

      // Toggle BGM
      toggleBgm: (type?: "waiting" | "game") => {
        if (get().bgmPlaying) {
          get().stopBgm();
        } else {
          get().startBgm(type);
        }
      },

      // Set BGM style
      setGameBgmStyle: (style: GameBgmStyle) => {
        soundService.setGameBgmStyle(style);
        set({ gameBgmStyle: style });
      },

      // Sound effects
      playClick: () => soundService.play("click"),
      playPlaceMark: () => soundService.play("placeMark"),
      playTurnStart: () => soundService.play("turnStart"),
      playWin: () => soundService.play("win"),
      playLose: () => soundService.play("lose"),
      playDraw: () => soundService.play("draw"),
      playGameStart: () => soundService.play("gameStart"),
      playError: () => soundService.play("error"),
      playHover: () => soundService.play("hover"),
      playPlayerJoin: () => soundService.play("playerJoin"),
      playPlayerReady: () => soundService.play("playerReady"),
      playCountdown: () => soundService.play("countdown"),
      playChat: () => soundService.play("chat"),
    }),
    {
      name: "sound-settings",
      // Only persist these fields
      partialize: (state) => ({
        enabled: state.enabled,
        volume: state.volume,
        bgmVolume: state.bgmVolume,
        gameBgmStyle: state.gameBgmStyle,
      }),
      // Sync to soundService after rehydration
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.syncToService();
        }
      },
    }
  )
);

/**
 * Hook wrapper for components
 */
export function useSound() {
  const store = useSoundStore();

  return {
    // State
    enabled: store.enabled,
    volume: store.volume,
    bgmVolume: store.bgmVolume,
    bgmPlaying: store.bgmPlaying,
    gameBgmStyle: store.gameBgmStyle,

    // Actions
    toggleSound: store.toggleSound,
    updateVolume: store.updateVolume,
    updateBgmVolume: store.updateBgmVolume,
    startBgm: store.startBgm,
    startGameBgm: () => store.startBgm("game"),
    stopBgm: store.stopBgm,
    toggleBgm: store.toggleBgm,
    setGameBgmStyle: store.setGameBgmStyle,

    // Sound effects
    playClick: store.playClick,
    playPlaceMark: store.playPlaceMark,
    playTurnStart: store.playTurnStart,
    playWin: store.playWin,
    playLose: store.playLose,
    playDraw: store.playDraw,
    playGameStart: store.playGameStart,
    playError: store.playError,
    playHover: store.playHover,
    playPlayerJoin: store.playPlayerJoin,
    playPlayerReady: store.playPlayerReady,
    playCountdown: store.playCountdown,
    playChat: store.playChat,
  };
}
