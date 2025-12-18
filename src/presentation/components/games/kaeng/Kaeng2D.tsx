"use client";

import type {
  KaengCard,
  KaengLogEntry,
  KaengPhase,
  KaengPlayerHand,
} from "@/src/domain/types/kaengState";
import {
  evaluateHand,
  getCardDisplay,
  getHandTypeName,
} from "@/src/domain/types/kaengState";
import { ChevronDown, ChevronUp, ScrollText } from "lucide-react";
import { useState } from "react";

interface Kaeng2DProps {
  playerHands: KaengPlayerHand[];
  myPlayerId: string;
  myHand?: KaengPlayerHand;
  isBanker: boolean;
  phase: KaengPhase;
  canTakeAction: boolean;
  canBankerReveal: boolean;
  currentTurn: string;
  bankerId: string;
  players: { odId: string; nickname: string; isAI?: boolean }[];
  gameLog: KaengLogEntry[];
  allCardsRevealed: boolean;
  onReveal: () => void;
  onFold: () => void;
  onBankerReveal: () => void;
}

// Card component
function Card({
  card,
  size = "md",
  hidden = false,
}: {
  card: KaengCard;
  size?: "sm" | "md" | "lg";
  hidden?: boolean;
}) {
  const sizeClasses = {
    sm: "w-10 h-14 text-sm",
    md: "w-14 h-20 text-lg",
    lg: "w-20 h-28 text-2xl",
  };

  if (hidden) {
    return (
      <div
        className={`${sizeClasses[size]} rounded-lg bg-gradient-to-br from-blue-800 to-blue-900 border-2 border-blue-600 shadow-lg flex items-center justify-center`}
      >
        <div className="w-3/4 h-3/4 rounded border border-blue-500/50 bg-blue-700/50" />
      </div>
    );
  }

  const display = getCardDisplay(card);
  const colorClass = display.color === "red" ? "text-red-500" : "text-gray-900";

  return (
    <div
      className={`${sizeClasses[size]} rounded-lg bg-white border-2 border-gray-200 shadow-lg flex flex-col items-center justify-center ${colorClass}`}
    >
      <span className="font-bold">{display.rank}</span>
      <span>{display.suit}</span>
    </div>
  );
}

/**
 * 2D HTML/CSS rendering of Kaeng game
 * Casino-style fixed layout
 */
