/**
 * ไพ่แคง (Kaeng) Game State Types
 * Thai card game where players compete for best 3-card hand
 */

import type { BaseGameState, GamePlayer } from "./gameState";

// Card suits (same as Pok Deng)
export type CardSuit = "hearts" | "diamonds" | "clubs" | "spades";

// Card ranks
export type CardRank =
  | "A"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "J"
  | "Q"
  | "K";

// Card representation
export interface KaengCard {
  suit: CardSuit;
  rank: CardRank;
}

// Hand types in order of priority (highest to lowest)
export type KaengHandType =
  | "tong" // ตอง (Three of a Kind) - highest
  | "kaeng_sam_lo" // แคงสามโล (A-2-3 same suit)
  | "kaeng" // แคง (Three cards same suit)
  | "sam_lo" // สามโล (A-2-3 different suits)
  | "riang" // เรียง (Straight)
  | "song_kaeng" // สองแคง (Two cards same suit + one different)
  | "normal"; // ธรรมดา (Normal points)

// Hand result
export interface KaengHand {
  cards: KaengCard[];
  points: number; // 0-9 (sum mod 10)
  handType: KaengHandType;
  highCard: number; // For tie-breaking
}

// Game phase
export type KaengPhase =
  | "betting" // Players place bets
  | "dealing" // Cards being dealt
  | "playing" // Players look at cards
  | "revealing" // Show all cards
  | "finished"; // Round complete

// Game log entry for showing step-by-step progress
export interface KaengLogEntry {
  id: number;
  timestamp: number;
  type:
    | "game_start"
    | "dealing"
    | "dealt"
    | "player_action"
    | "reveal"
    | "result";
  message: string;
  playerId?: string;
  playerName?: string;
}

// Player hand state
export interface KaengPlayerHand {
  playerId: string;
  cards: KaengCard[];
  bet: number;
  hasRevealed: boolean;
  result?: "win" | "lose" | "tie";
  payout?: number;
}

// Extend BaseGameState
export interface KaengState extends BaseGameState {
  // Banker info
  banker: string; // Banker player ID

  // Player hands
  playerHands: KaengPlayerHand[];

  // All cards revealed
  allCardsRevealed: boolean;

  // Game phase
  phase: KaengPhase;

  // Current player revealing
  currentPlayerIndex: number;

  // Deck
  deck: KaengCard[];

  // Round number
  roundNumber: number;

  // Pot amount
  potAmount: number;

  // Game log for step-by-step display
  gameLog: KaengLogEntry[];
}

// Actions
export interface KaengAction {
  type: "reveal" | "fold";
  playerId: string;
  timestamp: number;
}

// Constants
export const DEFAULT_BET = 10;
export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 5;
export const CARDS_PER_PLAYER = 3;

// Card value for points calculation
export function getCardValue(rank: CardRank): number {
  switch (rank) {
    case "A":
      return 1;
    case "2":
      return 2;
    case "3":
      return 3;
    case "4":
      return 4;
    case "5":
      return 5;
    case "6":
      return 6;
    case "7":
      return 7;
    case "8":
      return 8;
    case "9":
      return 9;
    case "10":
    case "J":
    case "Q":
    case "K":
      return 0;
  }
}

// Card rank for comparison (A=14, K=13, Q=12, J=11, 10-2)
export function getCardRankValue(rank: CardRank): number {
  switch (rank) {
    case "A":
      return 14;
    case "K":
      return 13;
    case "Q":
      return 12;
    case "J":
      return 11;
    case "10":
      return 10;
    case "9":
      return 9;
    case "8":
      return 8;
    case "7":
      return 7;
    case "6":
      return 6;
    case "5":
      return 5;
    case "4":
      return 4;
    case "3":
      return 3;
    case "2":
      return 2;
  }
}

/**
 * Create a standard 52-card deck
 */
export function createDeck(): KaengCard[] {
  const suits: CardSuit[] = ["hearts", "diamonds", "clubs", "spades"];
  const ranks: CardRank[] = [
    "A",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "J",
    "Q",
    "K",
  ];

  const deck: KaengCard[] = [];
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ suit, rank });
    }
  }

  // Shuffle deck
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
}

