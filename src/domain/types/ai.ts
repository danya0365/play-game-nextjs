/**
 * AI Player Types
 */

export type AIDifficulty = "easy" | "medium" | "hard";

export interface AIPlayer {
  id: string;
  nickname: string;
  avatar: string;
  isAI: true;
  difficulty: AIDifficulty;
}

export interface AISettings {
  enabled: boolean;
  difficulty: AIDifficulty;
}

/**
 * AI Move Strategy Interface
 * Each game implements this to provide AI moves
 */
export interface AIStrategy<TGameState, TMove> {
  calculateMove: (gameState: TGameState, difficulty: AIDifficulty) => TMove;
}

/**
 * Default AI player info
 */
export const AI_AVATARS: Record<AIDifficulty, string> = {
  easy: "🤖",
  medium: "🧠",
  hard: "👾",
};

export const AI_NAMES: Record<AIDifficulty, string> = {
  easy: "AI ง่าย",
  medium: "AI ปานกลาง",
  hard: "AI ยาก",
};

export function createAIPlayer(difficulty: AIDifficulty): AIPlayer {
  return {
    // Use consistent ID based on difficulty only (no timestamp)
    id: `ai-player-${difficulty}`,
    nickname: AI_NAMES[difficulty],
    avatar: AI_AVATARS[difficulty],
    isAI: true,
    difficulty,
  };
}
