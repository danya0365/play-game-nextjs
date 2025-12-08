"use client";

import type { GomokuMark } from "@/src/domain/types/gomokuState";
import { BOARD_SIZE } from "@/src/domain/types/gomokuState";

interface Gomoku2DProps {
  board: GomokuMark[];
  winningCells: number[] | null;
  lastMove: number | null;
  isMyTurn: boolean;
  myColor: "black" | "white";
  onCellClick: (index: number) => void;
}

/**
 * 2D HTML/CSS rendering of Gomoku board
 */
export function Gomoku2D({
  board,
  winningCells,
  lastMove,
  isMyTurn,
  myColor,
  onCellClick,
}: Gomoku2DProps) {
  const isWinningCell = (index: number) =>
    winningCells?.includes(index) ?? false;

  return (
    <div className="h-full flex items-center justify-center p-2">
      <div
        className="grid bg-amber-100 dark:bg-amber-900/50 p-2 rounded-lg shadow-lg"
        style={{
          gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
          gap: "1px",
          maxWidth: "min(90vw, 500px)",
          aspectRatio: "1",
        }}
      >
        {board.map((cell, index) => (
          <Cell
            key={index}
            value={cell}
            isWinning={isWinningCell(index)}
            isLastMove={lastMove === index}
            isClickable={isMyTurn && cell === null}
            myColor={myColor}
            onClick={() => onCellClick(index)}
          />
        ))}
      </div>
    </div>
  );
}

interface CellProps {
  value: GomokuMark;
  isWinning: boolean;
  isLastMove: boolean;
  isClickable: boolean;
  myColor: "black" | "white";
  onClick: () => void;
}

function Cell({
  value,
  isWinning,
  isLastMove,
  isClickable,
  myColor,
  onClick,
}: CellProps) {
  return (
    <button
      onClick={onClick}
      disabled={!isClickable}
      className={`
        aspect-square flex items-center justify-center
        bg-amber-200 dark:bg-amber-800/70
        transition-all duration-150
        relative
        ${
          isClickable
            ? "hover:bg-amber-300 dark:hover:bg-amber-700 cursor-pointer"
            : "cursor-default"
        }
      `}
      style={{ minWidth: "16px", minHeight: "16px" }}
    >
      {/* Grid lines */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full h-px bg-amber-900/30 dark:bg-amber-100/30 absolute" />
        <div className="h-full w-px bg-amber-900/30 dark:bg-amber-100/30 absolute" />
      </div>

      {/* Stone */}
      {value && (
        <div
          className={`
            w-[85%] h-[85%] rounded-full z-10
            transition-all duration-200
            ${
              value === "black"
                ? "bg-gray-900 shadow-md"
                : "bg-white border border-gray-300 shadow-md"
            }
            ${
              isWinning ? "ring-2 ring-success ring-offset-1 animate-pulse" : ""
            }
            ${isLastMove ? "ring-2 ring-info" : ""}
          `}
        />
      )}

      {/* Hover preview */}
      {isClickable && !value && (
        <div
          className={`
            w-[85%] h-[85%] rounded-full z-10 opacity-0 hover:opacity-30
            transition-opacity
            ${
              myColor === "black"
                ? "bg-gray-900"
                : "bg-white border border-gray-300"
            }
          `}
        />
      )}
    </button>
  );
}
