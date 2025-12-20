/**
 * Blackjack Game State Types
 * Classic card game where players compete against the dealer
 * Goal: Get closer to 21 than the dealer without going over
 */

import type { BaseGameState, GamePlayer } from "./gameState";

// Reuse card types from pokdengState
export type CardSuit = "hearts" | "diamonds" | "clubs" | "spades";

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

export interface BlackjackCard {
  suit: CardSuit;
  rank: CardRank;
}

// Game phases
export type BlackjackPhase =
  | "betting" // Players place bets (simplified: skip for now)
  | "dealing" // Cards being dealt
  | "player_turn" // Player decides hit/stand
  | "dealer_turn" // Dealer plays
  | "finished"; // Round complete

// Player hand state
export interface BlackjackPlayerHand {
  playerId: string;
  cards: BlackjackCard[];
  bet: number;
  hasStood: boolean;
  hasBusted: boolean;
  hasBlackjack: boolean;
  result?: "win" | "lose" | "push" | "blackjack";
  payout?: number;
}

// Game log entry
export interface BlackjackLogEntry {
  id: number;
  timestamp: number;
  type:
    | "game_start"
    | "dealing"
    | "dealt"
    | "player_action"
    | "dealer_action"
    | "result";
  message: string;
  playerId?: string;
  playerName?: string;
}

// Extend BaseGameState
export interface BlackjackState extends BaseGameState {
  // Dealer info
  dealer: string; // Dealer player ID (AI)
  dealerHand: BlackjackCard[];
  dealerRevealed: boolean; // Is hole card revealed?

  // Player hands
  playerHands: BlackjackPlayerHand[];

  // Game phase
  phase: BlackjackPhase;

  // Current player making decision
  currentPlayerIndex: number;

  // Deck
  deck: BlackjackCard[];

  // Round number
  roundNumber: number;

  // Game log
  gameLog: BlackjackLogEntry[];
}

// Actions
export interface BlackjackAction {
  type: "hit" | "stand" | "deal";
  playerId: string;
  timestamp: number;
  data?: {
    bet?: number;
  };
}

// Constants
export const DEALER_STAND_VALUE = 17; // Dealer must stand on 17
export const BLACKJACK_VALUE = 21;
export const DEFAULT_BET = 100;

/**
 * Create a standard 52-card deck
 */
