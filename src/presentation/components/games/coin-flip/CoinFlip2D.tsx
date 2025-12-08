"use client";

import type {
  CoinFlipRound,
  CoinGuess,
  CoinSide,
} from "@/src/domain/types/coinFlipState";
import { COIN_ICONS, COIN_NAMES } from "@/src/domain/types/coinFlipState";

interface CoinFlip2DProps {
  phase: "guessing" | "flipping" | "revealing" | "finished";
  hasGuessed: boolean;
  myCurrentGuess: CoinGuess;
  opponentHasGuessed: boolean;
  currentRound: number;
  maxRounds: number;
  player1Score: number;
  player2Score: number;
  currentFlipResult: CoinSide | null;
  rounds: CoinFlipRound[];
  onGuess: (guess: CoinGuess) => void;
}

/**
 * 2D HTML/CSS rendering of Coin Flip
 */
export function CoinFlip2D({
  phase,
  hasGuessed,
  myCurrentGuess,
  opponentHasGuessed,
  currentRound,
  maxRounds,
  player1Score,
  player2Score,
  currentFlipResult,
  rounds,
  onGuess,
}: CoinFlip2DProps) {
  return (
    <div className="h-full flex flex-col items-center justify-center p-4 gap-6">
      {/* Score Display */}
      <div className="flex items-center gap-8 text-2xl font-bold">
        <div className="text-center">
          <div className="text-4xl text-info">{player1Score}</div>
          <div className="text-sm text-muted">คุณ</div>
        </div>
        <div className="text-muted">-</div>
        <div className="text-center">
          <div className="text-4xl text-error">{player2Score}</div>
          <div className="text-sm text-muted">คู่แข่ง</div>
        </div>
      </div>

      {/* Round Info */}
      <div className="text-center">
        <div className="text-lg font-medium text-warning">
          รอบ {currentRound}/{maxRounds}
        </div>
      </div>

      {/* Coin Display */}
      <div className="relative w-32 h-32">
        <div
          className={`
            w-full h-full rounded-full flex items-center justify-center text-6xl
            bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg
            transition-all duration-500
            ${phase === "flipping" ? "animate-spin" : ""}
          `}
        >
          {phase === "revealing" || phase === "finished"
            ? currentFlipResult === "heads"
              ? "🪙"
              : "⭐"
            : "❓"}
        </div>
      </div>

      {/* Result Text */}
      {(phase === "revealing" || phase === "finished") && currentFlipResult && (
        <div className="text-center">
          <div className="text-xl font-bold">
            {COIN_NAMES[currentFlipResult]}!
          </div>
          <div className="text-sm text-muted mt-1">
            {myCurrentGuess === currentFlipResult ? (
              <span className="text-success">คุณทายถูก! ✓</span>
            ) : (
              <span className="text-error">คุณทายผิด ✗</span>
            )}
          </div>
        </div>
      )}

      {/* Guess Status */}
      {phase === "guessing" && (
        <div className="text-center text-sm text-muted">
          {hasGuessed
            ? `คุณเลือก ${COIN_NAMES[myCurrentGuess!]} แล้ว - ${
                opponentHasGuessed ? "รอเปิดเหรียญ..." : "รอคู่แข่ง..."
              }`
            : "เลือกหัวหรือก้อย!"}
        </div>
      )}

      {/* Guess Buttons */}
      {phase === "guessing" && !hasGuessed && (
        <div className="flex items-center gap-6">
          <button
            onClick={() => onGuess("heads")}
            className="flex flex-col items-center gap-2 p-6 rounded-xl bg-surface border-2 border-border hover:border-info hover:bg-info/10 transition-all active:scale-95"
          >
            <span className="text-5xl">🪙</span>
            <span className="text-lg font-medium">หัว</span>
          </button>
          <button
            onClick={() => onGuess("tails")}
            className="flex flex-col items-center gap-2 p-6 rounded-xl bg-surface border-2 border-border hover:border-warning hover:bg-warning/10 transition-all active:scale-95"
          >
            <span className="text-5xl">⭐</span>
            <span className="text-lg font-medium">ก้อย</span>
          </button>
        </div>
      )}

      {/* Round History */}
      {rounds.length > 0 && (
        <div className="w-full max-w-sm">
          <div className="text-sm font-medium text-muted mb-2">ประวัติ</div>
          <div className="flex flex-col gap-1">
            {rounds.map((round, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2 rounded-lg bg-surface text-sm"
              >
                <span>รอบ {round.roundNumber}</span>
                <div className="flex items-center gap-2">
                  <span>{COIN_ICONS[round.result]}</span>
                  <span className="text-muted">{COIN_NAMES[round.result]}</span>
                </div>
                <span
                  className={
                    round.player1Correct ? "text-success" : "text-error"
                  }
                >
                  {round.player1Correct ? "✓ ถูก" : "✗ ผิด"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
