/**
 * Game Category Types
 */
export type GameCategoryKey =
  | "card_games"
  | "board_games"
  | "party_games"
  | "casino"
  | "casual_multiplayer"
  | "puzzle_and_word";

export type GameSubcategoryKey =
  // Card Games
  | "classic"
  | "party_bluff"
  // Board Games
  | "strategy"
  | "party"
  | "word_and_guess"
  // Party Games
  | "social_deduction"
  | "quiz_and_challenge"
  // Casino
  | "table_games"
  | "machine_games"
  // Casual Multiplayer
  | "duel"
  | "arena"
  // Puzzle & Word
  | "word"
  | "memory_logic";

export interface GameSubcategory {
  name: string;
  games: string[];
}

export interface GameCategory {
  name: string;
  categories: Record<string, GameSubcategory>;
}

export interface GamesData {
  card_games: GameCategory;
  board_games: GameCategory;
  party_games: GameCategory;
  casino: GameCategory;
  casual_multiplayer: GameCategory;
  puzzle_and_word: GameCategory;
}

/**
 * Game metadata for display
 */
export interface GameMeta {
  slug: string;
  name: string;
  nameTh?: string;
  description?: string;
  category: GameCategoryKey;
  subcategory: string;
  minPlayers: number;
  maxPlayers: number;
  icon?: string;
  status: "available" | "coming_soon" | "maintenance";
}

/**
 * Game room state
 */
export interface GameRoom {
  id: string;
  gameSlug: string;
  hostPeerId: string;
  hostNickname: string;
  players: RoomPlayer[];
  maxPlayers: number;
  status: "waiting" | "playing" | "finished";
  createdAt: string;
}

export interface RoomPlayer {
  peerId: string;
  nickname: string;
  avatar: string;
  isHost: boolean;
  isReady: boolean;
  joinedAt: string;
}
