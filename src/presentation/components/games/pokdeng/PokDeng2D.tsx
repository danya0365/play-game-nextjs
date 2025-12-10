"use client";

import type {
  CardSuit,
  PokDengCard,
  PokDengLogEntry,
  PokDengPhase,
  PokDengPlayerHand,
} from "@/src/domain/types/pokdengState";
import {
  evaluateHand,
  getCardDisplay,
  getHandTypeName,
} from "@/src/domain/types/pokdengState";
import { ChevronDown, ChevronUp, ScrollText } from "lucide-react";
import { useState } from "react";

// Helper to get suit emoji
function getSuitEmoji(suit: CardSuit): string {
  switch (suit) {
    case "hearts":
      return "♥";
    case "diamonds":
      return "♦";
    case "clubs":
      return "♣";
    case "spades":
      return "♠";
  }
}

interface PokDeng2DProps {
  dealerHand: PokDengCard[];
  dealerRevealed: boolean;
  playerHands: PokDengPlayerHand[];
  myPlayerId: string;
  myHand?: PokDengPlayerHand;
  isDealer: boolean;
  phase: PokDengPhase;
  canTakeAction: boolean;
  canReveal: boolean;
  currentTurn: string;
  dealerId: string;
  players: { odId: string; nickname: string; isAI?: boolean }[];
  gameLog: PokDengLogEntry[];
  allCardsRevealed: boolean;
  onDraw: () => void;
  onStand: () => void;
  onReveal: () => void;
}

/**
 * 2D HTML/CSS rendering of Pok Deng game
 * Casino-style fixed layout - no scrolling
 */
