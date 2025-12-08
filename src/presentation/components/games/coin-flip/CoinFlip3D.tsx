"use client";

import type {
  CoinFlipRound,
  CoinGuess,
  CoinSide,
} from "@/src/domain/types/coinFlipState";
import { COIN_ICONS, COIN_NAMES } from "@/src/domain/types/coinFlipState";
import { Text } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useRef, useState } from "react";
import * as THREE from "three";

interface CoinFlip3DProps {
  phase: "guessing" | "flipping" | "revealing" | "finished";
  hasGuessed: boolean;
  myCurrentGuess: CoinGuess;
  currentRound: number;
  maxRounds: number;
  player1Score: number;
  player2Score: number;
  currentFlipResult: CoinSide | null;
  rounds: CoinFlipRound[];
  onGuess: (guess: CoinGuess) => void;
}

/**
 * 3D rendering of Coin Flip
 */
export function CoinFlip3D({
  phase,
  hasGuessed,
  myCurrentGuess,
  currentRound,
  maxRounds,
  player1Score,
  player2Score,
  currentFlipResult,
  rounds,
  onGuess,
}: CoinFlip3DProps) {
  const { viewport } = useThree();
  const isMobile = viewport.width < 8;
  const scale = isMobile ? 0.7 : 1;

  return (
    <group scale={scale}>
      {/* Score board */}
      <group position={[0, 2.5, 0]}>
        <mesh>
          <boxGeometry args={[4, 1.2, 0.1]} />
          <meshStandardMaterial color="#1a1a2e" />
        </mesh>
        <Text
          position={[-1, 0.2, 0.1]}
          fontSize={0.5}
          color="#3b82f6"
          anchorX="center"
        >
          {player1Score}
        </Text>
        <Text
          position={[-1, -0.25, 0.1]}
          fontSize={0.2}
          color="#94a3b8"
          anchorX="center"
        >
          คุณ
        </Text>
        <Text
          position={[0, 0, 0.1]}
          fontSize={0.4}
          color="#fff"
          anchorX="center"
        >
          -
        </Text>
        <Text
          position={[1, 0.2, 0.1]}
          fontSize={0.5}
          color="#ef4444"
          anchorX="center"
        >
          {player2Score}
        </Text>
        <Text
          position={[1, -0.25, 0.1]}
          fontSize={0.2}
          color="#94a3b8"
          anchorX="center"
        >
          คู่แข่ง
        </Text>
      </group>

      {/* Round indicator */}
      <Text
        position={[0, 1.5, 0]}
        fontSize={0.25}
        color="#fbbf24"
        anchorX="center"
      >
        รอบ {currentRound}/{maxRounds}
      </Text>

      {/* Coin */}
      <Coin3D
        phase={phase}
        result={currentFlipResult}
        myGuess={myCurrentGuess}
      />

      {/* Guess buttons */}
      {phase === "guessing" && !hasGuessed && (
        <group position={[0, -1.8, 0]}>
          <GuessButton
            position={[-1.5, 0, 0]}
            type="heads"
            onClick={() => onGuess("heads")}
          />
          <GuessButton
            position={[1.5, 0, 0]}
            type="tails"
            onClick={() => onGuess("tails")}
          />
        </group>
      )}

      {/* Status text */}
      {phase === "guessing" && hasGuessed && (
        <Text
          position={[0, -1.8, 0]}
          fontSize={0.3}
          color="#22c55e"
          anchorX="center"
        >
          เลือก {COIN_NAMES[myCurrentGuess!]} แล้ว - รอคู่แข่ง...
        </Text>
      )}

      {/* Result text */}
      {(phase === "revealing" || phase === "finished") && currentFlipResult && (
        <group position={[0, -1.5, 0]}>
          <Text
            position={[0, 0, 0]}
            fontSize={0.35}
            color="#fff"
            anchorX="center"
          >
            {COIN_NAMES[currentFlipResult]}!
          </Text>
          <Text
            position={[0, -0.5, 0]}
            fontSize={0.25}
            color={myCurrentGuess === currentFlipResult ? "#22c55e" : "#ef4444"}
            anchorX="center"
          >
            {myCurrentGuess === currentFlipResult
              ? "คุณทายถูก! ✓"
              : "คุณทายผิด ✗"}
          </Text>
        </group>
      )}

      {/* History */}
      {rounds.length > 0 && (
        <group position={[0, -2.8, 0]}>
          <Text
            position={[0, 0.3, 0]}
            fontSize={0.18}
            color="#94a3b8"
            anchorX="center"
          >
            ประวัติ
          </Text>
          {rounds.slice(-3).map((round, i) => (
            <group key={i} position={[(i - 1) * 1.2, 0, 0]}>
              <Text fontSize={0.25} anchorX="center">
                {COIN_ICONS[round.result]}
              </Text>
              <Text
                position={[0, -0.3, 0]}
                fontSize={0.15}
                color={round.player1Correct ? "#22c55e" : "#ef4444"}
                anchorX="center"
              >
                {round.player1Correct ? "✓" : "✗"}
              </Text>
            </group>
          ))}
        </group>
      )}
    </group>
  );
}

interface Coin3DProps {
  phase: string;
  result: CoinSide | null;
  myGuess: CoinGuess;
}

function Coin3D({ phase, result }: Coin3DProps) {
  const coinRef = useRef<THREE.Group>(null);
  const [rotation, setRotation] = useState(0);

  useFrame((_, delta) => {
    if (coinRef.current) {
      if (phase === "flipping") {
        setRotation((r) => r + delta * 15);
        coinRef.current.rotation.x = rotation;
      } else {
        coinRef.current.rotation.x = 0;
      }
    }
  });

  return (
    <group ref={coinRef} position={[0, 0, 0]}>
      {/* Coin body */}
      <mesh>
        <cylinderGeometry args={[1.2, 1.2, 0.15, 32]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Coin face */}
      <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.1, 32]} />
        <meshStandardMaterial color="#f59e0b" />
      </mesh>

      {/* Symbol on coin */}
      <Text
        position={[0, 0.09, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.8}
        anchorX="center"
        anchorY="middle"
      >
        {phase === "revealing" || phase === "finished"
          ? result === "heads"
            ? "🪙"
            : "⭐"
          : "❓"}
      </Text>
    </group>
  );
}

interface GuessButtonProps {
  position: [number, number, number];
  type: CoinSide;
  onClick: () => void;
}

function GuessButton({ position, type, onClick }: GuessButtonProps) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      const targetScale = hovered ? 1.1 : 1;
      meshRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.1
      );
    }
  });

  const color = type === "heads" ? "#3b82f6" : "#f59e0b";

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <cylinderGeometry args={[0.8, 0.8, 0.2, 32]} />
        <meshStandardMaterial
          color={hovered ? "#22c55e" : color}
          emissive={hovered ? "#22c55e" : color}
          emissiveIntensity={hovered ? 0.4 : 0.1}
        />
      </mesh>
      <Text
        position={[0, 0.2, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.5}
        anchorX="center"
      >
        {COIN_ICONS[type]}
      </Text>
      <Text
        position={[0, -0.5, 0]}
        fontSize={0.2}
        color="#fff"
        anchorX="center"
      >
        {COIN_NAMES[type]}
      </Text>
    </group>
  );
}