/**
 * Get card display string for logging
 */
export function getCardString(card: KaengCard): string {
  const suitSymbols: Record<CardSuit, string> = {
    hearts: "♥",
    diamonds: "♦",
    clubs: "♣",
    spades: "♠",
  };
  return `${card.rank}${suitSymbols[card.suit]}`;
}

/**
 * Get card display for UI
 */
export function getCardDisplay(card: KaengCard): {
  rank: string;
  suit: string;
  color: "red" | "black";
} {
  const suitSymbols: Record<CardSuit, string> = {
    hearts: "♥",
    diamonds: "♦",
    clubs: "♣",
    spades: "♠",
  };

  const color: "red" | "black" =
    card.suit === "hearts" || card.suit === "diamonds" ? "red" : "black";

  return {
    rank: card.rank,
    suit: suitSymbols[card.suit],
    color,
  };
}

/**
 * Calculate points from cards (sum mod 10)
 */
export function calculatePoints(cards: KaengCard[]): number {
  const sum = cards.reduce((total, card) => total + getCardValue(card.rank), 0);
  return sum % 10;
}

/**
 * Check if all cards are same suit (แคง)
 */
export function isSameSuit(cards: KaengCard[]): boolean {
  if (cards.length < 3) return false;
  return cards.every((card) => card.suit === cards[0].suit);
}

/**
 * Check if cards form a straight (เรียง)
 */
export function isStraight(cards: KaengCard[]): boolean {
  if (cards.length < 3) return false;

  const ranks = cards
    .map((c) => getCardRankValue(c.rank))
    .sort((a, b) => a - b);

  // Check normal straight
  if (ranks[2] - ranks[1] === 1 && ranks[1] - ranks[0] === 1) {
    return true;
  }

  // Check A-2-3 (ranks would be [2, 3, 14])
  if (ranks[0] === 2 && ranks[1] === 3 && ranks[2] === 14) {
    return true;
  }

  // Check Q-K-A
  if (ranks[0] === 12 && ranks[1] === 13 && ranks[2] === 14) {
    return true;
  }

  return false;
}

/**
 * Check if cards are three of a kind (ตอง)
 */
export function isThreeOfAKind(cards: KaengCard[]): boolean {
  if (cards.length < 3) return false;
  return cards[0].rank === cards[1].rank && cards[1].rank === cards[2].rank;
}

/**
 * Check if A-2-3 (สามโล)
 */
export function isSamLo(cards: KaengCard[]): boolean {
  if (cards.length < 3) return false;
  const ranks = cards.map((c) => c.rank).sort();
  return ranks.includes("A") && ranks.includes("2") && ranks.includes("3");
}

/**
 * Count cards with same suit
 */
export function countSameSuit(cards: KaengCard[]): number {
  const suitCounts: Record<CardSuit, number> = {
    hearts: 0,
    diamonds: 0,
    clubs: 0,
    spades: 0,
  };

  cards.forEach((card) => {
    suitCounts[card.suit]++;
  });

  return Math.max(...Object.values(suitCounts));
}

/**
 * Evaluate a hand and return its type and value
 */
export function evaluateHand(cards: KaengCard[]): KaengHand {
  const points = calculatePoints(cards);
  const highCard = Math.max(...cards.map((c) => getCardRankValue(c.rank)));

  // Check for special hands in order of priority
  if (isThreeOfAKind(cards)) {
    return { cards, points: 10, handType: "tong", highCard };
  }

  const sameSuit = isSameSuit(cards);
  const samLo = isSamLo(cards);

  if (sameSuit && samLo) {
    return { cards, points: 10, handType: "kaeng_sam_lo", highCard };
  }

  if (sameSuit) {
    return { cards, points, handType: "kaeng", highCard };
  }

  if (samLo) {
    return { cards, points: 10, handType: "sam_lo", highCard };
  }

  if (isStraight(cards)) {
    return { cards, points, handType: "riang", highCard };
  }

  // Check for 2 cards same suit
  if (countSameSuit(cards) === 2) {
    return { cards, points, handType: "song_kaeng", highCard };
  }

  return { cards, points, handType: "normal", highCard };
}

