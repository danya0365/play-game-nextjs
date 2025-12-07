"use client";

import type { ConnectFourMark } from "@/src/domain/types/connectFourState";
import { COLS, ROWS } from "@/src/domain/types/connectFourState";
import { ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";

interface ConnectFour3DProps {
  board: ConnectFourMark[];
  winningCells: number[] | null;
  lastMove: number | null;
  isMyTurn: boolean;
  onColumnClick: (column: number) => void;
}

// Board dimensions
const CELL_SIZE = 1.0;
const BOARD_DEPTH = 0.6;
const HOLE_RADIUS = 0.4;
const PIECE_RADIUS = 0.38;
const PIECE_THICKNESS = 0.25;

/**
 * 3D Three.js rendering of Connect Four board
 * Uses React Three Fiber for WebGL rendering
 */
export function ConnectFour3D({
  board,
  winningCells,
  lastMove,
  isMyTurn,
  onColumnClick,
}: ConnectFour3DProps) {
  // Detect mobile by viewport size
  const { viewport } = useThree();
  const isMobile = viewport.width < 10;

  const isWinningCell = (index: number) =>
    winningCells?.includes(index) ?? false;

  const isLastMoveCell = (index: number) => lastMove === index;

  // Check if column is full
  const isColumnFull = (col: number) => board[col] !== null;

  // Calculate board dimensions
  const boardWidth = COLS * CELL_SIZE;
  const boardHeight = ROWS * CELL_SIZE;

  // Scale for mobile - much smaller
  const scale = isMobile ? 0.55 : 1;

  return (
    <group
      rotation={[isMobile ? 0.15 : 0.3, 0, 0]}
      position={[0, isMobile ? -1 : -0.5, 0]}
      scale={scale}
    >
      {/* Board */}
      <BoardFrame />

      {/* Column hover indicators */}
      {Array.from({ length: COLS }).map((_, col) => (
        <ColumnIndicator
          key={`indicator-${col}`}
          col={col}
          isClickable={isMyTurn && !isColumnFull(col)}
          onClick={() => onColumnClick(col)}
        />
      ))}

      {/* Pieces */}
      {board.map((cell, index) => {
        if (!cell) return null;

        const row = Math.floor(index / COLS);
        const col = index % COLS;

        return (
          <Piece3D
            key={index}
            row={row}
            col={col}
            color={cell}
            isWinning={isWinningCell(index)}
            isLastMove={isLastMoveCell(index)}
          />
        );
      })}

      {/* Base/Stand */}
      <mesh position={[0, -boardHeight / 2 - 0.3, 0]} receiveShadow>
        <boxGeometry args={[boardWidth + 0.6, 0.3, BOARD_DEPTH + 0.4]} />
        <meshStandardMaterial color="#1e40af" metalness={0.2} roughness={0.6} />
      </mesh>
    </group>
  );
}

/**
 * Main board frame with holes
 */
function BoardFrame() {
  const boardWidth = COLS * CELL_SIZE;
  const boardHeight = ROWS * CELL_SIZE;

  // Create board geometry with holes using CSG-like approach
  const boardGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const padding = 0.2;

    // Outer rectangle
    shape.moveTo(-boardWidth / 2 - padding, -boardHeight / 2 - padding);
    shape.lineTo(boardWidth / 2 + padding, -boardHeight / 2 - padding);
    shape.lineTo(boardWidth / 2 + padding, boardHeight / 2 + padding);
    shape.lineTo(-boardWidth / 2 - padding, boardHeight / 2 + padding);
    shape.lineTo(-boardWidth / 2 - padding, -boardHeight / 2 - padding);

    // Create holes
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const x = (col - (COLS - 1) / 2) * CELL_SIZE;
        const y = ((ROWS - 1) / 2 - row) * CELL_SIZE;

        const holePath = new THREE.Path();
        holePath.absarc(x, y, HOLE_RADIUS, 0, Math.PI * 2, false);
        shape.holes.push(holePath);
      }
    }

    const extrudeSettings = {
      depth: BOARD_DEPTH,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.05,
      bevelSegments: 3,
    };

    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, [boardWidth, boardHeight]);

  return (
    <group>
      {/* Main board with holes */}
      <mesh
        geometry={boardGeometry}
        position={[0, 0, -BOARD_DEPTH / 2]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color="#2563eb"
          metalness={0.1}
          roughness={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Inner hole rings for depth effect */}
      {Array.from({ length: ROWS }).map((_, row) =>
        Array.from({ length: COLS }).map((_, col) => {
          const x = (col - (COLS - 1) / 2) * CELL_SIZE;
          const y = ((ROWS - 1) / 2 - row) * CELL_SIZE;

          return (
            <mesh
              key={`ring-${row}-${col}`}
              position={[x, y, BOARD_DEPTH / 2 + 0.01]}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <torusGeometry args={[HOLE_RADIUS - 0.02, 0.03, 8, 32]} />
              <meshStandardMaterial
                color="#1d4ed8"
                metalness={0.3}
                roughness={0.5}
              />
            </mesh>
          );
        })
      )}

      {/* Back panel */}
      <mesh position={[0, 0, -BOARD_DEPTH - 0.05]} receiveShadow>
        <boxGeometry args={[boardWidth + 0.4, boardHeight + 0.4, 0.1]} />
        <meshStandardMaterial color="#1e3a8a" metalness={0.1} roughness={0.6} />
      </mesh>
    </group>
  );
}

