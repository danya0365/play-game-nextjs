"use client";

import type {
  DiceRollRound,
  DiceValue,
} from "@/src/domain/types/diceRollState";
import { RoundedBox, Text } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";

interface DiceRoll3DProps {
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
 * 3D rendering of Dice Roll - Beautiful dice with pips
 */
export function DiceRoll3D({
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
}: DiceRoll3DProps) {
  const { viewport } = useThree();
  const isMobile = viewport.width < 8;
  const scale = isMobile ? 0.65 : 0.9;

  return (
    <group scale={scale}>
      {/* Score board - Improved */}
      <group position={[0, 3, 0]}>
        <RoundedBox args={[5, 1.4, 0.2]} radius={0.1}>
          <meshStandardMaterial color="#0f172a" />
        </RoundedBox>
        {/* My score */}
        <group position={[-1.5, 0, 0.15]}>
          <Text
            fontSize={0.6}
            color="#3b82f6"
            anchorX="center"
            anchorY="middle"
          >
            {player1Score}
          </Text>
          <Text
            position={[0, -0.45, 0]}
            fontSize={0.18}
            color="#64748b"
            anchorX="center"
          >
            คุณ
          </Text>
        </group>
        {/* Separator */}
        <Text
          position={[0, 0, 0.15]}
          fontSize={0.5}
          color="#475569"
          anchorX="center"
        >
          :
        </Text>
        {/* Opponent score */}
        <group position={[1.5, 0, 0.15]}>
          <Text
            fontSize={0.6}
            color="#ef4444"
            anchorX="center"
            anchorY="middle"
          >
            {player2Score}
          </Text>
          <Text
            position={[0, -0.45, 0]}
            fontSize={0.18}
            color="#64748b"
            anchorX="center"
          >
            คู่แข่ง
          </Text>
        </group>
      </group>

      {/* Round indicator */}
      <Text
        position={[0, 1.8, 0]}
        fontSize={0.28}
        color="#fbbf24"
        anchorX="center"
      >
        รอบ {currentRound} / {maxRounds}
      </Text>

      {/* Dice Display Area */}
      <group position={[0, 0, 0]}>
        {/* My Dice */}
        <group position={[-2, 0, 0]}>
          <RealisticDice
            value={myCurrentRoll}
            isRolling={!hasRolled && phase === "rolling"}
            primaryColor="#3b82f6"
            pipColor="#ffffff"
          />
          <Text
            position={[0, -1.5, 0]}
            fontSize={0.22}
            color="#94a3b8"
            anchorX="center"
          >
            คุณ
          </Text>
          {hasRolled && myCurrentRoll && (
            <Text
              position={[0, -1.9, 0]}
              fontSize={0.35}
              color="#3b82f6"
              anchorX="center"
              font="bold"
            >
              {myCurrentRoll}
            </Text>
          )}
        </group>

        {/* VS Badge */}
        <group position={[0, 0, 0]}>
          <RoundedBox args={[0.8, 0.5, 0.1]} radius={0.08}>
            <meshStandardMaterial color="#6366f1" />
          </RoundedBox>
          <Text
            position={[0, 0, 0.1]}
            fontSize={0.25}
            color="#fff"
            anchorX="center"
          >
            VS
          </Text>
        </group>

        {/* Opponent Dice */}
        <group position={[2, 0, 0]}>
          <RealisticDice
            value={
              phase === "revealing" || phase === "finished"
                ? opponentRoll
                : null
            }
            isRolling={!opponentHasRolled && phase === "rolling"}
            primaryColor="#ef4444"
            pipColor="#ffffff"
            showWaiting={opponentHasRolled && phase === "rolling"}
          />
          <Text
            position={[0, -1.5, 0]}
            fontSize={0.22}
            color="#94a3b8"
            anchorX="center"
          >
            คู่แข่ง
          </Text>
          {(phase === "revealing" || phase === "finished") && opponentRoll && (
            <Text
              position={[0, -1.9, 0]}
              fontSize={0.35}
              color="#ef4444"
              anchorX="center"
              font="bold"
            >
              {opponentRoll}
            </Text>
          )}
        </group>
      </group>

      {/* Roll Button */}
      {phase === "rolling" && !hasRolled && (
        <RollButton position={[0, -2.5, 0]} onClick={onRoll} />
      )}

      {/* Status text */}
      {phase === "rolling" && hasRolled && (
        <Text
          position={[0, -2.5, 0]}
          fontSize={0.28}
          color="#22c55e"
          anchorX="center"
        >
          {opponentHasRolled ? "✨ กำลังเปิดผล..." : "⏳ รอคู่แข่งทอย..."}
        </Text>
      )}

      {/* Result text */}
      {(phase === "revealing" || phase === "finished") &&
        myCurrentRoll &&
        opponentRoll && (
          <group position={[0, -2.5, 0]}>
            <Text
              fontSize={0.35}
              color={
                myCurrentRoll > opponentRoll
                  ? "#22c55e"
                  : myCurrentRoll < opponentRoll
                  ? "#ef4444"
                  : "#fbbf24"
              }
              anchorX="center"
            >
              {myCurrentRoll > opponentRoll
                ? "🎉 คุณชนะรอบนี้!"
                : myCurrentRoll < opponentRoll
                ? "😢 คุณแพ้รอบนี้"
                : "🤝 เสมอ!"}
            </Text>
          </group>
        )}

      {/* History - Compact cards */}
      {rounds.length > 0 && (
        <group position={[0, -3.8, 0]}>
          <Text
            position={[0, 0.5, 0]}
            fontSize={0.18}
            color="#64748b"
            anchorX="center"
          >
            ประวัติ
          </Text>
          {rounds.slice(-3).map((round, i) => (
            <HistoryCard
              key={i}
              round={round}
              index={i}
              total={Math.min(rounds.length, 3)}
            />
          ))}
        </group>
      )}
    </group>
  );
}

// Realistic 3D Dice with pips
interface RealisticDiceProps {
  value: DiceValue;
  isRolling: boolean;
  primaryColor: string;
  pipColor: string;
  showWaiting?: boolean;
}

function RealisticDice({
  value,
  isRolling,
  primaryColor,
  pipColor,
  showWaiting,
}: RealisticDiceProps) {
  const groupRef = useRef<THREE.Group>(null);
  const targetRotation = useRef({ x: 0, y: 0, z: 0 });

  // Dice rotations for each face
  const faceRotations = useMemo(
    () => ({
      1: { x: 0, y: 0, z: 0 },
      2: { x: 0, y: Math.PI / 2, z: 0 },
      3: { x: -Math.PI / 2, y: 0, z: 0 },
      4: { x: Math.PI / 2, y: 0, z: 0 },
      5: { x: 0, y: -Math.PI / 2, z: 0 },
      6: { x: Math.PI, y: 0, z: 0 },
    }),
    []
  );

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    if (isRolling) {
      // Spinning animation
      groupRef.current.rotation.x += delta * 8;
      groupRef.current.rotation.y += delta * 10;
      groupRef.current.rotation.z += delta * 6;
      // Bobbing
      groupRef.current.position.y =
        Math.sin(state.clock.elapsedTime * 8) * 0.15;
    } else if (value) {
      // Smoothly rotate to show face
      const rot = faceRotations[value];
      targetRotation.current = rot;
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        rot.x,
        delta * 5
      );
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        rot.y,
        delta * 5
      );
      groupRef.current.rotation.z = THREE.MathUtils.lerp(
        groupRef.current.rotation.z,
        rot.z,
        delta * 5
      );
      groupRef.current.position.y = THREE.MathUtils.lerp(
        groupRef.current.position.y,
        0,
        delta * 3
      );
    } else {
      // Idle gentle rotation
      groupRef.current.rotation.y += delta * 0.5;
      groupRef.current.position.y =
        Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
  });

  const size = 1.1;
  const pipSize = 0.12;
  const pipOffset = size / 2 + 0.01;
  const pipSpread = 0.28;

  // Pip positions for each face
  const pipPositions: Record<number, [number, number][]> = {
    1: [[0, 0]],
    2: [
      [-pipSpread, pipSpread],
      [pipSpread, -pipSpread],
    ],
    3: [
      [-pipSpread, pipSpread],
      [0, 0],
      [pipSpread, -pipSpread],
    ],
    4: [
      [-pipSpread, pipSpread],
      [pipSpread, pipSpread],
      [-pipSpread, -pipSpread],
      [pipSpread, -pipSpread],
    ],
    5: [
      [-pipSpread, pipSpread],
      [pipSpread, pipSpread],
      [0, 0],
      [-pipSpread, -pipSpread],
      [pipSpread, -pipSpread],
    ],
    6: [
      [-pipSpread, pipSpread],
      [pipSpread, pipSpread],
      [-pipSpread, 0],
      [pipSpread, 0],
      [-pipSpread, -pipSpread],
      [pipSpread, -pipSpread],
    ],
  };

  return (
    <group ref={groupRef}>
      {/* Main dice body */}
      <RoundedBox args={[size, size, size]} radius={0.08} smoothness={4}>
        <meshStandardMaterial
          color={primaryColor}
          metalness={0.1}
          roughness={0.4}
        />
      </RoundedBox>

      {/* Face 1 (front) */}
      {pipPositions[1].map((pos, i) => (
        <mesh key={`f1-${i}`} position={[pos[0], pos[1], pipOffset]}>
          <sphereGeometry args={[pipSize, 16, 16]} />
          <meshStandardMaterial color={pipColor} />
        </mesh>
      ))}

      {/* Face 6 (back) */}
      {pipPositions[6].map((pos, i) => (
        <mesh
          key={`f6-${i}`}
          position={[pos[0], pos[1], -pipOffset]}
          rotation={[0, Math.PI, 0]}
        >
          <sphereGeometry args={[pipSize, 16, 16]} />
          <meshStandardMaterial color={pipColor} />
        </mesh>
      ))}

      {/* Face 2 (right) */}
      {pipPositions[2].map((pos, i) => (
        <mesh key={`f2-${i}`} position={[pipOffset, pos[1], pos[0]]}>
          <sphereGeometry args={[pipSize, 16, 16]} />
          <meshStandardMaterial color={pipColor} />
        </mesh>
      ))}

      {/* Face 5 (left) */}
      {pipPositions[5].map((pos, i) => (
        <mesh key={`f5-${i}`} position={[-pipOffset, pos[1], -pos[0]]}>
          <sphereGeometry args={[pipSize, 16, 16]} />
          <meshStandardMaterial color={pipColor} />
        </mesh>
      ))}

      {/* Face 3 (top) */}
      {pipPositions[3].map((pos, i) => (
        <mesh key={`f3-${i}`} position={[pos[0], pipOffset, -pos[1]]}>
          <sphereGeometry args={[pipSize, 16, 16]} />
          <meshStandardMaterial color={pipColor} />
        </mesh>
      ))}

      {/* Face 4 (bottom) */}
      {pipPositions[4].map((pos, i) => (
        <mesh key={`f4-${i}`} position={[pos[0], -pipOffset, pos[1]]}>
          <sphereGeometry args={[pipSize, 16, 16]} />
          <meshStandardMaterial color={pipColor} />
        </mesh>
      ))}

      {/* Waiting indicator */}
      {showWaiting && (
        <Text
          position={[0, 0, size / 2 + 0.1]}
          fontSize={0.3}
          color="#22c55e"
          anchorX="center"
        >
          ✓
        </Text>
      )}
    </group>
  );
}