/**
 * Get hand type priority (higher = better)
 */
export function getHandTypePriority(type: KaengHandType): number {
  switch (type) {
    case "tong":
      return 100;
    case "kaeng_sam_lo":
      return 90;
    case "kaeng":
      return 80;
    case "sam_lo":
      return 70;
    case "riang":
      return 60;
    case "song_kaeng":
      return 50;
    case "normal":
      return 0;
  }
}

/**
 * Compare two hands, returns positive if hand1 wins, negative if hand2 wins, 0 if tie
 */
export function compareHands(hand1: KaengHand, hand2: KaengHand): number {
  const priority1 = getHandTypePriority(hand1.handType);
  const priority2 = getHandTypePriority(hand2.handType);

  // Compare hand types first
  if (priority1 !== priority2) {
    return priority1 - priority2;
  }

  // For same hand type, compare points (for non-special hands)
  if (hand1.handType === "normal" || hand1.handType === "song_kaeng") {
    if (hand1.points !== hand2.points) {
      return hand1.points - hand2.points;
    }
  }

  // Compare high card for tie-breaker
  return hand1.highCard - hand2.highCard;
}

/**
 * Get display name for hand type
 */
export function getHandTypeName(type: KaengHandType): string {
  switch (type) {
    case "tong":
      return "ตอง";
    case "kaeng_sam_lo":
      return "แคงสามโล";
    case "kaeng":
      return "แคง";
    case "sam_lo":
      return "สามโล";
    case "riang":
      return "เรียง";
    case "song_kaeng":
      return "สองแคง";
    case "normal":
      return "ธรรมดา";
  }
}

/**
 * Create initial game state
 */
export function createKaengState(
  roomId: string,
  players: GamePlayer[],
  aiPlayer?: GamePlayer | null
): KaengState {
  // Add AI player if provided and needed
  const allPlayers =
    aiPlayer && players.length < MIN_PLAYERS
      ? [...players, aiPlayer]
      : [...players];

  // Ensure minimum players
  if (allPlayers.length < MIN_PLAYERS) {
    throw new Error(`Need at least ${MIN_PLAYERS} players to start Kaeng`);
  }

  // Randomly select banker
  const shuffled = [...allPlayers].sort(() => Math.random() - 0.5);
  const banker = shuffled[0].odId;
  const bankerPlayer = shuffled[0];
  const bankerName = bankerPlayer.nickname;

  // Create deck (don't deal yet)
  const deck = createDeck();

  // Initialize empty hands for all players
  const playerHands: KaengPlayerHand[] = allPlayers.map((player) => ({
    playerId: player.odId,
    cards: [],
    bet: DEFAULT_BET,
    hasRevealed: false,
  }));

  // Player names for log
  const playerNames = allPlayers.map((p) => p.nickname);

  // Initial game log
  const gameLog: KaengLogEntry[] = [
    {
      id: 1,
      timestamp: Date.now(),
      type: "game_start",
      message: `🎮 เริ่มเกมใหม่! รอบที่ 1`,
    },
    {
      id: 2,
      timestamp: Date.now(),
      type: "game_start",
      message: `👑 ${bankerName} เป็นเจ้ามือ`,
      playerId: banker,
      playerName: bankerName,
    },
    {
      id: 3,
      timestamp: Date.now(),
      type: "game_start",
      message: `🎯 ผู้เล่น: ${playerNames.join(", ")}`,
    },
    {
      id: 4,
      timestamp: Date.now(),
      type: "dealing",
      message: `🃏 กำลังแจกไพ่...`,
    },
  ];

  return {
    gameId: `kaeng_${Date.now()}`,
    roomId,
    status: "playing",
    currentTurn: banker, // Banker starts
    turnNumber: 1,
    winner: null,
    players: allPlayers,
    startedAt: Date.now(),
    lastActionAt: Date.now(),
    banker,
    playerHands,
    allCardsRevealed: false,
    phase: "dealing",
    currentPlayerIndex: 0,
    deck,
    roundNumber: 1,
    potAmount: DEFAULT_BET * allPlayers.length,
    gameLog,
  };
}

