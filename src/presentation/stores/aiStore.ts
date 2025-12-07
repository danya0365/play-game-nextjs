"use client";

import { AIDifficulty, AIPlayer, createAIPlayer } from "@/src/domain/types/ai";
import { create } from "zustand";

interface AIState {
  // Settings
  enabled: boolean;
  difficulty: AIDifficulty;
  aiPlayer: AIPlayer | null;

  // Actions
  setEnabled: (enabled: boolean) => void;
  setDifficulty: (difficulty: AIDifficulty) => void;
  initAIPlayer: () => void;
  resetAI: () => void;
}

export const useAIStore = create<AIState>((set, get) => ({
  enabled: false,
  difficulty: "medium",
  aiPlayer: null,

  setEnabled: (enabled: boolean) => {
    set({ enabled });
    if (enabled && !get().aiPlayer) {
      get().initAIPlayer();
    } else if (!enabled) {
      set({ aiPlayer: null });
    }
  },

  setDifficulty: (difficulty: AIDifficulty) => {
    set({ difficulty });
    // Re-create AI player with new difficulty
    if (get().enabled) {
      set({ aiPlayer: createAIPlayer(difficulty) });
    }
  },

  initAIPlayer: () => {
    const { difficulty } = get();
    set({ aiPlayer: createAIPlayer(difficulty) });
  },

  resetAI: () => {
    set({
      enabled: false,
      difficulty: "medium",
      aiPlayer: null,
    });
  },
}));