// History card component
interface HistoryCardProps {
  round: DiceRollRound;
  index: number;
  total: number;
}

function HistoryCard({ round, index, total }: HistoryCardProps) {
  const xPos = (index - (total - 1) / 2) * 1.8;

  return (
    <group position={[xPos, 0, 0]}>
      <RoundedBox args={[1.6, 0.8, 0.1]} radius={0.08}>
        <meshStandardMaterial
          color={
            round.winner === "player1"
              ? "#166534"
              : round.winner === "player2"
              ? "#7f1d1d"
              : "#374151"
          }
        />
      </RoundedBox>
      <Text
        position={[-0.4, 0.1, 0.1]}
        fontSize={0.25}
        color="#3b82f6"
        anchorX="center"
      >
        {round.player1Roll}
      </Text>
      <Text
        position={[0, 0.1, 0.1]}
        fontSize={0.15}
        color="#94a3b8"
        anchorX="center"
      >
        vs
      </Text>
      <Text
        position={[0.4, 0.1, 0.1]}
        fontSize={0.25}
        color="#ef4444"
        anchorX="center"
      >
        {round.player2Roll}
      </Text>
      <Text
        position={[0, -0.2, 0.1]}
        fontSize={0.13}
        color={
          round.winner === "player1"
            ? "#4ade80"
            : round.winner === "player2"
            ? "#f87171"
            : "#9ca3af"
        }
        anchorX="center"
      >
        {round.winner === "player1"
          ? "ชนะ"
          : round.winner === "player2"
          ? "แพ้"
          : "เสมอ"}
      </Text>
    </group>
  );
}

// Roll button
interface RollButtonProps {
  position: [number, number, number];
  onClick: () => void;
}

function RollButton({ position, onClick }: RollButtonProps) {
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      const targetScale = hovered ? 1.08 : 1;
      groupRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.15
      );
      // Gentle pulse
      groupRef.current.position.y =
        position[1] + Math.sin(state.clock.elapsedTime * 3) * 0.03;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <RoundedBox
        args={[3, 0.8, 0.2]}
        radius={0.15}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          color={hovered ? "#22c55e" : "#6366f1"}
          emissive={hovered ? "#22c55e" : "#6366f1"}
          emissiveIntensity={0.3}
        />
      </RoundedBox>
      <Text
        position={[0, 0, 0.15]}
        fontSize={0.3}
        color="#fff"
        anchorX="center"
      >
        🎲 ทอยเลย!
      </Text>
    </group>
  );
}