interface ColumnIndicatorProps {
  col: number;
  isClickable: boolean;
  onClick: () => void;
}

/**
 * Hover indicator and click area for each column
 */
function ColumnIndicator({ col, isClickable, onClick }: ColumnIndicatorProps) {
  const [hovered, setHovered] = useState(false);
  const arrowRef = useRef<THREE.Group>(null);
  const boardHeight = ROWS * CELL_SIZE;

  const x = (col - (COLS - 1) / 2) * CELL_SIZE;
  const y = boardHeight / 2 + 0.4; // Closer to board

  // Animate arrow bounce
  useFrame((state) => {
    if (arrowRef.current && isClickable) {
      const bounce = Math.sin(state.clock.elapsedTime * 3 + col * 0.5) * 0.08;
      arrowRef.current.position.y = hovered ? bounce + 0.1 : bounce;
      arrowRef.current.scale.setScalar(hovered ? 1.3 : 1);
    }
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (isClickable) onClick();
  };

  return (
    <group position={[x, y, 0]}>
      {/* Click area - covers entire column */}
      <mesh
        position={[0, -boardHeight / 2, 0]}
        onClick={handleClick}
        onPointerOver={() => isClickable && setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry
          args={[CELL_SIZE * 0.95, boardHeight + 1.5, BOARD_DEPTH + 0.5]}
        />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Always visible arrow indicator when clickable */}
      {isClickable && (
        <group ref={arrowRef}>
          {/* Arrow pointing down */}
          <mesh rotation={[0, 0, Math.PI]}>
            <coneGeometry args={[0.12, 0.24, 6]} />
            <meshStandardMaterial
              color={hovered ? "#22c55e" : "#60a5fa"}
              emissive={hovered ? "#22c55e" : "#3b82f6"}
              emissiveIntensity={hovered ? 0.6 : 0.3}
            />
          </mesh>

          {/* Small dot above arrow */}
          <mesh position={[0, 0.2, 0]}>
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshStandardMaterial
              color={hovered ? "#22c55e" : "#60a5fa"}
              emissive={hovered ? "#22c55e" : "#3b82f6"}
              emissiveIntensity={hovered ? 0.6 : 0.3}
            />
          </mesh>
        </group>
      )}

      {/* Column highlight on hover */}
      {isClickable && hovered && (
        <mesh position={[0, -boardHeight / 2 - 0.3, BOARD_DEPTH / 2 + 0.1]}>
          <planeGeometry args={[CELL_SIZE * 0.9, boardHeight + 0.4]} />
          <meshBasicMaterial
            color="#22c55e"
            transparent
            opacity={0.15}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}

interface Piece3DProps {
  row: number;
  col: number;
  color: ConnectFourMark;
  isWinning: boolean;
  isLastMove: boolean;
}

/**
 * Individual game piece (disc)
 */
function Piece3D({ row, col, color, isWinning, isLastMove }: Piece3DProps) {
  const meshRef = useRef<THREE.Group>(null);

  const x = (col - (COLS - 1) / 2) * CELL_SIZE;
  const y = ((ROWS - 1) / 2 - row) * CELL_SIZE;

  // Colors
  const baseColor = color === "red" ? "#dc2626" : "#eab308";
  const lightColor = color === "red" ? "#ef4444" : "#facc15";
  const darkColor = color === "red" ? "#991b1b" : "#a16207";

  // Animation for winning pieces
  useFrame((state) => {
    if (meshRef.current && isWinning) {
      meshRef.current.scale.setScalar(
        1 + Math.sin(state.clock.elapsedTime * 4) * 0.05
      );
    }
  });

  return (
    <group
      ref={meshRef}
      position={[x, y, BOARD_DEPTH / 2 - PIECE_THICKNESS / 2 + 0.02]}
    >
      {/* Main disc */}
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry
          args={[PIECE_RADIUS, PIECE_RADIUS, PIECE_THICKNESS, 32]}
        />
        <meshStandardMaterial
          color={baseColor}
          metalness={0.3}
          roughness={0.4}
          emissive={isWinning ? "#22c55e" : isLastMove ? "#f59e0b" : "#000000"}
          emissiveIntensity={isWinning ? 0.4 : isLastMove ? 0.2 : 0}
        />
      </mesh>

      {/* Top face highlight */}
      <mesh position={[0, 0, PIECE_THICKNESS / 2 + 0.001]} rotation={[0, 0, 0]}>
        <circleGeometry args={[PIECE_RADIUS * 0.85, 32]} />
        <meshStandardMaterial
          color={lightColor}
          metalness={0.4}
          roughness={0.3}
        />
      </mesh>

      {/* Inner circle detail */}
      <mesh position={[0, 0, PIECE_THICKNESS / 2 + 0.002]}>
        <ringGeometry args={[PIECE_RADIUS * 0.3, PIECE_RADIUS * 0.5, 32]} />
        <meshStandardMaterial
          color={darkColor}
          metalness={0.2}
          roughness={0.5}
        />
      </mesh>

      {/* Winning glow ring */}
      {isWinning && (
        <mesh position={[0, 0, PIECE_THICKNESS / 2 + 0.003]}>
          <ringGeometry args={[PIECE_RADIUS * 0.9, PIECE_RADIUS * 1.1, 32]} />
          <meshBasicMaterial color="#22c55e" transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
}
