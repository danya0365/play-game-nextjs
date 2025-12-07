"use client";

import type {
  RPSChoice,
  RPSRound,
} from "@/src/domain/types/rockPaperScissorsState";
import {
  CHOICE_ICONS,
  CHOICE_NAMES,
} from "@/src/domain/types/rockPaperScissorsState";

interface RockPaperScissors2DProps {
  phase: "choosing" | "revealing" | "finished";
  hasChosen: boolean;
  myCurrentChoice: RPSChoice;
  opponentHasChosen: boolean;
  opponentChoice: RPSChoice;
  currentRound: number;
  maxRounds: number;
  player1Score: number;
  player2Score: number;
  rounds: RPSRound[];
  isMyTurn: boolean; // In RPS, both can choose at the same time
  onChoice: (choice: RPSChoice) => void;
}

const CHOICES: RPSChoice[] = ["rock", "paper", "scissors"];

/**
 * 2D HTML/CSS rendering of Rock Paper Scissors
 */
export function RockPaperScissors2D({
  phase,
  hasChosen,
  myCurrentChoice,
  opponentHasChosen,
  opponentChoice,
  currentRound,
  maxRounds,
  player1Score,
  player2Score,
  rounds,
  onChoice,
}: RockPaperScissors2DProps) {
  return (
    <div className="h-full flex flex-col items-center justify-center p-4 gap-6">
      {/* Score Display */}
      <div className="flex items-center gap-8 text-2xl font-bold">
        <div className="text-center">
          <div className="text-4xl">{player1Score}</div>
          <div className="text-sm text-muted">คุณ</div>
        </div>
        <div className="text-muted">VS</div>
        <div className="text-center">
          <div className="text-4xl">{player2Score}</div>
          <div className="text-sm text-muted">คู่แข่ง</div>
        </div>
      </div>

      {/* Round Info */}
      <div className="text-center">
        <div className="text-lg font-medium">
          รอบที่ {currentRound} / {maxRounds}
        </div>
        {phase === "choosing" && (
          <div className="text-sm text-muted mt-1">
            {hasChosen ? "รอคู่แข่งเลือก..." : "เลือกเลย!"}
          </div>
        )}
      </div>

      {/* Battle Area */}
      <div className="flex items-center justify-center gap-8">
        {/* My Choice */}
        <div className="text-center">
          <div
            className={`
              w-24 h-24 rounded-2xl flex items-center justify-center text-5xl
              transition-all duration-300
              ${
                hasChosen
                  ? "bg-info/20 border-2 border-info"
                  : "bg-surface border-2 border-border"
              }
            `}
          >
            {phase === "revealing" || phase === "finished"
              ? myCurrentChoice
                ? CHOICE_ICONS[myCurrentChoice]
                : "❓"
              : hasChosen
              ? "✓"
              : "❓"}
          </div>
          <div className="mt-2 text-sm font-medium">คุณ</div>
        </div>

        {/* VS */}
        <div className="text-2xl font-bold text-muted">⚔️</div>

        {/* Opponent Choice */}
        <div className="text-center">
          <div
            className={`
              w-24 h-24 rounded-2xl flex items-center justify-center text-5xl
              transition-all duration-300
              ${
                opponentHasChosen
                  ? "bg-error/20 border-2 border-error"
                  : "bg-surface border-2 border-border"
              }
            `}
          >
            {phase === "revealing" || phase === "finished"
              ? opponentChoice
                ? CHOICE_ICONS[opponentChoice]
                : "❓"
              : opponentHasChosen
              ? "✓"
              : "❓"}
          </div>
          <div className="mt-2 text-sm font-medium">คู่แข่ง</div>
        </div>
      </div>

      {/* Choice Buttons */}
      {phase === "choosing" && !hasChosen && (
        <div className="flex items-center gap-4">
          {CHOICES.map((choice) => (
            <button
              key={choice}
              onClick={() => onChoice(choice)}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-surface border-2 border-border hover:border-info hover:bg-info/10 transition-all active:scale-95"
            >
              <span className="text-4xl">{CHOICE_ICONS[choice!]}</span>
              <span className="text-sm font-medium">
                {CHOICE_NAMES[choice!]}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Round History */}
      {rounds.length > 0 && (
        <div className="w-full max-w-xs">
          <div className="text-sm font-medium text-muted mb-2">ประวัติ</div>
          <div className="flex flex-col gap-1">
            {rounds.map((round, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2 rounded-lg bg-surface text-sm"
              >
                <span>รอบ {round.roundNumber}</span>
                <div className="flex items-center gap-2">
                  <span>{CHOICE_ICONS[round.player1Choice!]}</span>
                  <span className="text-muted">vs</span>
                  <span>{CHOICE_ICONS[round.player2Choice!]}</span>
                </div>
                <span
                  className={
                    round.result === "player1"
                      ? "text-success"
                      : round.result === "player2"
                      ? "text-error"
                      : "text-muted"
                  }
                >
                  {round.result === "player1"
                    ? "ชนะ"
                    : round.result === "player2"
                    ? "แพ้"
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