/**
 * Deal cards to all players
 */
export function dealCards(state: KaengState): KaengState {
  if (state.phase !== "dealing") return state;

  const newDeck = [...state.deck];
  const newLogEntries: KaengLogEntry[] = [];
  let logId = state.gameLog.length + 1;

  // Deal 3 cards to each player
  const newPlayerHands = state.playerHands.map((hand) => {
    const cards: KaengCard[] = [];
    for (let i = 0; i < CARDS_PER_PLAYER; i++) {
      if (newDeck.length > 0) {
        cards.push(newDeck.pop()!);
      }
    }
    return {
      ...hand,
      cards,
    };
  });

  // Log dealing complete
  newLogEntries.push({
    id: logId++,
    timestamp: Date.now(),
    type: "dealt",
    message: `✅ แจกไพ่ครบแล้ว!`,
  });

  // Log each player's cards (hidden details)
  newPlayerHands.forEach((hand) => {
    const player = state.players.find((p) => p.odId === hand.playerId);
    const playerName = player?.nickname || "ผู้เล่น";
    const isBanker = hand.playerId === state.banker;

    newLogEntries.push({
      id: logId++,
      timestamp: Date.now(),
      type: "dealt",
      message: `${isBanker ? "👑" : "🎴"} ${playerName} ได้ไพ่ 3 ใบ`,
      playerId: hand.playerId,
      playerName,
    });
  });

  // Find first non-banker player for revealing
  const firstNonBankerIndex = newPlayerHands.findIndex(
    (h) => h.playerId !== state.banker
  );
  const firstPlayer =
    firstNonBankerIndex >= 0
      ? state.players.find(
          (p) => p.odId === newPlayerHands[firstNonBankerIndex].playerId
        )
      : null;

  if (firstPlayer) {
    newLogEntries.push({
      id: logId++,
      timestamp: Date.now(),
      type: "player_action",
      message: `⏳ ตา ${firstPlayer.nickname} เปิดไพ่...`,
      playerId: firstPlayer.odId,
      playerName: firstPlayer.nickname,
    });
  }

  return {
    ...state,
    playerHands: newPlayerHands,
    deck: newDeck,
    phase: "playing",
    currentPlayerIndex: firstNonBankerIndex >= 0 ? firstNonBankerIndex : 0,
    currentTurn:
      firstNonBankerIndex >= 0
        ? newPlayerHands[firstNonBankerIndex].playerId
        : state.banker,
    lastActionAt: Date.now(),
    gameLog: [...state.gameLog, ...newLogEntries],
  };
}

/**
 * Apply player action (reveal or fold)
 */
