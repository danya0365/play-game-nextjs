/**
 * User Entity for local storage (Phase 1 - No Auth)
 */
export interface User {
  id: string;
  nickname: string;
  avatar: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserData {
  nickname: string;
  avatar?: string;
}

export interface UpdateUserData {
  nickname?: string;
  avatar?: string;
}

/**
 * Generate a random ID for user
 */
export function generateUserId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Default avatars list
 */
export const DEFAULT_AVATARS = [
  "🎮",
  "🎲",
  "🃏",
  "🎯",
  "🏆",
  "⚡",
  "🔥",
  "💎",
  "🌟",
  "🎪",
  "🦊",
  "🐼",
  "🦁",
  "🐯",
  "🐸",
  "🦄",
];

/**
 * Get random avatar
 */
export function getRandomAvatar(): string {
  return DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)];
}
