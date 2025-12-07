"use client";

import type { TicTacToeMark } from "@/src/domain/types/gameState";

interface TicTacToe2DProps {
  board: (TicTacToeMark | null)[];
  winningLine: number[] | null;
  isMyTurn: boolean;
  onCellClick: (index: number) => void;
}

/**
 * 2D HTML/CSS Fallback for Tic Tac Toe
 * Used when WebGL/3D is not available or device performance is low
 */
export function TicTacToe2D({
  board,
  winningLine,
  isMyTurn,
  onCellClick,
}: TicTacToe2DProps) {
  const isWinningCell = (index: number) =>
    winningLine?.includes(index) ?? false;

  return (
    <div className="flex items-center justify-center h-full p-4">
      <div className="grid grid-cols-3 gap-2 md:gap-3 w-full max-w-xs md:max-w-sm aspect-square">
        {board.map((mark, index) => (
          <Cell
            key={index}
            mark={mark}
            isWinning={isWinningCell(index)}
            isClickable={isMyTurn && mark === null}
            onClick={() => onCellClick(index)}
          />
        ))}
      </div>
    </div>
  );
}

interface CellProps {
  mark: TicTacToeMark | null;
  isWinning: boolean;
  isClickable: boolean;
  onClick: () => void;
}

function Cell({ mark, isWinning, isClickable, onClick }: CellProps) {
  const baseClasses =
    "aspect-square rounded-xl flex items-center justify-center transition-all duration-200 select-none";

  const stateClasses = isWinning
    ? "bg-success/20 border-2 border-success shadow-lg shadow-success/20"
    : isClickable
    ? "bg-surface border-2 border-border hover:border-info hover:bg-info/10 cursor-pointer active:scale-95"
    : "bg-surface/50 border-2 border-border/50";

  return (
    <button
      className={`${baseClasses} ${stateClasses}`}
      onClick={isClickable ? onClick : undefined}
      disabled={!isClickable}
    >
      {mark && <Mark type={mark} isWinning={isWinning} />}
    </button>
  );
}

function Mark({ type, isWinning }: { type: "X" | "O"; isWinning: boolean }) {
  if (type === "X") {
    return (
      <div className="relative w-1/2 h-1/2">
        {/* X mark using CSS */}
        <div
          className={`absolute inset-0 flex items-center justify-center ${
            isWinning ? "animate-pulse" : ""
          }`}
        >
          <span
            className={`text-4xl md:text-6xl font-bold ${
              isWinning ? "text-success" : "text-error"
            }`}
          >
            ✕
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-1/2 h-1/2">
      {/* O mark using CSS */}
      <div
        className={`absolute inset-0 flex items-center justify-center ${
          isWinning ? "animate-pulse" : ""
        }`}
      >
        <div
          className={`w-full h-full rounded-full border-4 md:border-8 ${
            isWinning ? "border-success" : "border-info"
          }`}
        />
      </div>
    </div>
  );
}
