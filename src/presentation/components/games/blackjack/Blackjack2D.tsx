"use client";

import type {
    BlackjackCard,
    BlackjackLogEntry,
    BlackjackPhase,
    BlackjackPlayerHand
} from "@/src/domain/types/blackjackState";
import {
    calculateHandValue,
    getSuitColor,
    getSuitEmoji,
} from "@/src/domain/types/blackjackState";
import { ChevronDown, ChevronUp, ScrollText } from "lucide-react";
import { useState } from "react";

interface Blackjack2DProps {
  dealerHand: BlackjackCard[];
  dealerRevealed: boolean;
  playerHands: BlackjackPlayerHand[];
  myPlayerId: string;
  myHand?: BlackjackPlayerHand;
  phase: BlackjackPhase;
  canTakeAction: boolean;
  currentTurn: string;
  dealerId: string;
  players: { odId: string; nickname: string; isAI?: boolean }[];
  gameLog: BlackjackLogEntry[];
  onHit: () => void;
  onStand: () => void;
}

/**
 * 2D HTML/CSS rendering of Blackjack game
 * Casino-style fixed layout
 */
export function Blackjack2D({
  dealerHand,
  dealerRevealed,
  playerHands,
  myPlayerId,
  myHand,
  phase,
  canTakeAction,
  currentTurn,
  dealerId,
  players,
  gameLog,
  onHit,
  onStand,
}: Blackjack2DProps) {
  const [showLog, setShowLog] = useState(true);

  // Get my hand value
  const myHandValue = myHand ? calculateHandValue(myHand.cards) : 0;

  // Get dealer visible value
  const dealerVisibleValue =
    dealerHand.length > 0
      ? dealerRevealed
        ? calculateHandValue(dealerHand)
        : calculateHandValue([dealerHand[0]])
      : 0;

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
      case "dealer_turn":
        return "👑 ตาเจ้ามือ";
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
          <div className="mt-1 p-3 rounded-lg bg-black/70 backdrop-blur-sm border border-white/10 text-xs max-h-[50vh] overflow-y-auto">
            {/* Header with Phase */}
            <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
              <span className="text-amber-400 font-medium">
                {getPhaseText()}
              </span>
              <span className="text-white/60">{players.length} คน</span>
            </div>

            {/* Step-by-step Game Log */}
            <div className="space-y-1.5">
              {gameLog.slice(-10).map((entry) => {
                let textColor = "text-white/80";
                if (entry.type === "game_start") textColor = "text-cyan-300";
                if (entry.type === "dealing") textColor = "text-amber-300";
                if (entry.type === "dealt") textColor = "text-emerald-300";
                if (entry.type === "player_action") textColor = "text-blue-300";
                if (entry.type === "dealer_action")
                  textColor = "text-purple-300";
                if (entry.type === "result") textColor = "text-pink-300";

                return (
                  <div
                    key={entry.id}
                    className={`${textColor} leading-relaxed py-0.5 border-l-2 pl-2 ${
                      entry.type === "result"
                        ? "border-pink-500"
                        : entry.type === "dealer_action"
                          ? "border-purple-500"
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
                  {currentTurnPlayer?.nickname || "เจ้ามือ"}
                  {currentTurnPlayer?.isAI && " (AI)"}
                  {currentTurn === myPlayerId && " (คุณ)"}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Table felt background */}
      <div className="absolute inset-0 bg-gradient-to-b from-green-800 via-green-700 to-green-800">
        <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-b from-amber-900/50 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-2 bg-gradient-to-t from-amber-900/50 to-transparent" />
        {/* Blackjack text */}
        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 opacity-10">
          <span className="text-6xl md:text-8xl font-bold text-white">BLACKJACK</span>
        </div>
        {/* 21 pays 3:2 */}
        <div className="absolute left-1/2 -translate-x-1/2 top-[15%] opacity-30">
          <span className="text-xs text-white">BLACKJACK PAYS 3 TO 2</span>
        </div>
      </div>

      {/* Game Content */}
      <div className="relative flex-1 flex flex-col">
        {/* Dealer Area - Top 35% */}
        <div className="h-[35%] flex flex-col items-center justify-end pb-2">
          {/* Dealer Label */}
          <div className="mb-2">
            <span className="px-3 py-1 rounded-full bg-black/30 text-white/80 text-xs font-medium backdrop-blur-sm">
              👑 DEALER
            </span>
          </div>

          {/* Dealer Cards */}
          <div className="flex gap-1 md:gap-2">
            {dealerHand.map((card, index) => (
              <Card
                key={index}
                card={card}
                hidden={!dealerRevealed && index === 1}
                size="md"
              />
            ))}
          </div>

          {/* Dealer Score */}
          <div className="mt-2">
            <div className="px-4 py-1 rounded-full bg-black/40 backdrop-blur-sm">
              <span className="text-amber-400 font-bold text-lg">
                {dealerRevealed ? (
                  <>
                    {calculateHandValue(dealerHand)}
                    {calculateHandValue(dealerHand) > 21 && (
                      <span className="ml-2 text-red-400">BUST!</span>
                    )}
                  </>
                ) : (
                  <>
                    {dealerVisibleValue}
                    <span className="text-white/50"> + ?</span>
                  </>
                )}
              </span>
            </div>
          </div>
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

          {/* Dealer Turn */}
          {phase === "dealer_turn" && (
            <div className="flex flex-col items-center animate-pulse">
              <div className="text-3xl mb-2">👑</div>
              <div className="text-white font-medium text-lg">
                เจ้ามือกำลังเล่น...
              </div>
            </div>
          )}

          {/* Result Display */}
          {phase === "finished" && myHand?.result && (
            <div className="flex flex-col items-center animate-bounce">
              <div
                className={`text-3xl md:text-4xl font-black ${
                  myHand.result === "win" || myHand.result === "blackjack"
                    ? "text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.5)]"
                    : myHand.result === "lose"
                      ? "text-red-400 drop-shadow-[0_0_20px_rgba(248,113,113,0.5)]"
                      : "text-white"
                }`}
              >
                {myHand.result === "blackjack"
                  ? "🎉 BLACKJACK!"
                  : myHand.result === "win"
                    ? "🎉 ชนะ!"
                    : myHand.result === "lose"
                      ? "แพ้"
                      : "🤝 เสมอ"}
              </div>
              {myHand.payout !== 0 && (
                <div
                  className={`text-xl font-bold mt-1 ${
                    myHand.payout! > 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {myHand.payout! > 0 ? "+" : ""}
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
                onClick={onHit}
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
                  HIT
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
                  STAND
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
        <div className="h-[35%] flex flex-col items-center justify-start pt-2">
          {/* Player Score */}
          {myHand && myHand.cards.length > 0 && (
            <div className="mb-2 flex flex-col items-center">
              <div
                className={`px-4 py-1.5 rounded-full backdrop-blur-sm ${
                  myHand.hasBlackjack
                    ? "bg-yellow-500/30 border border-yellow-400/50"
                    : myHand.hasBusted
                      ? "bg-red-500/30 border border-red-400/50"
                      : "bg-black/40"
                }`}
              >
                <span
                  className={`font-bold text-xl ${
                    myHand.hasBlackjack
                      ? "text-yellow-300"
                      : myHand.hasBusted
                        ? "text-red-400"
                        : "text-white"
                  }`}
                >
                  {myHandValue}
                  {myHand.hasBlackjack && (
                    <span className="ml-2 text-yellow-200">BLACKJACK!</span>
                  )}
                  {myHand.hasBusted && (
                    <span className="ml-2 text-red-300">BUST!</span>
                  )}
                </span>
              </div>
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
        </div>
      </div>
    </div>
  );
}

interface CardProps {
  card: BlackjackCard;
  hidden?: boolean;
  size?: "sm" | "md" | "lg";
}

function Card({ card, hidden = false, size = "md" }: CardProps) {
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

  const color = getSuitColor(card.suit);
  const textColor = color === "red" ? "text-red-600" : "text-gray-900";

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
        <div className="absolute inset-0 bg-gradient-to-br from-red-700 via-red-800 to-red-900">
          <div className="absolute inset-1 rounded border border-white/20">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/10 flex items-center justify-center">
                <span className="text-xl md:text-2xl">♠️</span>
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
            <span className={`font-bold ${textColor}`}>{card.rank}</span>
            <span className={`${textColor}`} style={{ fontSize: "0.65em" }}>
              {getSuitEmoji(card.suit)}
            </span>
          </div>

          {/* Center suit */}
          <span className={`${suitSizeClasses[size]} ${textColor}`}>
            {getSuitEmoji(card.suit)}
          </span>

          {/* Bottom right corner (upside down) */}
          <div className="absolute bottom-1 right-1.5 flex flex-col items-center leading-none rotate-180">
            <span className={`font-bold ${textColor}`}>{card.rank}</span>
            <span className={`${textColor}`} style={{ fontSize: "0.65em" }}>
              {getSuitEmoji(card.suit)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// Export Card component for use in 3D view
export { Card as BlackjackCard2D };