export function createDeck(): BlackjackCard[] {
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

  const deck: BlackjackCard[] = [];
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
export function shuffleDeck(deck: BlackjackCard[]): BlackjackCard[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Get card value for Blackjack
 * A = 1 or 11 (handled in calculateHandValue)
 * 2-10 = face value
 * J/Q/K = 10
 */
export function getCardValue(card: BlackjackCard): number {
  if (card.rank === "A") return 11; // Default to 11, adjust in hand calculation
  if (["10", "J", "Q", "K"].includes(card.rank)) return 10;
  return parseInt(card.rank);
}

/**
 * Calculate hand value with optimal Ace handling
 * Aces count as 11 unless it would bust, then count as 1
 */
export function calculateHandValue(cards: BlackjackCard[]): number {
  let value = 0;
  let aces = 0;

  for (const card of cards) {
    if (card.rank === "A") {
      aces++;
      value += 11;
    } else {
      value += getCardValue(card);
    }
  }

  // Convert Aces from 11 to 1 if busting
  while (value > BLACKJACK_VALUE && aces > 0) {
    value -= 10;
    aces--;
  }

  return value;
}

/**
 * Check if hand is a Blackjack (21 with 2 cards)
 */
export function isBlackjack(cards: BlackjackCard[]): boolean {
  return cards.length === 2 && calculateHandValue(cards) === BLACKJACK_VALUE;
}

/**
 * Check if hand is busted (over 21)
 */
export function isBusted(cards: BlackjackCard[]): boolean {
  return calculateHandValue(cards) > BLACKJACK_VALUE;
}

/**
 * Check if hand is soft (contains Ace counted as 11)
 */
export function isSoftHand(cards: BlackjackCard[]): boolean {
  const hasAce = cards.some((card) => card.rank === "A");
  if (!hasAce) return false;

  // Calculate value without any Ace adjustment
  let value = 0;
  for (const card of cards) {
    if (card.rank === "A") {
      value += 11;
    } else {
      value += getCardValue(card);
    }
  }

  // If value with Ace as 11 is <= 21, it's soft
  return value <= BLACKJACK_VALUE;
}

/**
 * Create initial Blackjack game state
 */
export function createBlackjackState(
  roomId: string,
  players: GamePlayer[],
  aiPlayer?: GamePlayer | null
): BlackjackState {
  // Add AI player as dealer if provided
  const allPlayers =
    aiPlayer && players.length < 2 ? [...players, aiPlayer] : [...players];

  if (allPlayers.length < 2) {
    throw new Error("Need at least 2 players to start Blackjack");
  }

  // AI is always dealer
  const dealer = allPlayers.find((p) => p.isAI)?.odId || allPlayers[0].odId;

  // Create and shuffle deck
  const deck = shuffleDeck(createDeck());

  // Initialize empty player hands (non-dealer)
  const playerHands: BlackjackPlayerHand[] = allPlayers
    .filter((p) => p.odId !== dealer)
    .map((p) => ({
      playerId: p.odId,
      cards: [],
      bet: DEFAULT_BET,
      hasStood: false,
      hasBusted: false,
      hasBlackjack: false,
    }));

  // Get names for log
  const dealerPlayer = allPlayers.find((p) => p.odId === dealer);
  const dealerName = dealerPlayer?.nickname || "เจ้ามือ";
  const playerNames = playerHands.map((h) => {
    const p = allPlayers.find((pl) => pl.odId === h.playerId);
    return p?.nickname || "ผู้เล่น";
  });

  // Initial game log
  const gameLog: BlackjackLogEntry[] = [
    {
      id: 1,
      timestamp: Date.now(),
      type: "game_start",
      message: `🎰 เริ่มเกม Blackjack! รอบที่ 1`,
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
    gameId: `bj_${Date.now()}`,
    roomId,
    status: "playing",
    currentTurn: dealer,
    turnNumber: 1,
    winner: null,
    players: allPlayers,
    startedAt: Date.now(),
    lastActionAt: Date.now(),
    dealer,
    dealerHand: [],
    dealerRevealed: false,
    playerHands,
    phase: "dealing",
    currentPlayerIndex: 0,
    deck,
    roundNumber: 1,
    gameLog,
  };
}

/**
 * Deal initial cards (2 cards each)
 */
export function dealCards(state: BlackjackState): BlackjackState {
  if (state.phase !== "dealing") return state;

  const newDeck = [...state.deck];
  const newLogEntries: BlackjackLogEntry[] = [];
  let logId = state.gameLog.length + 1;

  // Deal 2 cards to dealer (one face down)
  const dealerHand: BlackjackCard[] = [newDeck.pop()!, newDeck.pop()!];

  // Deal 2 cards to each player
  const playerHands = state.playerHands.map((hand) => {
    const cards = [newDeck.pop()!, newDeck.pop()!];
    const hasBlackjack = isBlackjack(cards);
    return {
      ...hand,
      cards,
      hasBlackjack,
      hasStood: hasBlackjack, // Auto-stand on blackjack
    };
  });

  // Get names
  const dealerPlayer = state.players.find((p) => p.odId === state.dealer);
  const dealerName = dealerPlayer?.nickname || "เจ้ามือ";

  // Log dealing complete
  newLogEntries.push({
    id: logId++,
    timestamp: Date.now(),
    type: "dealt",
    message: `✅ แจกไพ่ครบแล้ว!`,
  });

  // Dealer's visible card
  const dealerVisibleValue = getCardValue(dealerHand[0]);
  newLogEntries.push({
    id: logId++,
    timestamp: Date.now(),
    type: "dealt",
    message: `👑 ${dealerName} เปิดไพ่ ${dealerHand[0].rank}${getSuitEmoji(dealerHand[0].suit)} (${dealerVisibleValue} แต้ม)`,
    playerId: state.dealer,
    playerName: dealerName,
  });

  // Log each player's hand
  playerHands.forEach((hand) => {
    const player = state.players.find((p) => p.odId === hand.playerId);
    const playerName = player?.nickname || "ผู้เล่น";
    const handValue = calculateHandValue(hand.cards);

    newLogEntries.push({
      id: logId++,
      timestamp: Date.now(),
      type: "dealt",
      message: `🎴 ${playerName}: ${handValue} แต้ม${hand.hasBlackjack ? " 🎉 BLACKJACK!" : ""}`,
      playerId: hand.playerId,
      playerName,
    });
  });

  // Check if dealer has blackjack
  const dealerHasBlackjack = isBlackjack(dealerHand);

  // Determine next phase
  let nextPhase: BlackjackPhase;
  let nextTurn: string;

  if (dealerHasBlackjack) {
    // Dealer blackjack - reveal and end
    nextPhase = "finished";
    nextTurn = state.dealer;
    newLogEntries.push({
      id: logId++,
      timestamp: Date.now(),
      type: "dealer_action",
      message: `⚡ ${dealerName} มี BLACKJACK!`,
    });
  } else if (playerHands.every((h) => h.hasBlackjack)) {
    // All players have blackjack
    nextPhase = "finished";
    nextTurn = state.dealer;
  } else {
    // Find first player who can act
    const firstActiveIndex = playerHands.findIndex((h) => !h.hasStood);
    if (firstActiveIndex === -1) {
      nextPhase = "dealer_turn";
      nextTurn = state.dealer;
    } else {
      nextPhase = "player_turn";
      nextTurn = playerHands[firstActiveIndex].playerId;
      const nextPlayer = state.players.find((p) => p.odId === nextTurn);
      newLogEntries.push({
        id: logId++,
        timestamp: Date.now(),
        type: "player_action",
        message: `⏳ ตา ${nextPlayer?.nickname || "ผู้เล่น"} ตัดสินใจ (Hit หรือ Stand)`,
        playerId: nextTurn,
        playerName: nextPlayer?.nickname,
      });
    }
  }

  // Calculate results if finished
  let finalPlayerHands = playerHands;
  if (nextPhase === "finished") {
    finalPlayerHands = calculateResults(
      playerHands,
      dealerHand,
      state.players,
      newLogEntries,
      logId
    );
  }

  return {
    ...state,
    dealerHand,
    dealerRevealed: nextPhase === "finished",
    playerHands: finalPlayerHands,
    deck: newDeck,
    phase: nextPhase,
    currentTurn: nextTurn,
    currentPlayerIndex: playerHands.findIndex((h) => !h.hasStood),
    lastActionAt: Date.now(),
    gameLog: [...state.gameLog, ...newLogEntries],
    status: nextPhase === "finished" ? "finished" : "playing",
  };
}

/**
 * Apply player action (hit or stand)
 */
export function applyBlackjackAction(
  state: BlackjackState,
  action: BlackjackAction
): BlackjackState {
  const { type, playerId } = action;

  if (type === "deal") {
    return dealCards(state);
  }

  if (state.phase === "dealer_turn") {
    return playDealerTurn(state);
  }

  if (state.phase !== "player_turn") return state;

  // Find player hand
  const playerIndex = state.playerHands.findIndex(
    (h) => h.playerId === playerId
  );
  if (playerIndex === -1) return state;

  const playerHand = state.playerHands[playerIndex];
  if (playerHand.hasStood || playerHand.hasBusted) return state;

  const newPlayerHands = [...state.playerHands];
  const newDeck = [...state.deck];
  const newLogEntries: BlackjackLogEntry[] = [];
  let logId = state.gameLog.length + 1;

  // Get player info
  const player = state.players.find((p) => p.odId === playerId);
  const playerName = player?.nickname || "ผู้เล่น";

  if (type === "hit") {
    // Draw a card
    if (newDeck.length > 0) {
      const newCard = newDeck.pop()!;
      const newCards = [...playerHand.cards, newCard];
      const newValue = calculateHandValue(newCards);
      const busted = isBusted(newCards);

      newPlayerHands[playerIndex] = {
        ...playerHand,
        cards: newCards,
        hasBusted: busted,
        hasStood: busted, // Auto-stand on bust
      };

      newLogEntries.push({
        id: logId++,
        timestamp: Date.now(),
        type: "player_action",
        message: `🃏 ${playerName} จั่วไพ่ ${newCard.rank}${getSuitEmoji(newCard.suit)} (รวม ${newValue} แต้ม)${busted ? " 💥 BUST!" : ""}`,
        playerId,
        playerName,
      });
    }
  } else if (type === "stand") {
    newPlayerHands[playerIndex] = {
      ...playerHand,
      hasStood: true,
    };

    newLogEntries.push({
      id: logId++,
      timestamp: Date.now(),
      type: "player_action",
      message: `✋ ${playerName} หยุด (${calculateHandValue(playerHand.cards)} แต้ม)`,
      playerId,
      playerName,
    });
  }

  // Check if all players are done
  const allPlayersDone = newPlayerHands.every(
    (h) => h.hasStood || h.hasBusted
  );

  if (allPlayersDone) {
    // Check if all players busted
    const allBusted = newPlayerHands.every((h) => h.hasBusted);

    if (allBusted) {
      // All players busted - dealer wins without playing
      const dealerPlayer = state.players.find((p) => p.odId === state.dealer);
      const dealerName = dealerPlayer?.nickname || "เจ้ามือ";

      newLogEntries.push({
        id: logId++,
        timestamp: Date.now(),
        type: "result",
        message: `💥 ผู้เล่นทุกคน Bust! ${dealerName} ชนะ!`,
      });

      // Set results
      const finalHands = newPlayerHands.map((h) => ({
        ...h,
        result: "lose" as const,
        payout: -h.bet,
      }));

      return {
        ...state,
        playerHands: finalHands,
        deck: newDeck,
        phase: "finished",
        dealerRevealed: true,
        status: "finished",
        winner: state.dealer,
        lastActionAt: Date.now(),
        gameLog: [...state.gameLog, ...newLogEntries],
      };
    }

    // Move to dealer turn
    const dealerPlayer = state.players.find((p) => p.odId === state.dealer);
    newLogEntries.push({
      id: logId++,
      timestamp: Date.now(),
      type: "dealer_action",
      message: `👑 ตาเจ้ามือ ${dealerPlayer?.nickname || "เจ้ามือ"} เล่น...`,
      playerId: state.dealer,
    });

    return {
      ...state,
      playerHands: newPlayerHands,
      deck: newDeck,
      phase: "dealer_turn",
      currentTurn: state.dealer,
      dealerRevealed: true,
      lastActionAt: Date.now(),
      gameLog: [...state.gameLog, ...newLogEntries],
    };
  }

  // Find next player
  const nextPlayerIndex = newPlayerHands.findIndex(
    (h, i) => i > playerIndex && !h.hasStood && !h.hasBusted
  );

  const nextPlayer =
    nextPlayerIndex !== -1
      ? newPlayerHands[nextPlayerIndex].playerId
      : newPlayerHands.find((h) => !h.hasStood && !h.hasBusted)?.playerId ||
        state.currentTurn;

  if (nextPlayer !== playerId) {
    const nextPlayerInfo = state.players.find((p) => p.odId === nextPlayer);
    newLogEntries.push({
      id: logId++,
      timestamp: Date.now(),
      type: "player_action",
      message: `⏳ ตา ${nextPlayerInfo?.nickname || "ผู้เล่น"} ตัดสินใจ`,
      playerId: nextPlayer,
    });
  }

  return {
    ...state,
    playerHands: newPlayerHands,
    deck: newDeck,
    currentTurn: nextPlayer,
    currentPlayerIndex:
      nextPlayerIndex !== -1 ? nextPlayerIndex : state.currentPlayerIndex,
    lastActionAt: Date.now(),
    gameLog: [...state.gameLog, ...newLogEntries],
  };
}

/**
 * Play dealer's turn (auto-play based on rules)
 */
export function playDealerTurn(state: BlackjackState): BlackjackState {
  if (state.phase !== "dealer_turn") return state;

  const newDeck = [...state.deck];
  let dealerHand = [...state.dealerHand];
  const newLogEntries: BlackjackLogEntry[] = [];
  let logId = state.gameLog.length + 1;

  const dealerPlayer = state.players.find((p) => p.odId === state.dealer);
  const dealerName = dealerPlayer?.nickname || "เจ้ามือ";

  // Reveal hole card
  const holeCardValue = calculateHandValue(dealerHand);
  newLogEntries.push({
    id: logId++,
    timestamp: Date.now(),
    type: "dealer_action",
    message: `👁️ ${dealerName} เปิดไพ่: ${dealerHand.map((c) => `${c.rank}${getSuitEmoji(c.suit)}`).join(" ")} (${holeCardValue} แต้ม)`,
    playerId: state.dealer,
    playerName: dealerName,
  });

  // Dealer hits until 17 or more
  while (calculateHandValue(dealerHand) < DEALER_STAND_VALUE && newDeck.length > 0) {
    const newCard = newDeck.pop()!;
    dealerHand = [...dealerHand, newCard];
    const newValue = calculateHandValue(dealerHand);

    newLogEntries.push({
      id: logId++,
      timestamp: Date.now(),
      type: "dealer_action",
      message: `🃏 ${dealerName} จั่วไพ่ ${newCard.rank}${getSuitEmoji(newCard.suit)} (รวม ${newValue} แต้ม)${newValue > BLACKJACK_VALUE ? " 💥 BUST!" : ""}`,
      playerId: state.dealer,
      playerName: dealerName,
    });
  }

  const dealerValue = calculateHandValue(dealerHand);
  const dealerBusted = dealerValue > BLACKJACK_VALUE;

  if (!dealerBusted) {
    newLogEntries.push({
      id: logId++,
      timestamp: Date.now(),
      type: "dealer_action",
      message: `✋ ${dealerName} หยุดที่ ${dealerValue} แต้ม`,
      playerId: state.dealer,
      playerName: dealerName,
    });
  }

  // Calculate results
  const finalPlayerHands = calculateResults(
    state.playerHands,
    dealerHand,
    state.players,
    newLogEntries,
    logId
  );

  // Determine winner (for display)
  const winners = finalPlayerHands.filter(
    (h) => h.result === "win" || h.result === "blackjack"
  );
  const winnerName =
    winners.length > 0
      ? state.players.find((p) => p.odId === winners[0].playerId)?.nickname
      : dealerName;

  return {
    ...state,
    dealerHand,
    dealerRevealed: true,
    playerHands: finalPlayerHands,
    deck: newDeck,
    phase: "finished",
    status: "finished",
    winner: winners.length > 0 ? winners[0].playerId : state.dealer,
    lastActionAt: Date.now(),
    gameLog: [...state.gameLog, ...newLogEntries],
  };
}

/**
 * Calculate results for all players
 */
function calculateResults(
  playerHands: BlackjackPlayerHand[],
  dealerHand: BlackjackCard[],
  players: GamePlayer[],
  logEntries: BlackjackLogEntry[],
  startLogId: number
): BlackjackPlayerHand[] {
  const dealerValue = calculateHandValue(dealerHand);
  const dealerBusted = dealerValue > BLACKJACK_VALUE;
  const dealerHasBlackjack = isBlackjack(dealerHand);
  let logId = startLogId;

  logEntries.push({
    id: logId++,
    timestamp: Date.now(),
    type: "result",
    message: `📊 สรุปผล:`,
  });

  return playerHands.map((hand) => {
    const playerValue = calculateHandValue(hand.cards);
    const player = players.find((p) => p.odId === hand.playerId);
    const playerName = player?.nickname || "ผู้เล่น";
    let result: "win" | "lose" | "push" | "blackjack";
    let payout: number;

    if (hand.hasBusted) {
      result = "lose";
      payout = -hand.bet;
    } else if (hand.hasBlackjack && dealerHasBlackjack) {
      result = "push";
      payout = 0;
    } else if (hand.hasBlackjack) {
      result = "blackjack";
      payout = Math.floor(hand.bet * 1.5); // 3:2 payout
    } else if (dealerBusted) {
      result = "win";
      payout = hand.bet;
    } else if (playerValue > dealerValue) {
      result = "win";
      payout = hand.bet;
    } else if (playerValue < dealerValue) {
      result = "lose";
      payout = -hand.bet;
    } else {
      result = "push";
      payout = 0;
    }

    const resultEmoji =
      result === "blackjack"
        ? "🎉"
        : result === "win"
          ? "✅"
          : result === "push"
            ? "🤝"
            : "❌";
    const resultText =
      result === "blackjack"
        ? "BLACKJACK!"
        : result === "win"
          ? "ชนะ"
          : result === "push"
            ? "เสมอ"
            : "แพ้";

    logEntries.push({
      id: logId++,
      timestamp: Date.now(),
      type: "result",
      message: `${resultEmoji} ${playerName}: ${playerValue} แต้ม - ${resultText}${payout !== 0 ? ` (${payout > 0 ? "+" : ""}${payout})` : ""}`,
      playerId: hand.playerId,
      playerName,
    });

    return {
      ...hand,
      result,
      payout,
    };
  });
}

/**
 * Get suit emoji
 */
export function getSuitEmoji(suit: CardSuit): string {
  switch (suit) {
    case "hearts":
      return "♥️";
    case "diamonds":
      return "♦️";
    case "clubs":
      return "♣️";
    case "spades":
      return "♠️";
  }
}

/**
 * Get suit color
 */
export function getSuitColor(suit: CardSuit): "red" | "black" {
  return suit === "hearts" || suit === "diamonds" ? "red" : "black";
}
