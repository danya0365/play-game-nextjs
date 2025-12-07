"use client";

import type { ConnectFourMark } from "@/src/domain/types/connectFourState";
import { COLS, ROWS } from "@/src/domain/types/connectFourState";

interface ConnectFour2DProps {
  board: ConnectFourMark[];
  winningCells: number[] | null;
  lastMove: number | null;
  isMyTurn: boolean;
  onColumnClick: (column: number) => void;
}

/**
 * 2D HTML/CSS rendering of Connect Four board
 * Used as fallback for low-performance devices
 */
export function ConnectFour2D({
  board,
  winningCells,
  lastMove,
  isMyTurn,
  onColumnClick,
}: ConnectFour2DProps) {
  const isWinningCell = (index: number) =>
    winningCells?.includes(index) ?? false;

  const isLastMove = (index: number) => lastMove === index;

  // Check if column is full
  const isColumnFull = (col: number) => board[col] !== null;

  return (
    <div className="h-full flex items-center justify-center p-4">
      <div className="flex flex-col gap-1">
        {/* Column hover indicators */}
        <div className="flex gap-1 mb-2">
          {Array.from({ length: COLS }).map((_, col) => (
            <button
              key={col}
              onClick={() => onColumnClick(col)}
              disabled={!isMyTurn || isColumnFull(col)}
              className={`
                w-10 h-6 md:w-12 md:h-8 rounded-t-lg
                flex items-center justify-center
                transition-all duration-200
                ${
                  isMyTurn && !isColumnFull(col)
                    ? "bg-info/20 hover:bg-info/40 cursor-pointer"
                    : "bg-transparent cursor-default"
                }
              `}
            >
              {isMyTurn && !isColumnFull(col) && (
                <span className="text-info text-lg">▼</span>
              )}
            </button>
          ))}
        </div>

        {/* Board */}
        <div
          className="grid gap-1 p-2 rounded-xl bg-info"
          style={{
            gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          }}
        >
          {Array.from({ length: ROWS }).map((_, row) =>
            Array.from({ length: COLS }).map((_, col) => {
              const index = row * COLS + col;
              const cell = board[index];

              return (
                <button
                  key={index}
                  onClick={() => onColumnClick(col)}
                  disabled={!isMyTurn || isColumnFull(col)}
                  className={`
                    w-10 h-10 md:w-12 md:h-12 rounded-full
                    flex items-center justify-center
                    transition-all duration-300
                    ${
                      isWinningCell(index)
                        ? "ring-4 ring-success ring-offset-2 ring-offset-info"
                        : ""
                    }
                    ${
                      isLastMove(index)
                        ? "ring-2 ring-warning ring-offset-1 ring-offset-info"
                        : ""
                    }
                    ${
                      cell === null
                        ? "bg-surface/90 hover:bg-surface cursor-pointer"
                        : ""
                    }
                    ${cell === "red" ? "bg-error" : ""}
                    ${cell === "yellow" ? "bg-warning" : ""}
                  `}
                >
                  {cell && (
                    <div
                      className={`
                        w-8 h-8 md:w-10 md:h-10 rounded-full
                        ${cell === "red" ? "bg-error shadow-inner" : ""}
                        ${cell === "yellow" ? "bg-warning shadow-inner" : ""}
                        ${
                          isWinningCell(index)
                            ? "animate-pulse"
                            : "animate-[drop_0.3s_ease-out]"
                        }
                      `}
                      style={{
                        boxShadow:
                          cell === "red"
                            ? "inset 0 -4px 8px rgba(0,0,0,0.3)"
                            : "inset 0 -4px 8px rgba(0,0,0,0.2)",
                      }}
                    />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
