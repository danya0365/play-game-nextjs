"use client";

import type { GomokuMark } from "@/src/domain/types/gomokuState";
import { BOARD_SIZE, toRowCol } from "@/src/domain/types/gomokuState";
import { Text } from "@react-three/drei";
import { ThreeEvent } from "@react-three/fiber";
import { useState } from "react";

interface Gomoku3DProps {
  board: GomokuMark[];
  winningCells: number[] | null;
  lastMove: number | null;
  isMyTurn: boolean;
  myColor: "black" | "white";
  onCellClick: (index: number) => void;
}

/**
 * 3D Three.js rendering of Gomoku board
 */
export function Gomoku3D({
  board,
  winningCells,
  lastMove,
  isMyTurn,
  onCellClick,
}: Gomoku3DProps) {
  const isWinningCell = (index: number) =>
    winningCells?.includes(index) ?? false;

  const cellSize = 0.5;
  const boardOffset = (BOARD_SIZE * cellSize) / 2 - cellSize / 2;

  return (
    <group>
      {/* Board base */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <boxGeometry
          args={[BOARD_SIZE * cellSize + 0.4, BOARD_SIZE * cellSize + 0.4, 0.2]}
        />
        <meshStandardMaterial color="#d4a373" />
      </mesh>

      {/* Grid lines */}
      <GridLines cellSize={cellSize} boardOffset={boardOffset} />

      {/* Cells */}
      {board.map((cell, index) => {
        const { row, col } = toRowCol(index);
        const x = col * cellSize - boardOffset;
        const z = row * cellSize - boardOffset;

        return (
          <Cell3D
            key={index}
            position={[x, 0, z]}
            value={cell}
            isWinning={isWinningCell(index)}
            isLastMove={lastMove === index}
            isClickable={isMyTurn && cell === null}
            onClick={() => onCellClick(index)}
          />
        );
      })}

      {/* Board label */}
      <Text
        position={[0, 0.1, boardOffset + 1]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.3}
        color="#654321"
        anchorX="center"
      >
        โกะโมะกุ
      </Text>
    </group>
  );
}

interface Cell3DProps {
  position: [number, number, number];
  value: GomokuMark;
  isWinning: boolean;
  isLastMove: boolean;
  isClickable: boolean;
  onClick: () => void;
}

function Cell3D({
  position,
  value,
  isWinning,
  isLastMove,
  isClickable,
  onClick,
}: Cell3DProps) {
  const [hovered, setHovered] = useState(false);

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (isClickable) onClick();
  };

  return (
    <group position={position}>
      {/* Clickable area */}
      <mesh
        onClick={handleClick}
        onPointerOver={() => isClickable && setHovered(true)}
        onPointerOut={() => setHovered(false)}
        position={[0, 0.01, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        visible={false}
      >
        <planeGeometry args={[0.45, 0.45]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Hover indicator */}
      {hovered && isClickable && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.15, 32]} />
          <meshBasicMaterial color="#60a5fa" transparent opacity={0.5} />
        </mesh>
      )}

      {/* Stone */}
      {value && (
        <mesh position={[0, 0.08, 0]}>
          <sphereGeometry args={[0.18, 32, 32]} />
          <meshStandardMaterial
            color={value === "black" ? "#1f2937" : "#f5f5f5"}
            emissive={
              isWinning
                ? value === "black"
                  ? "#22c55e"
                  : "#22c55e"
                : isLastMove
                ? "#3b82f6"
                : "#000000"
            }
            emissiveIntensity={isWinning ? 0.5 : isLastMove ? 0.3 : 0}
            roughness={0.3}
            metalness={0.1}
          />
        </mesh>
      )}
    </group>
  );
}

interface GridLinesProps {
  cellSize: number;
  boardOffset: number;
}

function GridLines({ cellSize, boardOffset }: GridLinesProps) {
  const lines = [];

  // Horizontal lines
  for (let i = 0; i < BOARD_SIZE; i++) {
    const z = i * cellSize - boardOffset;
    lines.push(
      <mesh
        key={`h${i}`}
        position={[0, 0.01, z]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[BOARD_SIZE * cellSize - cellSize + 0.02, 0.02]} />
        <meshBasicMaterial color="#654321" />
      </mesh>
    );
  }

  // Vertical lines
  for (let i = 0; i < BOARD_SIZE; i++) {
    const x = i * cellSize - boardOffset;
    lines.push(
      <mesh
        key={`v${i}`}
        position={[x, 0.01, 0]}
        rotation={[-Math.PI / 2, 0, Math.PI / 2]}
      >
        <planeGeometry args={[BOARD_SIZE * cellSize - cellSize + 0.02, 0.02]} />
        <meshBasicMaterial color="#654321" />
      </mesh>
    );
  }

  // Star points (traditional markers)
  const starPoints = [3, 7, 11];
  for (const r of starPoints) {
    for (const c of starPoints) {
      const x = c * cellSize - boardOffset;
      const z = r * cellSize - boardOffset;
      lines.push(
        <mesh key={`star${r}${c}`} position={[x, 0.015, z]}>
          <sphereGeometry args={[0.03, 16, 16]} />
          <meshBasicMaterial color="#654321" />
        </mesh>
      );
    }
  }

  return <group>{lines}</group>;
}
