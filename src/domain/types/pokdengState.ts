/**
 * Pok Deng (ป๊อกเด้ง) Game State Types
 * Thai card game where players compete against the dealer
 */

import type { BaseGameState, GamePlayer } from "./gameState";

// Card suits
export type CardSuit = "hearts" | "diamonds" | "clubs" | "spades";

// Card ranks (A=1, 2-10, J/Q/K=10)
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
export interface PokDengCard {
  suit: CardSuit;
  rank: CardRank;
}

// Hand result
export interface PokDengHand {
  cards: PokDengCard[];
  points: number; // 0-9
  deng: number; // Multiplier 1-5
  isPok: boolean; // Natural 8 or 9 with 2 cards
  handType: PokDengHandType;
}

// Hand types in order of priority
export type PokDengHandType =
  | "pok_nine" // ป๊อกเก้า (natural 9)
  | "pok_eight" // ป๊อกแปด (natural 8)
  | "same_suit_three" // ตอง (three of a kind)
  | "straight_flush" // สเตรทฟลัช
  | "three_face" // สามหน้า (3 face cards)
  | "straight" // เรียง
  | "same_suit" // สามแต้ม (same suit)
  | "pair" // คู่
  | "normal"; // ธรรมดา

// Game phase
export type PokDengPhase =
  | "betting" // Players place bets
  | "dealing" // Cards being dealt
  | "player_turn" // Players decide to draw or stand
  | "revealing" // Show results
  | "finished"; // Round complete

// Game log entry for showing step-by-step progress
export interface PokDengLogEntry {
  id: number;
  timestamp: number;
  type:
    | "game_start"
    | "dealing"
    | "dealt"
    | "player_action"
    | "dealer_action"
    | "reveal"
    | "result";
  message: string;
  playerId?: string;
  playerName?: string;
}

// Player hand state
export interface PokDengPlayerHand {
  playerId: string;
  cards: PokDengCard[];
  bet: number;
  hasStood: boolean; // Player chose to stand
  hasDrawn: boolean; // Player drew 3rd card
  result?: "win" | "lose" | "tie";
  payout?: number;
}

// Extend BaseGameState
export interface PokDengState extends BaseGameState {
  // Dealer info
  dealer: string; // Dealer player ID
  dealerHand: PokDengCard[];
  dealerRevealed: boolean;

  // Player hands (non-dealer players)
  playerHands: PokDengPlayerHand[];

  // All cards revealed by dealer (players can see each other's cards)
  allCardsRevealed: boolean;

  // Game phase
  phase: PokDengPhase;

  // Current player making decision
  currentPlayerIndex: number;

  // Deck
  deck: PokDengCard[];

  // Round number
  roundNumber: number;

  // Game log for step-by-step display
  gameLog: PokDengLogEntry[];
}

// Actions
export interface PokDengAction {
  type: "place_bet" | "draw_card" | "stand" | "reveal";
  playerId: string;
  timestamp: number;
  data: {
    bet?: number;
  };
}

// Constants
export const MIN_BET = 10;
export const MAX_BET = 1000;
export const DEFAULT_BET = 100;

/**
 * Create a standard 52-card deck
 */
export function createDeck(): PokDengCard[] {
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

  const deck: PokDengCard[] = [];
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ suit, rank });
    }
  }

  return deck;
}

/**
 * Shuffle deck using Fisher-Yates algorithm
 */
