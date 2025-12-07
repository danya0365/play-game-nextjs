"use client";

import type { TicTacToeMark } from "@/src/domain/types/gameState";
import { RoundedBox, Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import * as THREE from "three";

interface CellProps {
  position: [number, number, number];
  mark: TicTacToeMark;
  isWinning: boolean;
  isClickable: boolean;
  onClick: () => void;
}

/**
 * Single Cell in Tic Tac Toe Grid
 */
function Cell({ position, mark, isWinning, isClickable, onClick }: CellProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Hover animation
  useFrame(() => {
    if (meshRef.current) {
      const targetY = hovered && isClickable ? 0.1 : 0;
      meshRef.current.position.y = THREE.MathUtils.lerp(
        meshRef.current.position.y,
        targetY,
        0.1
      );
    }
  });

  const cellColor = isWinning
    ? "#22c55e"
    : hovered && isClickable
    ? "#3b82f6"
    : "#2a2a4a";

  return (
    <group position={position}>
      {/* Cell Base */}
      <RoundedBox
        ref={meshRef}
        args={[1.8, 0.2, 1.8]}
        radius={0.1}
        smoothness={4}
        onClick={isClickable ? onClick : undefined}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color={cellColor}
          metalness={0.3}
          roughness={0.7}
        />
      </RoundedBox>

      {/* Mark */}
      {mark && (
        <Mark type={mark} isWinning={isWinning} position={[0, 0.3, 0]} />
      )}
    </group>
  );
}

/**
 * X or O Mark
 */
function Mark({
  type,
  isWinning,
  position,
}: {
  type: "X" | "O";
  isWinning: boolean;
  position: [number, number, number];
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [scale, setScale] = useState(0);

  // Spawn animation
  useFrame(() => {
    if (scale < 1) {
      setScale((s) => Math.min(s + 0.1, 1));
    }
    if (groupRef.current && isWinning) {
      groupRef.current.rotation.y += 0.02;
    }
  });

  const color = type === "X" ? "#ef4444" : "#3b82f6";

  if (type === "X") {
    return (
      <group ref={groupRef} position={position} scale={scale}>
        {/* X shape using two crossed boxes - rotated to stand upright */}
        <mesh rotation={[Math.PI / 2, 0, Math.PI / 4]} castShadow>
          <boxGeometry args={[0.2, 1.2, 0.2]} />
          <meshStandardMaterial
            color={color}
            emissive={isWinning ? color : "#000000"}
            emissiveIntensity={isWinning ? 0.5 : 0}
            metalness={0.5}
            roughness={0.3}
          />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, -Math.PI / 4]} castShadow>
          <boxGeometry args={[0.2, 1.2, 0.2]} />
          <meshStandardMaterial
            color={color}
            emissive={isWinning ? color : "#000000"}
            emissiveIntensity={isWinning ? 0.5 : 0}
            metalness={0.5}
            roughness={0.3}
          />
        </mesh>
      </group>
    );
  }

  // O shape using torus
  return (
    <group ref={groupRef} position={position} scale={scale}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.5, 0.12, 16, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={isWinning ? color : "#000000"}
          emissiveIntensity={isWinning ? 0.5 : 0}
          metalness={0.5}
          roughness={0.3}
        />
      </mesh>
    </group>
  );
}

interface TicTacToe3DProps {
  board: TicTacToeMark[];
  winningLine: number[] | null;
  isMyTurn: boolean;
  onCellClick: (index: number) => void;
}

/**
 * 3D Tic Tac Toe Board
 */
export function TicTacToe3D({
  board,
  winningLine,
  isMyTurn,
  onCellClick,
}: TicTacToe3DProps) {
  // Cell positions (3x3 grid)
  const cellPositions: [number, number, number][] = [
    [-2, 0, -2],
    [0, 0, -2],
    [2, 0, -2], // Row 0
    [-2, 0, 0],
    [0, 0, 0],
    [2, 0, 0], // Row 1
    [-2, 0, 2],
    [0, 0, 2],
    [2, 0, 2], // Row 2
  ];

  return (
    <group>
      {/* Board Base */}
      <RoundedBox
        args={[6.5, 0.3, 6.5]}
        radius={0.15}
        smoothness={4}
        position={[0, -0.25, 0]}
        receiveShadow
      >
        <meshStandardMaterial color="#1a1a2e" metalness={0.2} roughness={0.8} />
      </RoundedBox>

      {/* Grid Lines */}
      <GridLines />

      {/* Cells */}
      {board.map((mark, index) => (
        <Cell
          key={index}
          position={cellPositions[index]}
          mark={mark}
          isWinning={winningLine?.includes(index) ?? false}
          isClickable={isMyTurn && mark === null && !winningLine}
          onClick={() => onCellClick(index)}
        />
      ))}
    </group>
  );
}

/**
 * Grid Lines
 */
function GridLines() {
  const lineColor = "#4a4a6a";

  return (
    <group position={[0, 0.11, 0]}>
      {/* Vertical Lines */}
      <mesh position={[-1, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.05, 6]} />
        <meshBasicMaterial color={lineColor} />
      </mesh>
      <mesh position={[1, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.05, 6]} />
        <meshBasicMaterial color={lineColor} />
      </mesh>

      {/* Horizontal Lines */}
      <mesh position={[0, 0, -1]} rotation={[Math.PI / 2, 0, Math.PI / 2]}>
        <planeGeometry args={[0.05, 6]} />
        <meshBasicMaterial color={lineColor} />
      </mesh>
      <mesh position={[0, 0, 1]} rotation={[Math.PI / 2, 0, Math.PI / 2]}>
        <planeGeometry args={[0.05, 6]} />
        <meshBasicMaterial color={lineColor} />
      </mesh>
    </group>
  );
}

/**
 * Turn Indicator
 */
export function TurnIndicator({
  isMyTurn,
  myMark,
}: {
  isMyTurn: boolean;
  myMark: "X" | "O";
}) {
  return (
    <Text
      position={[0, 4, 0]}
      fontSize={0.5}
      color={isMyTurn ? "#22c55e" : "#666666"}
      anchorX="center"
      anchorY="middle"
    >
      {isMyTurn ? `ตาคุณ (${myMark})` : "รอคู่แข่ง..."}
    </Text>
  );
}