export function PokDeng2D({
  dealerHand,
  dealerRevealed,
  playerHands,
  myPlayerId,
  myHand,
  isDealer,
  phase,
  canTakeAction,
  canReveal,
  currentTurn,
  dealerId,
  players,
  gameLog,
  allCardsRevealed,
  onDraw,
  onStand,
  onReveal,
}: PokDeng2DProps) {
  const [showLog, setShowLog] = useState(true);

  // Get my hand evaluation
  const myHandEval = myHand ? evaluateHand(myHand.cards) : null;
  const dealerEval = dealerRevealed ? evaluateHand(dealerHand) : null;

  // Find current turn player name
  const currentTurnPlayer = players.find((p) => p.odId === currentTurn);

  // Get phase text
  const getPhaseText = () => {
    switch (phase) {
      case "betting":
        return "🎰 วางเดิมพัน";
      case "dealing":
        return "🃏 แจกไพ่";
      case "player_turn":
        return "🤔 ผู้เล่นตัดสินใจ";
      case "revealing":
        return "👀 เปิดไพ่";
      case "finished":
        return "🏆 จบเกม";
      default:
        return phase;
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden">
      {/* Game Log Panel - Collapsible */}
      <div className="absolute top-2 left-2 z-20 max-w-xs">
        <button
          onClick={() => setShowLog(!showLog)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/60 text-white/90 text-xs font-medium backdrop-blur-sm border border-white/10 hover:bg-black/70 transition-colors"
        >
          <ScrollText className="w-3.5 h-3.5" />
          Game Log
          {showLog ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>

        {showLog && (
          <div className="mt-1 p-3 rounded-lg bg-black/70 backdrop-blur-sm border border-white/10 text-xs max-h-[60vh] overflow-y-auto">
            {/* Header with Phase */}
            <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
              <span className="text-amber-400 font-medium">
                {getPhaseText()}
              </span>
              <span className="text-white/60">{players.length} คน</span>
            </div>

            {/* Step-by-step Game Log */}
            <div className="space-y-1.5">
              {gameLog.map((entry) => {
                // Color based on log type
                let textColor = "text-white/80";
                if (entry.type === "game_start") textColor = "text-cyan-300";
                if (entry.type === "dealing") textColor = "text-amber-300";
                if (entry.type === "dealt") textColor = "text-emerald-300";
                if (entry.type === "player_action") textColor = "text-blue-300";
                if (entry.type === "dealer_action")
                  textColor = "text-purple-300";
                if (entry.type === "reveal") textColor = "text-yellow-300";
                if (entry.type === "result") textColor = "text-pink-300";

                return (
                  <div
                    key={entry.id}
                    className={`${textColor} leading-relaxed py-0.5 border-l-2 pl-2 ${
                      entry.type === "result"
                        ? "border-pink-500"
                        : entry.type === "reveal"
                        ? "border-yellow-500"
                        : entry.type === "dealt"
                        ? "border-emerald-500"
                        : entry.type === "dealing"
                        ? "border-amber-500"
                        : "border-white/20"
                    }`}
                  >
                    {entry.message}
                  </div>
                );
              })}
            </div>

            {/* Current Status */}
            {phase !== "finished" && (
              <div className="mt-3 pt-2 border-t border-white/10">
                <div className="text-white/60">
                  <span className="text-amber-400">ตาปัจจุบัน:</span>{" "}
                  {currentTurnPlayer?.nickname || "Unknown"}
                  {currentTurnPlayer?.isAI && " (AI)"}
                  {currentTurn === myPlayerId && " (คุณ)"}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {/* Table felt background with pattern */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-800 via-emerald-700 to-emerald-800">
        {/* Decorative table edge */}
        <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-b from-amber-900/50 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-2 bg-gradient-to-t from-amber-900/50 to-transparent" />
        {/* Center line decoration */}
        <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-[1px] bg-emerald-600/30" />
        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-32 h-32 md:w-48 md:h-48 rounded-full border border-emerald-600/20" />
      </div>

      {/* Game Content */}
      <div className="relative flex-1 flex flex-col">
        {/* Dealer Area - Top 35% */}
        <div className="h-[35%] flex flex-col items-center justify-end pb-2">
          {/* Dealer Label */}
          <div className="mb-2">
            <span className="px-3 py-1 rounded-full bg-black/30 text-white/80 text-xs font-medium backdrop-blur-sm">
              เจ้ามือ
            </span>
          </div>

          {/* Dealer Cards */}
          <div className="flex gap-1 md:gap-2">
            {dealerHand.map((card, index) => (
              <Card
                key={index}
                card={card}
                hidden={!dealerRevealed && index > 0}
                size="md"
              />
            ))}
          </div>

          {/* Dealer Score */}
          {dealerRevealed && dealerEval && (
            <div className="mt-2 flex flex-col items-center">
              <div className="px-4 py-1 rounded-full bg-black/40 backdrop-blur-sm">
                <span className="text-amber-400 font-bold text-lg">
                  {dealerEval.points} แต้ม
                </span>
                {dealerEval.isPok && (
                  <span className="ml-2 text-yellow-300 text-sm">ป๊อก!</span>
                )}
              </div>
              {dealerEval.deng > 1 && (
                <span className="text-emerald-300 text-xs mt-1">
                  {getHandTypeName(dealerEval.handType)} ({dealerEval.deng}{" "}
                  เด้ง)
                </span>
              )}
            </div>
          )}
        </div>

        {/* Middle Area - Game Status & Actions - 30% */}
        <div className="h-[30%] flex flex-col items-center justify-center">
          {/* Dealing Animation */}
          {phase === "dealing" && (
            <div className="flex flex-col items-center animate-pulse">
              <div className="text-3xl mb-2">🃏</div>
              <div className="text-white font-medium text-lg">
                กำลังแจกไพ่...
              </div>
              <div className="flex gap-2 mt-3">
                <div className="w-3 h-3 bg-amber-400 rounded-full animate-bounce" />
                <div className="w-3 h-3 bg-amber-400 rounded-full animate-bounce [animation-delay:0.1s]" />
                <div className="w-3 h-3 bg-amber-400 rounded-full animate-bounce [animation-delay:0.2s]" />
              </div>
            </div>
          )}

          {/* Result Display */}
          {phase === "finished" && myHand?.result && (
            <div className="flex flex-col items-center animate-bounce">
              <div
                className={`text-3xl md:text-4xl font-black ${
                  myHand.result === "win"
                    ? "text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.5)]"
                    : myHand.result === "lose"
                    ? "text-red-400 drop-shadow-[0_0_20px_rgba(248,113,113,0.5)]"
                    : "text-white"
                }`}
              >
                {myHand.result === "win"
                  ? "🎉 ชนะ!"
                  : myHand.result === "lose"
                  ? "แพ้"
                  : "เสมอ"}
              </div>
              {myHand.result !== "tie" && (
                <div
                  className={`text-xl font-bold mt-1 ${
                    myHand.result === "win" ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {myHand.result === "win" ? "+" : ""}
                  {myHand.payout}
                </div>
              )}
            </div>
          )}

          {/* Turn Indicator */}
          {phase === "player_turn" && canTakeAction && (
            <div className="mb-4">
              <span className="px-4 py-2 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 font-medium animate-pulse">
                ตาของคุณ
              </span>
            </div>
          )}

          {/* Action Buttons */}
          {canTakeAction && (
            <div className="flex gap-3 md:gap-4">
              <button
                onClick={onDraw}
                className="relative group px-6 md:px-8 py-3 md:py-4 rounded-2xl font-bold text-lg md:text-xl
                         bg-gradient-to-b from-blue-400 to-blue-600 text-white
                         shadow-[0_4px_0_0_#1e40af,0_6px_20px_rgba(59,130,246,0.5)]
                         hover:shadow-[0_2px_0_0_#1e40af,0_4px_15px_rgba(59,130,246,0.5)]
                         hover:translate-y-[2px]
                         active:shadow-[0_0px_0_0_#1e40af]
                         active:translate-y-[4px]
                         transition-all duration-100"
              >
                <span className="flex items-center gap-2">
                  <span className="text-2xl">🃏</span>
                  จั่ว
                </span>
              </button>
              <button
                onClick={onStand}
                className="relative group px-6 md:px-8 py-3 md:py-4 rounded-2xl font-bold text-lg md:text-xl
                         bg-gradient-to-b from-amber-400 to-amber-600 text-black
                         shadow-[0_4px_0_0_#b45309,0_6px_20px_rgba(245,158,11,0.5)]
                         hover:shadow-[0_2px_0_0_#b45309,0_4px_15px_rgba(245,158,11,0.5)]
                         hover:translate-y-[2px]
                         active:shadow-[0_0px_0_0_#b45309]
                         active:translate-y-[4px]
                         transition-all duration-100"
              >
                <span className="flex items-center gap-2">
                  <span className="text-2xl">✋</span>
                  หงาย
                </span>
              </button>
            </div>
          )}

          {/* Waiting for others */}
          {phase === "player_turn" && !canTakeAction && (
            <div className="flex items-center gap-2 text-white/60">
              <div className="w-2 h-2 rounded-full bg-white/60 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-white/60 animate-bounce [animation-delay:0.1s]" />
              <div className="w-2 h-2 rounded-full bg-white/60 animate-bounce [animation-delay:0.2s]" />
              <span className="ml-2 text-sm">รอผู้เล่นอื่น...</span>
            </div>
          )}
        </div>

        {/* Player Area - Bottom 35% */}
        <div className="h-[35%] flex flex-col items-center justify-start pt-2 overflow-y-auto">
          {isDealer ? (
            /* User is the dealer - show all players' cards */
            <div className="flex flex-col items-center gap-3 w-full">
              {/* Dealer badge */}
              <div className="px-4 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/30 backdrop-blur-sm">
                <span className="text-amber-300 font-medium text-sm">
                  👑 คุณเป็นเจ้ามือ
                </span>
              </div>

              {/* All Players' Cards */}
              <div className="flex flex-wrap justify-center gap-4">
                {playerHands.map((hand) => {
                  const player = players.find((p) => p.odId === hand.playerId);
                  const handEval =
                    hand.cards.length > 0 ? evaluateHand(hand.cards) : null;
                  const isCurrentPlayer = hand.playerId === currentTurn;

                  return (
                    <div
                      key={hand.playerId}
                      className={`flex flex-col items-center p-2 rounded-xl ${
                        isCurrentPlayer
                          ? "bg-amber-500/20 border border-amber-500/30"
                          : "bg-black/20"
                      }`}
                    >
                      {/* Player Name */}
                      <div className="text-xs text-white/80 mb-1">
                        {player?.nickname || "ผู้เล่น"}
                        {player?.isAI && " (AI)"}
                      </div>

                      {/* Cards - Show face down until revealed */}
                      <div className="flex gap-1">
                        {hand.cards.map((card, idx) => (
                          <Card
                            key={idx}
                            card={card}
                            size="sm"
                            hidden={!allCardsRevealed}
                          />
                        ))}
                      </div>

                      {/* Score - Only show when revealed */}
                      {allCardsRevealed && handEval && (
                        <div
                          className={`mt-1 text-xs font-bold ${
                            handEval.isPok ? "text-yellow-300" : "text-white/80"
                          }`}
                        >
                          {handEval.points} แต้ม {handEval.isPok && "ป๊อก!"}
                        </div>
                      )}

                      {/* Status */}
                      <div className="text-[10px] text-white/50 mt-0.5">
                        {allCardsRevealed
                          ? hand.result === "win"
                            ? "🎉 ชนะ"
                            : hand.result === "lose"
                            ? "😢 แพ้"
                            : "🤝 เสมอ"
                          : hand.hasStood
                          ? "✅ หงาย"
                          : hand.hasDrawn
                          ? "🃏 จั่วแล้ว"
                          : isCurrentPlayer
                          ? "⏳ กำลังตัดสินใจ"
                          : "⏳ รอ"}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reveal Button */}
              {canReveal && (
                <button
                  onClick={onReveal}
                  className="px-6 py-3 rounded-2xl font-bold text-lg
                           bg-gradient-to-b from-green-400 to-green-600 text-white
                           shadow-[0_4px_0_0_#166534,0_6px_20px_rgba(34,197,94,0.5)]
                           hover:shadow-[0_2px_0_0_#166534,0_4px_15px_rgba(34,197,94,0.5)]
                           hover:translate-y-[2px]
                           active:shadow-[0_0px_0_0_#166534]
                           active:translate-y-[4px]
                           transition-all duration-100
                           animate-pulse"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-xl">👀</span>
                    เปิดไพ่
                  </span>
                </button>
              )}

              {/* Status Message */}
              {!canReveal && phase === "player_turn" && (
                <p className="text-white/60 text-sm">รอผู้เล่นตัดสินใจ...</p>
              )}
              {!canReveal && phase === "revealing" && (
                <p className="text-yellow-300 text-sm animate-pulse">
                  กำลังเปิดไพ่...
                </p>
              )}
            </div>
          ) : (
            /* User is a player - show their cards */
            <>
              {/* Player Score */}
              {myHandEval && (
                <div className="mb-2 flex flex-col items-center">
                  <div
                    className={`px-4 py-1.5 rounded-full backdrop-blur-sm ${
                      myHandEval.isPok
                        ? "bg-yellow-500/30 border border-yellow-400/50"
                        : "bg-black/40"
                    }`}
                  >
                    <span
                      className={`font-bold text-xl ${
                        myHandEval.isPok ? "text-yellow-300" : "text-white"
                      }`}
                    >
                      {myHandEval.points} แต้ม
                    </span>
                    {myHandEval.isPok && (
                      <span className="ml-2 text-yellow-200 font-bold">
                        ป๊อก!
                      </span>
                    )}
                  </div>
                  {myHandEval.deng > 1 && (
                    <span className="text-emerald-300 text-xs mt-1">
                      {getHandTypeName(myHandEval.handType)} ({myHandEval.deng}{" "}
                      เด้ง)
                    </span>
                  )}
                </div>
              )}

              {/* Player Cards */}
              <div className="flex gap-1 md:gap-2">
                {myHand?.cards.map((card, index) => (
                  <Card
                    key={`${card.suit}-${card.rank}-${index}`}
                    card={card}
                    size="lg"
                  />
                ))}
              </div>

              {/* Player Label */}
              <div className="mt-2">
                <span className="px-3 py-1 rounded-full bg-black/30 text-white/80 text-xs font-medium backdrop-blur-sm">
                  มือของคุณ
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

interface CardProps {
  card: PokDengCard;
  hidden?: boolean;
  size?: "sm" | "md" | "lg";
}

function Card({ card, hidden = false, size = "md" }: CardProps) {
  const display = getCardDisplay(card);

  const sizeClasses = {
    sm: "w-12 h-[4.5rem] text-base",
    md: "w-14 h-20 md:w-16 md:h-24 text-lg md:text-xl",
    lg: "w-16 h-24 md:w-20 md:h-28 text-xl md:text-2xl",
  };

  const suitSizeClasses = {
    sm: "text-lg",
    md: "text-xl md:text-2xl",
    lg: "text-2xl md:text-3xl",
  };

  return (
    <div
      className={`
        relative rounded-lg overflow-hidden
        ${sizeClasses[size]}
        ${hidden ? "" : "bg-white"}
        shadow-[0_4px_8px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.1)]
        transform-gpu transition-all duration-300
        hover:scale-105 hover:-translate-y-1
      `}
    >
      {hidden ? (
        /* Card Back Design */
        <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-blue-800 to-purple-900">
          <div className="absolute inset-1 rounded border border-white/20">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/10 flex items-center justify-center">
                <span className="text-xl md:text-2xl">🎴</span>
              </div>
            </div>
            {/* Pattern */}
            <div className="absolute inset-2 opacity-20">
              <div className="w-full h-full bg-[repeating-linear-gradient(45deg,transparent,transparent_4px,rgba(255,255,255,0.1)_4px,rgba(255,255,255,0.1)_8px)]" />
            </div>
          </div>
        </div>
      ) : (
        /* Card Face */
        <div className="absolute inset-0 flex flex-col items-center justify-center p-1">
          {/* Top left corner */}
          <div className="absolute top-1 left-1.5 flex flex-col items-center leading-none">
            <span
              className={`font-bold ${sizeClasses[size].split(" ").pop()} ${
                display.color === "red" ? "text-red-600" : "text-gray-900"
              }`}
            >
              {display.rank}
            </span>
            <span
              className={`${
                display.color === "red" ? "text-red-600" : "text-gray-900"
              }`}
              style={{ fontSize: "0.65em" }}
            >
              {display.suit}
            </span>
          </div>

          {/* Center suit */}
          <span
            className={`${suitSizeClasses[size]} ${
              display.color === "red" ? "text-red-600" : "text-gray-900"
            }`}
          >
            {display.suit}
          </span>

          {/* Bottom right corner (upside down) */}
          <div className="absolute bottom-1 right-1.5 flex flex-col items-center leading-none rotate-180">
            <span
              className={`font-bold ${sizeClasses[size].split(" ").pop()} ${
                display.color === "red" ? "text-red-600" : "text-gray-900"
              }`}
            >
              {display.rank}
            </span>
            <span
              className={`${
                display.color === "red" ? "text-red-600" : "text-gray-900"
              }`}
              style={{ fontSize: "0.65em" }}
            >
              {display.suit}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// Export Card component for use in 3D view
export { Card as PokDengCard2D };
