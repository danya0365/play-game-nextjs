"use client";

import type {
  RPSChoice,
  RPSRound,
} from "@/src/domain/types/rockPaperScissorsState";
import { CHOICE_ICONS } from "@/src/domain/types/rockPaperScissorsState";
import { Text } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useRef, useState } from "react";
import * as THREE from "three";

interface RockPaperScissors3DProps {
  phase: "choosing" | "revealing" | "finished";
  hasChosen: boolean;
  myCurrentChoice: RPSChoice;
  opponentChoice: RPSChoice;
  currentRound: number;
  maxRounds: number;
  player1Score: number;
  player2Score: number;
  rounds: RPSRound[];
  onChoice: (choice: RPSChoice) => void;
}

const CHOICES: RPSChoice[] = ["rock", "paper", "scissors"];

/**
 * 3D rendering of Rock Paper Scissors - Simple card-based design
 */
export function RockPaperScissors3D({
  phase,
  hasChosen,
  myCurrentChoice,
  opponentChoice,
  currentRound,
  maxRounds,
  player1Score,
  player2Score,
  rounds,
  onChoice,
}: RockPaperScissors3DProps) {
  const { viewport } = useThree();
  const isMobile = viewport.width < 8;
  const scale = isMobile ? 0.6 : 1;

  return (
    <group scale={scale} position={[0, 0, 0]}>
      {/* Score board at top */}
      <group position={[0, 2.5, 0]}>
        {/* Background */}
        <mesh>
          <boxGeometry args={[4, 1.2, 0.1]} />
          <meshStandardMaterial color="#1a1a2e" />
        </mesh>

        {/* My score */}
        <Text
          position={[-1.2, 0.2, 0.1]}
          fontSize={0.5}
          color="#3b82f6"
          anchorX="center"
        >
          {player1Score}
        </Text>
        <Text
          position={[-1.2, -0.3, 0.1]}
          fontSize={0.2}
          color="#94a3b8"
          anchorX="center"
        >
          คุณ
        </Text>

        {/* Separator */}
        <Text
          position={[0, 0, 0.1]}
          fontSize={0.4}
          color="#ffffff"
          anchorX="center"
        >
          -
        </Text>

        {/* Opponent score */}
        <Text
          position={[1.2, 0.2, 0.1]}
          fontSize={0.5}
          color="#ef4444"
          anchorX="center"
        >
          {player2Score}
        </Text>
        <Text
          position={[1.2, -0.3, 0.1]}
          fontSize={0.2}
          color="#94a3b8"
          anchorX="center"
        >
          คู่แข่ง
        </Text>
      </group>

      {/* Round indicator */}
      <group position={[0, 1.6, 0]}>
        <Text fontSize={0.25} color="#fbbf24" anchorX="center">
          รอบ {currentRound}/{maxRounds}
        </Text>
      </group>

      {/* Round history */}
      {rounds.length > 0 && (
        <group position={[0, -2.2, 0]}>
          <Text
            position={[0, 0.4, 0]}
            fontSize={0.2}
            color="#94a3b8"
            anchorX="center"
          >
            ประวัติ
          </Text>
          {rounds.map((round, i) => (
            <group
              key={i}
              position={[(i - (rounds.length - 1) / 2) * 1.2, 0, 0]}
            >
              <Text fontSize={0.3} anchorX="center">
                {CHOICE_ICONS[round.player1Choice!]}
              </Text>
              <Text
                position={[0.4, 0, 0]}
                fontSize={0.2}
                color="#94a3b8"
                anchorX="center"
              >
                vs
              </Text>
              <Text position={[0.8, 0, 0]} fontSize={0.3} anchorX="center">
                {CHOICE_ICONS[round.player2Choice!]}
              </Text>
              <Text
                position={[0.4, -0.35, 0]}
                fontSize={0.15}
                color={
                  round.result === "player1"
                    ? "#22c55e"
                    : round.result === "player2"
                    ? "#ef4444"
                    : "#94a3b8"
                }
                anchorX="center"
              >
                {round.result === "player1"
                  ? "ชนะ"
                  : round.result === "player2"
                  ? "แพ้"
                  : "เสมอ"}
              </Text>
            </group>
          ))}
        </group>
      )}

      {/* Table surface */}
      <mesh
        position={[0, -0.5, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <circleGeometry args={[5, 32]} />
        <meshStandardMaterial color="#1e3a5f" />
      </mesh>

      {/* Player cards - left and right */}
      <PlayerCard
        position={[-2.5, 0, 0]}
        label="คุณ"
        choice={
          phase === "revealing" || phase === "finished" ? myCurrentChoice : null
        }
        isRevealed={phase === "revealing" || phase === "finished"}
        hasChosen={hasChosen}
        color="#3b82f6"
      />

      {/* VS indicator */}
      <group position={[0, 0.5, 0.5]}>
        <Text fontSize={0.8} color="#ef4444" anchorX="center" anchorY="middle">
          VS
        </Text>
      </group>

      <PlayerCard
        position={[2.5, 0, 0]}
        label="คู่แข่ง"
        choice={
          phase === "revealing" || phase === "finished" ? opponentChoice : null
        }
        isRevealed={phase === "revealing" || phase === "finished"}
        hasChosen={opponentChoice !== null}
        color="#ef4444"
      />

      {/* Choice buttons - only when choosing */}
      {phase === "choosing" && !hasChosen && (
        <group position={[0, -0.3, 2.5]}>
          {CHOICES.map((choice, index) => (
            <ChoiceButton
              key={choice}
              choice={choice!}
              position={[(index - 1) * 2.2, 0, 0]}
              onClick={() => onChoice(choice)}
            />
          ))}
        </group>
      )}

      {/* Waiting text */}
      {phase === "choosing" && hasChosen && (
        <group position={[0, 0, 2.5]}>
          <Text fontSize={0.4} color="#22c55e" anchorX="center">
            รอคู่แข่ง...
          </Text>
        </group>
      )}
    </group>
  );
}

interface PlayerCardProps {
  position: [number, number, number];
  label: string;
  choice: RPSChoice;
  isRevealed: boolean;
  hasChosen: boolean;
  color: string;
}

function PlayerCard({
  position,
  label,
  choice,
  isRevealed,
  hasChosen,
  color,
}: PlayerCardProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Shake animation before reveal
  useFrame((state) => {
    if (groupRef.current) {
      if (!isRevealed && hasChosen) {
        groupRef.current.position.y =
          position[1] + Math.sin(state.clock.elapsedTime * 8) * 0.15;
      } else {
        groupRef.current.position.y = position[1];
      }
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Card background */}
      <mesh castShadow>
        <boxGeometry args={[1.8, 2.4, 0.1]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Card face - white */}
      <mesh position={[0, 0, 0.06]}>
        <boxGeometry args={[1.6, 2.2, 0.02]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Player label */}
      <Text
        position={[0, -0.9, 0.1]}
        fontSize={0.25}
        color={color}
        anchorX="center"
      >
        {label}
      </Text>

      {/* Choice display */}
      {isRevealed && choice ? (
        <Text
          position={[0, 0.2, 0.1]}
          fontSize={1}
          anchorX="center"
          anchorY="middle"
        >
          {CHOICE_ICONS[choice]}
        </Text>
      ) : (
        <Text
          position={[0, 0.2, 0.1]}
          fontSize={1}
          color={hasChosen ? "#22c55e" : "#94a3b8"}
          anchorX="center"
          anchorY="middle"
        >
          {hasChosen ? "✓" : "?"}
        </Text>
      )}
    </group>
  );
}

interface ChoiceButtonProps {
  choice: RPSChoice;
  position: [number, number, number];
  onClick: () => void;
}

function ChoiceButton({ choice, position, onClick }: ChoiceButtonProps) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      const targetScale = hovered ? 1.15 : 1;
      meshRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.1
      );
    }
  });

  const colors: Record<string, string> = {
    rock: "#6b7280",
    paper: "#fbbf24",
    scissors: "#a855f7",
  };

  return (
    <group position={position}>
      {/* Button base */}
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        castShadow
      >
        <cylinderGeometry args={[0.8, 0.8, 0.2, 32]} />
        <meshStandardMaterial
          color={hovered ? "#22c55e" : colors[choice!]}
          emissive={hovered ? "#22c55e" : colors[choice!]}
          emissiveIntensity={hovered ? 0.4 : 0.1}
        />
      </mesh>

      {/* Emoji on top */}
      <Text
        position={[0, 0.2, 0]}
        fontSize={0.6}
        rotation={[-Math.PI / 2, 0, 0]}
        anchorX="center"
        anchorY="middle"
      >
        {CHOICE_ICONS[choice!]}
      </Text>
    </group>
  );
}