export function shuffleDeck(deck: PokDengCard[]): PokDengCard[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Get card value for Pok Deng
 * A=1, 2-9=face value, 10/J/Q/K=0
 */
export function getCardValue(card: PokDengCard): number {
  if (card.rank === "A") return 1;
  if (["10", "J", "Q", "K"].includes(card.rank)) return 0;
  return parseInt(card.rank);
}

/**
 * Calculate hand points (sum mod 10)
 */
export function calculatePoints(cards: PokDengCard[]): number {
  const sum = cards.reduce((acc, card) => acc + getCardValue(card), 0);
  return sum % 10;
}

/**
 * Check if card is a face card (J, Q, K)
 */
export function isFaceCard(card: PokDengCard): boolean {
  return ["J", "Q", "K"].includes(card.rank);
}

/**
 * Check if cards are same suit
 */
export function isSameSuit(cards: PokDengCard[]): boolean {
  if (cards.length < 2) return false;
  return cards.every((card) => card.suit === cards[0].suit);
}

/**
 * Check if cards form a pair (same rank)
 */
export function isPair(cards: PokDengCard[]): boolean {
  if (cards.length !== 2) return false;
  return cards[0].rank === cards[1].rank;
}

/**
 * Check if cards are three of a kind
 */
export function isThreeOfKind(cards: PokDengCard[]): boolean {
  if (cards.length !== 3) return false;
  return cards[0].rank === cards[1].rank && cards[1].rank === cards[2].rank;
}

/**
 * Get rank value for straight checking
 */
function getRankValue(rank: CardRank): number {
  const values: Record<CardRank, number> = {
    A: 1,
    "2": 2,
    "3": 3,
    "4": 4,
    "5": 5,
    "6": 6,
    "7": 7,
    "8": 8,
    "9": 9,
    "10": 10,
    J: 11,
    Q: 12,
    K: 13,
  };
  return values[rank];
}

/**
 * Check if cards form a straight (consecutive ranks)
 */
export function isStraight(cards: PokDengCard[]): boolean {
  if (cards.length !== 3) return false;
  const values = cards.map((c) => getRankValue(c.rank)).sort((a, b) => a - b);
  return values[2] - values[1] === 1 && values[1] - values[0] === 1;
}

/**
 * Check if all cards are face cards
 */
export function isThreeFace(cards: PokDengCard[]): boolean {
  if (cards.length !== 3) return false;
  return cards.every(isFaceCard);
}

/**
 * Evaluate hand and determine type, points, and deng multiplier
 */
export function evaluateHand(cards: PokDengCard[]): PokDengHand {
  const points = calculatePoints(cards);

  // Check for Pok (natural 8 or 9 with 2 cards)
  if (cards.length === 2) {
    if (points === 9) {
      return {
        cards,
        points: 9,
        deng: isPair(cards) ? 4 : isSameSuit(cards) ? 3 : 2,
        isPok: true,
        handType: "pok_nine",
      };
    }
    if (points === 8) {
      return {
        cards,
        points: 8,
        deng: isPair(cards) ? 4 : isSameSuit(cards) ? 3 : 2,
        isPok: true,
        handType: "pok_eight",
      };
    }
  }

  // Check for special hands (3 cards)
  if (cards.length === 3) {
    // Three of a kind (ตอง) - highest
    if (isThreeOfKind(cards)) {
      return {
        cards,
        points,
        deng: 5,
        isPok: false,
        handType: "same_suit_three",
      };
    }

    // Straight flush (สเตรทฟลัช)
    if (isStraight(cards) && isSameSuit(cards)) {
      return {
        cards,
        points,
        deng: 5,
        isPok: false,
        handType: "straight_flush",
      };
    }

    // Three face cards (สามหน้า)
    if (isThreeFace(cards)) {
      return {
        cards,
        points,
        deng: 5,
        isPok: false,
        handType: "three_face",
      };
    }

    // Straight (เรียง)
    if (isStraight(cards)) {
      return {
        cards,
        points,
        deng: 3,
        isPok: false,
        handType: "straight",
      };
    }

    // Same suit (ตรง/สี)
    if (isSameSuit(cards)) {
      return {
        cards,
        points,
        deng: 3,
        isPok: false,
        handType: "same_suit",
      };
    }
  }

  // 2-card special hands
  if (cards.length === 2) {
    // Pair (คู่)
    if (isPair(cards)) {
      return {
        cards,
        points,
        deng: 2,
        isPok: false,
        handType: "pair",
      };
    }

    // Same suit (2 cards)
    if (isSameSuit(cards)) {
      return {
        cards,
        points,
        deng: 2,
        isPok: false,
        handType: "same_suit",
      };
    }
  }

  // Normal hand
  return {
    cards,
    points,
    deng: 1,
    isPok: false,
    handType: "normal",
  };
}

/**
 * Compare two hands
 * Returns: 1 if hand1 wins, -1 if hand2 wins, 0 if tie
 */
export function compareHands(hand1: PokDengHand, hand2: PokDengHand): number {
  // Pok beats non-pok
  if (hand1.isPok && !hand2.isPok) return 1;
  if (!hand1.isPok && hand2.isPok) return -1;

  // Compare hand types (for special 3-card hands)
  const typeOrder: PokDengHandType[] = [
    "same_suit_three",
    "straight_flush",
    "three_face",
    "straight",
    "same_suit",
    "pair",
    "pok_nine",
    "pok_eight",
    "normal",
  ];

  const type1Index = typeOrder.indexOf(hand1.handType);
  const type2Index = typeOrder.indexOf(hand2.handType);

  // Special hands beat normal point comparison
  if (type1Index < 5 && type2Index >= 5) return 1;
  if (type2Index < 5 && type1Index >= 5) return -1;

  // Both have special hands
  if (type1Index < 5 && type2Index < 5) {
    if (type1Index < type2Index) return 1;
    if (type1Index > type2Index) return -1;
    return 0;
  }

  // Compare by points
  if (hand1.points > hand2.points) return 1;
  if (hand1.points < hand2.points) return -1;

  // Same points - compare by deng
  if (hand1.deng > hand2.deng) return 1;
  if (hand1.deng < hand2.deng) return -1;

  return 0;
}

/**
 * Create initial Pok Deng game state
 * Starts in "dealing" phase with no cards - cards will be dealt via action
 */
export function createPokDengState(
  roomId: string,
  players: GamePlayer[],
  aiPlayer?: GamePlayer | null
): PokDengState {
  // Add AI player if provided and needed
  const allPlayers =
    aiPlayer && players.length < 2 ? [...players, aiPlayer] : [...players];

  if (allPlayers.length < 2) {
    throw new Error("Need at least 2 players to start Pok Deng");
  }

  // Randomly select dealer
  const shuffledPlayers = [...allPlayers].sort(() => Math.random() - 0.5);
  const dealer = shuffledPlayers[0].odId;

  // Create and shuffle deck
  const deck = shuffleDeck(createDeck());

  // Start with empty hands - cards will be dealt in "dealing" phase
  const dealerHand: PokDengCard[] = [];

  const playerHands: PokDengPlayerHand[] = shuffledPlayers
    .filter((p) => p.odId !== dealer)
    .map((p) => ({
      playerId: p.odId,
      cards: [],
      bet: DEFAULT_BET,
      hasStood: false,
      hasDrawn: false,
    }));

  // Find dealer and player names for log
  const dealerPlayer = allPlayers.find((p) => p.odId === dealer);
  const dealerName = dealerPlayer?.nickname || "เจ้ามือ";
  const playerNames = playerHands.map((h) => {
    const p = allPlayers.find((pl) => pl.odId === h.playerId);
    return p?.nickname || "ผู้เล่น";
  });

  // Initial game log
  const gameLog: PokDengLogEntry[] = [
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
      message: `👑 ${dealerName} เป็นเจ้ามือ`,
      playerId: dealer,
      playerName: dealerName,
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
    gameId: `pd_${Date.now()}`,
    roomId,
    status: "playing",
    currentTurn: dealer, // Dealer starts by dealing
    turnNumber: 1,
    winner: null,
    players: allPlayers,
    startedAt: Date.now(),
    lastActionAt: Date.now(),
    dealer,
    dealerHand,
    dealerRevealed: false,
    playerHands,
    allCardsRevealed: false, // Cards hidden until dealer reveals
    phase: "dealing", // Start with dealing phase
    currentPlayerIndex: 0,
    deck,
    roundNumber: 1,
    gameLog,
  };
}

/**
 * Deal cards to all players (called after dealing phase animation)
 */
export function dealCards(state: PokDengState): PokDengState {
  if (state.phase !== "dealing") return state;

  const newDeck = [...state.deck];

  // Deal 2 cards to dealer
  const dealerHand: PokDengCard[] = [newDeck.pop()!, newDeck.pop()!];

  // Deal 2 cards to each player
  const playerHands = state.playerHands.map((hand) => ({
    ...hand,
    cards: [newDeck.pop()!, newDeck.pop()!],
  }));

  // Check if dealer has Pok
  const dealerEval = evaluateHand(dealerHand);
  const dealerHasPok = dealerEval.isPok;

  // Check if any player has Pok (auto-stand)
  const processedPlayerHands = playerHands.map((hand) => {
    const eval_ = evaluateHand(hand.cards);
    if (eval_.isPok) {
      return { ...hand, hasStood: true };
    }
    return hand;
  });

  // Find first player who hasn't decided yet
  const firstUndecidedIndex = processedPlayerHands.findIndex(
    (h) => !h.hasStood && !h.hasDrawn
  );

  // Determine phase and current turn
  let finalPhase: PokDengPhase;
  let currentTurnPlayer: string;

  if (dealerHasPok) {
    // Dealer has Pok - go to revealing
    finalPhase = "revealing";
    currentTurnPlayer = state.dealer;
  } else if (firstUndecidedIndex === -1) {
    // All players have Pok (auto-stood) - go to revealing
    finalPhase = "revealing";
    currentTurnPlayer = state.dealer;
  } else {
    // Normal play - first undecided player's turn
    finalPhase = "player_turn";
    currentTurnPlayer = processedPlayerHands[firstUndecidedIndex].playerId;
  }

  // Build new log entries
  const newLogEntries: PokDengLogEntry[] = [];
  const baseId = state.gameLog.length + 1;
  let logId = baseId;

  // Dealt cards log
  const dealerPlayer = state.players.find((p) => p.odId === state.dealer);
  const dealerName = dealerPlayer?.nickname || "เจ้ามือ";

  newLogEntries.push({
    id: logId++,
    timestamp: Date.now(),
    type: "dealt",
    message: `✅ แจกไพ่ครบแล้ว!`,
  });

  // Dealer's hand info (cards hidden until reveal)
  newLogEntries.push({
    id: logId++,
    timestamp: Date.now(),
    type: "dealt",
    message: `👑 ${dealerName} ได้ไพ่ 2 ใบ${dealerHasPok ? " (ป๊อก!)" : ""}`,
    playerId: state.dealer,
    playerName: dealerName,
  });

  // Each player's hand info (cards hidden until reveal)
  processedPlayerHands.forEach((hand) => {
    const player = state.players.find((p) => p.odId === hand.playerId);
    const playerName = player?.nickname || "ผู้เล่น";
    const handEval = evaluateHand(hand.cards);

    newLogEntries.push({
      id: logId++,
      timestamp: Date.now(),
      type: "dealt",
      message: `🎴 ${playerName} ได้ไพ่ 2 ใบ${
        handEval.isPok ? " (ป๊อก!)" : ""
      }`,
      playerId: hand.playerId,
      playerName,
    });
  });

  // What happens next
  if (dealerHasPok) {
    newLogEntries.push({
      id: logId++,
      timestamp: Date.now(),
      type: "reveal",
      message: `⚡ ${dealerName} มีป๊อก! รอเปิดไพ่...`,
    });
  } else if (firstUndecidedIndex === -1) {
    newLogEntries.push({
      id: logId++,
      timestamp: Date.now(),
      type: "reveal",
      message: `⚡ ผู้เล่นทุกคนมีป๊อก! รอเปิดไพ่...`,
    });
  } else {
    const nextPlayer = state.players.find((p) => p.odId === currentTurnPlayer);
    const nextName = nextPlayer?.nickname || "ผู้เล่น";
    newLogEntries.push({
      id: logId++,
      timestamp: Date.now(),
      type: "player_action",
      message: `⏳ ตา ${nextName} ตัดสินใจ...`,
      playerId: currentTurnPlayer,
      playerName: nextName,
    });
  }

  return {
    ...state,
    dealerHand,
    dealerRevealed: dealerHasPok,
    playerHands: processedPlayerHands,
    deck: newDeck,
    phase: finalPhase,
    currentTurn: currentTurnPlayer,
    currentPlayerIndex: firstUndecidedIndex === -1 ? 0 : firstUndecidedIndex,
    lastActionAt: Date.now(),
    gameLog: [...state.gameLog, ...newLogEntries],
  };
}

/**
 * Apply player action (draw or stand)
 */
export function applyPokDengAction(
  state: PokDengState,
  action: PokDengAction
): PokDengState {
  const { type, playerId } = action;

  // Handle reveal action (dealer reveals cards and calculates results)
  if (type === "reveal") {
    if (state.phase !== "revealing") return state;
    if (playerId !== state.dealer) return state;

    return calculateResults(state);
  }

  // Handle player actions (draw/stand)
  if (state.phase !== "player_turn") return state;

  // Find player hand
  const playerIndex = state.playerHands.findIndex(
    (h) => h.playerId === playerId
  );
  if (playerIndex === -1) return state;

  const playerHand = state.playerHands[playerIndex];
  if (playerHand.hasStood || playerHand.hasDrawn) return state;

  const newPlayerHands = [...state.playerHands];
  const newDeck = [...state.deck];
  const newLogEntries: PokDengLogEntry[] = [];
  let logId = state.gameLog.length + 1;

  // Get player info
  const player = state.players.find((p) => p.odId === playerId);
  const playerName = player?.nickname || "ผู้เล่น";

  if (type === "draw_card") {
    // Draw 3rd card
    if (newDeck.length > 0 && playerHand.cards.length === 2) {
      const newCard = newDeck.pop()!;
      newPlayerHands[playerIndex] = {
        ...playerHand,
        cards: [...playerHand.cards, newCard],
        hasDrawn: true,
        hasStood: true,
      };

      newLogEntries.push({
        id: logId++,
        timestamp: Date.now(),
        type: "player_action",
        message: `🃏 ${playerName} จั่วไพ่ 1 ใบ`,
        playerId,
        playerName,
      });
    }
  } else if (type === "stand") {
    // Stand with current cards
    newPlayerHands[playerIndex] = {
      ...playerHand,
      hasStood: true,
    };

    newLogEntries.push({
      id: logId++,
      timestamp: Date.now(),
      type: "player_action",
      message: `✋ ${playerName} หงายไพ่`,
      playerId,
      playerName,
    });
  }

  // Find next player who needs to decide
  const nextPlayerIndex = newPlayerHands.findIndex(
    (h, i) => i > playerIndex && !h.hasStood && !h.hasDrawn
  );

  // Check if all players have decided
  const allDecided = newPlayerHands.every((h) => h.hasStood || h.hasDrawn);

  if (allDecided) {
    // Add log for all decided
    const dealerPlayer = state.players.find((p) => p.odId === state.dealer);
    const dealerName = dealerPlayer?.nickname || "เจ้ามือ";

    newLogEntries.push({
      id: logId++,
      timestamp: Date.now(),
      type: "reveal",
      message: `✅ ผู้เล่นทุกคนตัดสินใจแล้ว`,
    });
    newLogEntries.push({
      id: logId++,
      timestamp: Date.now(),
      type: "reveal",
      message: `⏳ รอ ${dealerName} เปิดไพ่...`,
      playerId: state.dealer,
      playerName: dealerName,
    });

    // Move to revealing phase - dealer will reveal
    return {
      ...state,
      playerHands: newPlayerHands,
      deck: newDeck,
      phase: "revealing",
      currentTurn: state.dealer, // Dealer's turn to reveal
      lastActionAt: Date.now(),
      gameLog: [...state.gameLog, ...newLogEntries],
    };
  }

  // Continue with next player
  const nextPlayerId =
    nextPlayerIndex !== -1
      ? newPlayerHands[nextPlayerIndex].playerId
      : newPlayerHands.find((h) => !h.hasStood && !h.hasDrawn)?.playerId ??
        state.currentTurn;

  // Add log for next player's turn
  const nextPlayer = state.players.find((p) => p.odId === nextPlayerId);
  const nextName = nextPlayer?.nickname || "ผู้เล่น";
  newLogEntries.push({
    id: logId++,
    timestamp: Date.now(),
    type: "player_action",
    message: `⏳ ตา ${nextName} ตัดสินใจ...`,
    playerId: nextPlayerId,
    playerName: nextName,
  });

  return {
    ...state,
    playerHands: newPlayerHands,
    deck: newDeck,
    currentPlayerIndex:
      nextPlayerIndex === -1 ? playerIndex + 1 : nextPlayerIndex,
    currentTurn: nextPlayerId,
    lastActionAt: Date.now(),
    gameLog: [...state.gameLog, ...newLogEntries],
  };
}

/**
 * Calculate game results (called when dealer reveals)
 */
function calculateResults(state: PokDengState): PokDengState {
  const newDeck = [...state.deck];
  const newPlayerHands = [...state.playerHands];
  const newLogEntries: PokDengLogEntry[] = [];
  let logId = state.gameLog.length + 1;

  // Get dealer info
  const dealerPlayer = state.players.find((p) => p.odId === state.dealer);
  const dealerName = dealerPlayer?.nickname || "เจ้ามือ";

  // Dealer draws if needed (simple AI: draw if < 5 points)
  const newDealerHand = [...state.dealerHand];
  const initialDealerPoints = calculatePoints(newDealerHand);

  if (newDealerHand.length === 2) {
    if (initialDealerPoints < 5 && newDeck.length > 0) {
      const drawnCard = newDeck.pop()!;
      newDealerHand.push(drawnCard);

      newLogEntries.push({
        id: logId++,
        timestamp: Date.now(),
        type: "dealer_action",
        message: `🃏 ${dealerName} จั่วไพ่ ${getCardString(drawnCard)}`,
        playerId: state.dealer,
        playerName: dealerName,
      });
    } else {
      newLogEntries.push({
        id: logId++,
        timestamp: Date.now(),
        type: "dealer_action",
        message: `✋ ${dealerName} ไม่จั่วไพ่ (${initialDealerPoints} แต้ม)`,
        playerId: state.dealer,
        playerName: dealerName,
      });
    }
  }

  // Calculate results
  const dealerEval = evaluateHand(newDealerHand);

  newLogEntries.push({
    id: logId++,
    timestamp: Date.now(),
    type: "reveal",
    message: `👑 ${dealerName} เปิดไพ่: ${newDealerHand
      .map((c) => getCardString(c))
      .join(" ")} = ${dealerEval.points} แต้ม${
      dealerEval.isPok ? " ป๊อก!" : ""
    }`,
    playerId: state.dealer,
    playerName: dealerName,
  });

  const finalPlayerHands = newPlayerHands.map((hand) => {
    const playerEval = evaluateHand(hand.cards);
    const comparison = compareHands(playerEval, dealerEval);

    let result: "win" | "lose" | "tie";
    let payout = 0;

    if (comparison > 0) {
      result = "win";
      payout = hand.bet * playerEval.deng;
    } else if (comparison < 0) {
      result = "lose";
      payout = -hand.bet * dealerEval.deng;
    } else {
      result = "tie";
      payout = 0;
    }

    return { ...hand, result, payout };
  });

  // Log each player's result
  finalPlayerHands.forEach((hand) => {
    const player = state.players.find((p) => p.odId === hand.playerId);
    const playerName = player?.nickname || "ผู้เล่น";
    const handEval = evaluateHand(hand.cards);

    let resultEmoji = "";
    let resultText = "";
    if (hand.result === "win") {
      resultEmoji = "🎉";
      resultText = `ชนะ +${hand.payout}`;
    } else if (hand.result === "lose") {
      resultEmoji = "😢";
      resultText = `แพ้ ${hand.payout}`;
    } else {
      resultEmoji = "🤝";
      resultText = "เสมอ";
    }

    newLogEntries.push({
      id: logId++,
      timestamp: Date.now(),
      type: "result",
      message: `${resultEmoji} ${playerName}: ${hand.cards
        .map((c) => getCardString(c))
        .join(" ")} (${handEval.points} แต้ม) → ${resultText}`,
      playerId: hand.playerId,
      playerName,
    });
  });

  // Determine overall winner
  const playerWins = finalPlayerHands.filter((h) => h.result === "win");
  const winner = playerWins.length > 0 ? playerWins[0].playerId : state.dealer;

  // Final result log
  const winnerPlayer = state.players.find((p) => p.odId === winner);
  const winnerName = winnerPlayer?.nickname || "เจ้ามือ";
  newLogEntries.push({
    id: logId++,
    timestamp: Date.now(),
    type: "result",
    message: `🏆 จบเกม! ${winnerName} ชนะ`,
  });

  // Update player scores
  const updatedPlayers = state.players.map((p) => {
    const pHand = finalPlayerHands.find((h) => h.playerId === p.odId);
    if (pHand) {
      return {
        ...p,
        score: p.score + (pHand.payout ?? 0),
      };
    }
    // Dealer gets negative of total player payouts
    if (p.odId === state.dealer) {
      const totalPayout = finalPlayerHands.reduce(
        (acc, h) => acc + (h.payout ?? 0),
        0
      );
      return {
        ...p,
        score: p.score - totalPayout,
      };
    }
    return p;
  });

  return {
    ...state,
    dealerHand: newDealerHand,
    dealerRevealed: true,
    allCardsRevealed: true, // All cards now visible
    playerHands: finalPlayerHands,
    deck: newDeck,
    phase: "finished",
    status: "finished",
    winner,
    players: updatedPlayers,
    lastActionAt: Date.now(),
    gameLog: [...state.gameLog, ...newLogEntries],
  };
}

/**
 * Get display name for hand type
 */
export function getHandTypeName(type: PokDengHandType): string {
  const names: Record<PokDengHandType, string> = {
    pok_nine: "ป๊อกเก้า",
    pok_eight: "ป๊อกแปด",
    same_suit_three: "ตอง",
    straight_flush: "สเตรทฟลัช",
    three_face: "สามหน้า",
    straight: "เรียง",
    same_suit: "ตรงสี",
    pair: "คู่",
    normal: "ธรรมดา",
  };
  return names[type];
}

/**
 * Get card display character
 */
export function getCardDisplay(card: PokDengCard): {
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
 * Get card as string for logging
 */
export function getCardString(card: PokDengCard): string {
  const suitSymbols: Record<CardSuit, string> = {
    hearts: "♥",
    diamonds: "♦",
    clubs: "♣",
    spades: "♠",
  };
  return `${card.rank}${suitSymbols[card.suit]}`;
}
