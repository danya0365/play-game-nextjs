"use client";

import type {
  CreateUserData,
  UpdateUserData,
  User,
} from "@/src/domain/types/user";
import { generateUserId, getRandomAvatar } from "@/src/domain/types/user";
import localforage from "localforage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/**
 * LocalForage configuration for user store
 */
localforage.config({
  name: "play-game-p2p",
  storeName: "user_store",
  description: "User data for P2P game platform",
});

/**
 * Custom storage adapter for zustand using localforage
 */
const localForageStorage = {
  getItem: async (name: string): Promise<string | null> => {
    const value = await localforage.getItem<string>(name);
    return value ?? null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await localforage.setItem(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await localforage.removeItem(name);
  },
};

/**
 * User Store State
 */
interface UserState {
  user: User | null;
  isHydrated: boolean;
}

/**
 * User Store Actions
 */
interface UserActions {
  createUser: (data: CreateUserData) => void;
  updateUser: (data: UpdateUserData) => void;
  deleteUser: () => void;
  setHydrated: (state: boolean) => void;
}

/**
 * User Store Type
 */
type UserStore = UserState & UserActions;

/**
 * User Store with Zustand + LocalForage persistence
 */
export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isHydrated: false,

      // Actions
      createUser: (data: CreateUserData) => {
        const now = new Date().toISOString();
        const newUser: User = {
          id: generateUserId(),
          nickname: data.nickname,
          avatar: data.avatar || getRandomAvatar(),
          createdAt: now,
          updatedAt: now,
        };
        set({ user: newUser });
      },

      updateUser: (data: UpdateUserData) => {
        const currentUser = get().user;
        if (!currentUser) return;

        const updatedUser: User = {
          ...currentUser,
          ...data,
          updatedAt: new Date().toISOString(),
        };
        set({ user: updatedUser });
      },

      deleteUser: () => {
        set({ user: null });
      },

      setHydrated: (state: boolean) => {
        set({ isHydrated: state });
      },
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => localForageStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