export function applyKaengAction(
  state: KaengState,
  action: KaengAction
): KaengState {
  const { type, playerId } = action;

  // Find player
  const playerIndex = state.playerHands.findIndex(
    (h) => h.playerId === playerId
  );
  if (playerIndex === -1) return state;

  const playerHand = state.playerHands[playerIndex];
  const player = state.players.find((p) => p.odId === playerId);
  const playerName = player?.nickname || "ผู้เล่น";

  const newPlayerHands = [...state.playerHands];
  const newLogEntries: KaengLogEntry[] = [];
  let logId = state.gameLog.length + 1;

  if (type === "reveal") {
    // Player reveals their cards
    newPlayerHands[playerIndex] = {
      ...playerHand,
      hasRevealed: true,
    };

    newLogEntries.push({
      id: logId++,
      timestamp: Date.now(),
      type: "player_action",
      message: `👀 ${playerName} เปิดไพ่`,
      playerId,
      playerName,
    });
  } else if (type === "fold") {
    // Player folds
    newPlayerHands[playerIndex] = {
      ...playerHand,
      hasRevealed: true,
      result: "lose",
      payout: -playerHand.bet,
    };

    newLogEntries.push({
      id: logId++,
      timestamp: Date.now(),
      type: "player_action",
      message: `🏳️ ${playerName} หมอบ (ยอมแพ้)`,
      playerId,
      playerName,
    });
  }

  // Find next player who hasn't revealed
  const nextPlayerIndex = newPlayerHands.findIndex(
    (h, i) => i > playerIndex && !h.hasRevealed && h.playerId !== state.banker
  );

  // Check if all non-banker players have revealed
  const allNonBankerRevealed = newPlayerHands
    .filter((h) => h.playerId !== state.banker)
    .every((h) => h.hasRevealed);

  // If all non-bankers revealed, banker reveals next
  if (allNonBankerRevealed) {
    const bankerPlayer = state.players.find((p) => p.odId === state.banker);
    const bankerName = bankerPlayer?.nickname || "เจ้ามือ";

    newLogEntries.push({
      id: logId++,
      timestamp: Date.now(),
      type: "player_action",
      message: `✅ ผู้เล่นทุกคนเปิดไพ่แล้ว`,
    });
    newLogEntries.push({
      id: logId++,
      timestamp: Date.now(),
      type: "player_action",
      message: `⏳ ตา ${bankerName} เปิดไพ่...`,
      playerId: state.banker,
      playerName: bankerName,
    });

    return {
      ...state,
      playerHands: newPlayerHands,
      currentPlayerIndex: state.playerHands.findIndex(
        (h) => h.playerId === state.banker
      ),
      currentTurn: state.banker,
      phase: "revealing",
      lastActionAt: Date.now(),
      gameLog: [...state.gameLog, ...newLogEntries],
    };
  }

  // Move to next player
  if (nextPlayerIndex >= 0) {
    const nextPlayer = state.players.find(
      (p) => p.odId === newPlayerHands[nextPlayerIndex].playerId
    );
    const nextName = nextPlayer?.nickname || "ผู้เล่น";

    newLogEntries.push({
      id: logId++,
      timestamp: Date.now(),
      type: "player_action",
      message: `⏳ ตา ${nextName} เปิดไพ่...`,
      playerId: nextPlayer?.odId,
      playerName: nextName,
    });

    return {
      ...state,
      playerHands: newPlayerHands,
      currentPlayerIndex: nextPlayerIndex,
      currentTurn: newPlayerHands[nextPlayerIndex].playerId,
      lastActionAt: Date.now(),
      gameLog: [...state.gameLog, ...newLogEntries],
    };
  }

  return {
    ...state,
    playerHands: newPlayerHands,
    lastActionAt: Date.now(),
    gameLog: [...state.gameLog, ...newLogEntries],
  };
}

/**
 * Banker reveals and calculate results
 */