export function Kaeng2D({
  playerHands,
  myPlayerId,
  myHand,
  isBanker,
  phase,
  canTakeAction,
  canBankerReveal,
  currentTurn,
  bankerId,
  players,
  gameLog,
  allCardsRevealed,
  onReveal,
  onFold,
  onBankerReveal,
}: Kaeng2DProps) {
  const [showLog, setShowLog] = useState(true);

  // Get my hand evaluation
  const myHandEval = myHand?.cards.length ? evaluateHand(myHand.cards) : null;

  // Find current turn player name
  const currentTurnPlayer = players.find((p) => p.odId === currentTurn);
  const bankerPlayer = players.find((p) => p.odId === bankerId);

  // Get phase text
  const getPhaseText = () => {
    switch (phase) {
      case "betting":
        return "🎰 วางเดิมพัน";
      case "dealing":
        return "🃏 แจกไพ่";
      case "playing":
        return "🤔 ผู้เล่นเปิดไพ่";
      case "revealing":
        return "👀 เจ้ามือเปิดไพ่";
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
                let textColor = "text-white/80";
                if (entry.type === "game_start") textColor = "text-cyan-300";
                if (entry.type === "dealing") textColor = "text-amber-300";
                if (entry.type === "dealt") textColor = "text-emerald-300";
                if (entry.type === "player_action") textColor = "text-blue-300";
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

      {/* Table felt background */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900 via-purple-800 to-purple-900">
        <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-b from-amber-900/50 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-2 bg-gradient-to-t from-amber-900/50 to-transparent" />
        <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-px bg-purple-600/30" />
      </div>

      {/* Game Content */}
      <div className="relative z-10 flex flex-col h-full p-4">
        {/* Banker Area */}
        <div className="shrink-0 flex flex-col items-center pt-2">
          <div className="px-4 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 mb-2">
            <span className="text-amber-300 text-sm font-medium">
              👑 เจ้ามือ: {bankerPlayer?.nickname || "Unknown"}
              {bankerPlayer?.isAI && " (AI)"}
              {bankerId === myPlayerId && " (คุณ)"}
            </span>
          </div>

          {/* Banker's cards (hidden until reveal) */}
          <div className="flex gap-2">
            {playerHands
              .find((h) => h.playerId === bankerId)
              ?.cards.map((card, idx) => (
                <Card
                  key={idx}
                  card={card}
                  size="md"
                  hidden={!allCardsRevealed && bankerId !== myPlayerId}
                />
              ))}
          </div>

          {/* Banker's hand info after reveal */}
          {allCardsRevealed && (
            <div className="mt-2 text-center">
              {(() => {
                const bankerHand = playerHands.find(
                  (h) => h.playerId === bankerId
                );
                if (!bankerHand?.cards.length) return null;
                const bankerEval = evaluateHand(bankerHand.cards);
                return (
                  <div className="text-white/80 text-sm">
                    <span className="font-bold text-amber-300">
                      {getHandTypeName(bankerEval.handType)}
                    </span>
                    {bankerEval.handType === "normal" && (
                      <span className="ml-1">({bankerEval.points} แต้ม)</span>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* Middle Section - Other Players */}
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-wrap justify-center gap-4 max-w-2xl">
            {playerHands
              .filter(
                (hand) =>
                  hand.playerId !== bankerId && hand.playerId !== myPlayerId
              )
              .map((hand) => {
                const player = players.find((p) => p.odId === hand.playerId);
                const handEval = hand.cards.length
                  ? evaluateHand(hand.cards)
                  : null;
                const isCurrentPlayer = hand.playerId === currentTurn;

                return (
                  <div
                    key={hand.playerId}
                    className={`flex flex-col items-center p-3 rounded-xl ${
                      isCurrentPlayer
                        ? "bg-amber-500/20 border border-amber-500/30"
                        : "bg-black/20"
                    }`}
                  >
                    <div className="text-xs text-white/80 mb-2">
                      {player?.nickname || "ผู้เล่น"}
                      {player?.isAI && " (AI)"}
                    </div>

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

                    {allCardsRevealed && handEval && (
                      <div className="mt-2 text-xs font-bold text-white/80">
                        {getHandTypeName(handEval.handType)}
                        {handEval.handType === "normal" &&
                          ` (${handEval.points})`}
                      </div>
                    )}

                    <div className="text-[10px] text-white/50 mt-1">
                      {allCardsRevealed
                        ? hand.result === "win"
                          ? "🎉 ชนะ"
                          : hand.result === "lose"
                          ? "😢 แพ้"
                          : "🤝 เสมอ"
                        : hand.hasRevealed
                        ? "👀 เปิดแล้ว"
                        : isCurrentPlayer
                        ? "⏳ กำลังตัดสินใจ"
                        : "⏳ รอ"}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Player Area - My Hand */}
        <div className="shrink-0 flex flex-col items-center pb-4">
          {isBanker ? (
            // Banker view
            <div className="flex flex-col items-center gap-3">
              <div className="px-4 py-1 rounded-full bg-amber-500/30 border border-amber-400/50">
                <span className="text-amber-200 font-medium">
                  👑 คุณเป็นเจ้ามือ
                </span>
              </div>

              {/* Banker's cards (always visible to self) */}
              <div className="flex gap-2 min-h-[80px] items-center">
                {myHand?.cards && myHand.cards.length > 0 ? (
                  myHand.cards.map((card, idx) => (
                    <Card key={idx} card={card} size="lg" />
                  ))
                ) : (
                  <span className="text-white/50 text-sm">รอแจกไพ่...</span>
                )}
              </div>

              {myHandEval && (
                <div className="text-white font-bold">
                  {getHandTypeName(myHandEval.handType)}
                  {myHandEval.handType === "normal" &&
                    ` (${myHandEval.points} แต้ม)`}
                </div>
              )}

              {canBankerReveal && (
                <button
                  onClick={onBankerReveal}
                  className="px-6 py-3 rounded-2xl font-bold text-lg
                           bg-gradient-to-b from-green-400 to-green-600 text-white
                           shadow-lg hover:shadow-xl transition-all animate-pulse"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-xl">👀</span>
                    เปิดไพ่
                  </span>
                </button>
              )}

              {phase === "playing" && (
                <p className="text-white/60 text-sm">รอผู้เล่นเปิดไพ่...</p>
              )}
            </div>
          ) : (
            // Player view
            <div className="flex flex-col items-center gap-3">
              {/* My Score */}
              {myHandEval && (
                <div className="px-4 py-1.5 rounded-full backdrop-blur-sm bg-black/40">
                  <span className="font-bold text-xl text-white">
                    {getHandTypeName(myHandEval.handType)}
                  </span>
                  {myHandEval.handType === "normal" && (
                    <span className="ml-2 text-white/80">
                      ({myHandEval.points} แต้ม)
                    </span>
                  )}
                </div>
              )}

              {/* My Cards */}
              <div className="flex gap-2 min-h-[112px] items-center">
                {myHand?.cards && myHand.cards.length > 0 ? (
                  myHand.cards.map((card, idx) => (
                    <Card key={idx} card={card} size="lg" />
                  ))
                ) : (
                  <span className="text-white/50 text-sm">รอแจกไพ่...</span>
                )}
              </div>

              {/* Action Buttons */}
              {canTakeAction && myHand?.cards && myHand.cards.length > 0 && (
                <div className="flex gap-3 mt-2">
                  <button
                    onClick={onReveal}
                    className="px-6 py-3 rounded-2xl font-bold text-lg
                             bg-gradient-to-b from-green-400 to-green-600 text-white
                             shadow-lg hover:shadow-xl transition-all"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-xl">👀</span>
                      เปิดไพ่
                    </span>
                  </button>
                  <button
                    onClick={onFold}
                    className="px-6 py-3 rounded-2xl font-bold text-lg
                             bg-gradient-to-b from-gray-500 to-gray-700 text-white
                             shadow-lg hover:shadow-xl transition-all"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-xl">🏳️</span>
                      หมอบ
                    </span>
                  </button>
                </div>
              )}

              {/* Status when waiting */}
              {!canTakeAction && phase === "playing" && (
                <p className="text-white/60 text-sm">
                  {myHand?.hasRevealed ? "รอผู้เล่นคนอื่น..." : "รอตา..."}
                </p>
              )}

              {/* Result */}
              {allCardsRevealed && myHand?.result && (
                <div
                  className={`mt-2 px-4 py-2 rounded-full font-bold ${
                    myHand.result === "win"
                      ? "bg-green-500/30 text-green-300"
                      : myHand.result === "lose"
                      ? "bg-red-500/30 text-red-300"
                      : "bg-gray-500/30 text-gray-300"
                  }`}
                >
                  {myHand.result === "win"
                    ? `🎉 ชนะ +${myHand.payout}`
                    : myHand.result === "lose"
                    ? `😢 แพ้ ${myHand.payout}`
                    : "🤝 เสมอ"}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
