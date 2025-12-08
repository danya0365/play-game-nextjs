"use client";

import type {
  DiceRollRound,
  DiceValue,
} from "@/src/domain/types/diceRollState";
import { DICE_ICONS } from "@/src/domain/types/diceRollState";

interface DiceRoll2DProps {
  phase: "rolling" | "revealing" | "finished";
  hasRolled: boolean;
  myCurrentRoll: DiceValue;
  opponentRoll: DiceValue;
  opponentHasRolled: boolean;
  currentRound: number;
  maxRounds: number;
  player1Score: number;
  player2Score: number;
  rounds: DiceRollRound[];
  onRoll: () => void;
}

/**
 * 2D HTML/CSS rendering of Dice Roll
 */
export function DiceRoll2D({
  phase,
  hasRolled,
  myCurrentRoll,
  opponentRoll,
  opponentHasRolled,
  currentRound,
  maxRounds,
  player1Score,
  player2Score,
  rounds,
  onRoll,
}: DiceRoll2DProps) {
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

      {/* Dice Display */}
      <div className="flex items-center gap-8">
        {/* My Dice */}
        <div className="text-center">
          <div
            className={`
              w-24 h-24 flex items-center justify-center text-6xl
              bg-surface rounded-xl border-2 border-info shadow-lg
              ${!hasRolled && phase === "rolling" ? "animate-pulse" : ""}
            `}
          >
            {hasRolled && myCurrentRoll ? DICE_ICONS[myCurrentRoll] : "🎲"}
          </div>
          <div className="mt-2 text-sm text-muted">คุณ</div>
          {hasRolled && myCurrentRoll && (
            <div className="text-xl font-bold text-info">{myCurrentRoll}</div>
          )}
        </div>

        {/* VS */}
        <div className="text-2xl text-muted font-bold">VS</div>

        {/* Opponent Dice */}
        <div className="text-center">
          <div
            className={`
              w-24 h-24 flex items-center justify-center text-6xl
              bg-surface rounded-xl border-2 border-error shadow-lg
              ${
                !opponentHasRolled && phase === "rolling" ? "animate-pulse" : ""
              }
            `}
          >
            {(phase === "revealing" || phase === "finished") && opponentRoll
              ? DICE_ICONS[opponentRoll]
              : opponentHasRolled
              ? "✓"
              : "🎲"}
          </div>
          <div className="mt-2 text-sm text-muted">คู่แข่ง</div>
          {(phase === "revealing" || phase === "finished") && opponentRoll && (
            <div className="text-xl font-bold text-error">{opponentRoll}</div>
          )}
        </div>
      </div>

      {/* Result Text */}
      {(phase === "revealing" || phase === "finished") &&
        myCurrentRoll &&
        opponentRoll && (
          <div className="text-center">
            <div
              className={`text-xl font-bold ${
                myCurrentRoll > opponentRoll
                  ? "text-success"
                  : myCurrentRoll < opponentRoll
                  ? "text-error"
                  : "text-muted"
              }`}
            >
              {myCurrentRoll > opponentRoll
                ? "คุณชนะรอบนี้! 🎉"
                : myCurrentRoll < opponentRoll
                ? "คุณแพ้รอบนี้ 😢"
                : "เสมอ! 🤝"}
            </div>
          </div>
        )}

      {/* Roll Status */}
      {phase === "rolling" && (
        <div className="text-center text-sm text-muted">
          {hasRolled
            ? `คุณทอยได้ ${myCurrentRoll} - ${
                opponentHasRolled ? "รอเปิดผล..." : "รอคู่แข่ง..."
              }`
            : "กดปุ่มเพื่อทอยลูกเต๋า!"}
        </div>
      )}

      {/* Roll Button */}
      {phase === "rolling" && !hasRolled && (
        <button
          onClick={onRoll}
          className="px-8 py-4 rounded-xl bg-primary text-primary-content font-bold text-xl hover:bg-primary/90 transition-all active:scale-95"
        >
          🎲 ทอยเลย!
        </button>
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
                  <span className="text-info">
                    {round.player1Roll && DICE_ICONS[round.player1Roll]}
                  </span>
                  <span className="text-muted">vs</span>
                  <span className="text-error">
                    {round.player2Roll && DICE_ICONS[round.player2Roll]}
                  </span>
                </div>
                <span
                  className={
                    round.winner === "player1"
                      ? "text-success"
                      : round.winner === "player2"
                      ? "text-error"
                      : "text-muted"
                  }
                >
                  {round.winner === "player1"
                    ? "✓ ชนะ"
                    : round.winner === "player2"
                    ? "✗ แพ้"
                    : "เสมอ"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