export function revealAndCalculate(state: KaengState): KaengState {
  if (state.phase !== "revealing") return state;

  const newLogEntries: KaengLogEntry[] = [];
  let logId = state.gameLog.length + 1;

  // Get banker info
  const bankerPlayer = state.players.find((p) => p.odId === state.banker);
  const bankerName = bankerPlayer?.nickname || "เจ้ามือ";
  const bankerHandIndex = state.playerHands.findIndex(
    (h) => h.playerId === state.banker
  );
  const bankerHand = state.playerHands[bankerHandIndex];
  const bankerEval = evaluateHand(bankerHand.cards);

  // Log banker reveal with details
  newLogEntries.push({
    id: logId++,
    timestamp: Date.now(),
    type: "reveal",
    message: `👑 ${bankerName} เปิดไพ่: ${bankerHand.cards
      .map((c) => getCardString(c))
      .join(" ")} = ${getHandTypeName(bankerEval.handType)}${
      bankerEval.handType === "normal" ? ` (${bankerEval.points} แต้ม)` : ""
    }`,
    playerId: state.banker,
    playerName: bankerName,
  });

  // Calculate results for each player
  const finalPlayerHands = state.playerHands.map((hand) => {
    // Skip banker
    if (hand.playerId === state.banker) {
      return { ...hand, hasRevealed: true };
    }

    // Skip folded players
    if (hand.result === "lose") {
      return hand;
    }

    const playerEval = evaluateHand(hand.cards);
    const comparison = compareHands(playerEval, bankerEval);
    const player = state.players.find((p) => p.odId === hand.playerId);
    const playerName = player?.nickname || "ผู้เล่น";

    let result: "win" | "lose" | "tie";
    let payout = 0;
    let resultEmoji = "";
    let resultText = "";

    if (comparison > 0) {
      result = "win";
      payout = hand.bet;
      resultEmoji = "🎉";
      resultText = `ชนะ +${payout}`;
    } else if (comparison < 0) {
      result = "lose";
      payout = -hand.bet;
      resultEmoji = "😢";
      resultText = `แพ้ ${payout}`;
    } else {
      result = "tie";
      payout = 0;
      resultEmoji = "🤝";
      resultText = "เสมอ";
    }

    // Log player result with card details
    newLogEntries.push({
      id: logId++,
      timestamp: Date.now(),
      type: "result",
      message: `${resultEmoji} ${playerName}: ${hand.cards
        .map((c) => getCardString(c))
        .join(" ")} = ${getHandTypeName(playerEval.handType)}${
        playerEval.handType === "normal" ? ` (${playerEval.points} แต้ม)` : ""
      } → ${resultText}`,
      playerId: hand.playerId,
      playerName,
    });

    return { ...hand, result, payout, hasRevealed: true };
  });

  // Calculate banker's total payout
  const bankerPayout = -finalPlayerHands
    .filter((h) => h.playerId !== state.banker)
    .reduce((sum, h) => sum + (h.payout ?? 0), 0);

  // Update banker's result
  const bankerIdx = finalPlayerHands.findIndex(
    (h) => h.playerId === state.banker
  );
  if (bankerIdx >= 0) {
    finalPlayerHands[bankerIdx] = {
      ...finalPlayerHands[bankerIdx],
      payout: bankerPayout,
      result: bankerPayout > 0 ? "win" : bankerPayout < 0 ? "lose" : "tie",
      hasRevealed: true,
    };

    const bankerResult =
      bankerPayout > 0
        ? `🎉 ชนะ +${bankerPayout}`
        : bankerPayout < 0
        ? `😢 แพ้ ${bankerPayout}`
        : "🤝 เสมอ";

    newLogEntries.push({
      id: logId++,
      timestamp: Date.now(),
      type: "result",
      message: `👑 ${bankerName}: ${bankerResult}`,
      playerId: state.banker,
      playerName: bankerName,
    });
  }

  // Determine overall winner
  const winners = finalPlayerHands.filter((h) => h.result === "win");
  const winner = winners.length > 0 ? winners[0].playerId : null;

  // Final log
  if (winner) {
    const winnerPlayer = state.players.find((p) => p.odId === winner);
    const winnerName = winnerPlayer?.nickname || "ผู้เล่น";
    newLogEntries.push({
      id: logId++,
      timestamp: Date.now(),
      type: "result",
      message: `🏆 จบเกม! ${winnerName} ชนะ`,
    });
  } else {
    newLogEntries.push({
      id: logId++,
      timestamp: Date.now(),
      type: "result",
      message: `🏆 จบเกม!`,
    });
  }

  // Update player scores
  const updatedPlayers = state.players.map((p) => {
    const hand = finalPlayerHands.find((h) => h.playerId === p.odId);
    if (hand) {
      return {
        ...p,
        score: p.score + (hand.payout ?? 0),
      };
    }
    return p;
  });

  return {
    ...state,
    playerHands: finalPlayerHands,
    allCardsRevealed: true,
    phase: "finished",
    status: "finished",
    winner,
    players: updatedPlayers,
    lastActionAt: Date.now(),
    gameLog: [...state.gameLog, ...newLogEntries],
  };
}
