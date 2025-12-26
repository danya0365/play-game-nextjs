"use client";

import type {
  KaengCard,
  KaengPhase,
  KaengPlayerHand,
} from "@/src/domain/types/kaengState";
import { getCardDisplay } from "@/src/domain/types/kaengState";
import { Text } from "@react-three/drei";
import { useState } from "react";

interface Kaeng3DProps {
  playerHands: KaengPlayerHand[];
  myPlayerId: string;
  phase: KaengPhase;
  canTakeAction: boolean;
  allCardsRevealed: boolean;
  onReveal: () => void;
  onFold: () => void;
}

// 3D Card component
function Card3D({
  card,
  position,
  rotation = [0, 0, 0],
  hidden = false,
}: {
  card: KaengCard;
  position: [number, number, number];
  rotation?: [number, number, number];
  hidden?: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  if (hidden) {
    return (
      <group position={position} rotation={rotation}>
        <mesh
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <boxGeometry args={[0.7, 1, 0.02]} />
          <meshStandardMaterial
            color={hovered ? "#3b82f6" : "#1e40af"}
            emissive={hovered ? "#1e40af" : "#000000"}
            emissiveIntensity={0.3}
          />
        </mesh>
        {/* Card back pattern */}
        <mesh position={[0, 0, 0.011]}>
          <planeGeometry args={[0.5, 0.8]} />
          <meshStandardMaterial color="#1e3a8a" />
        </mesh>
      </group>
    );
  }

  const display = getCardDisplay(card);
  const textColor = display.color === "red" ? "#ef4444" : "#1f2937";

  return (
    <group position={position} rotation={rotation}>
      {/* Card base */}
      <mesh>
        <boxGeometry args={[0.7, 1, 0.02]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Card text */}
      <Text
        position={[0, 0.2, 0.011]}
        fontSize={0.25}
        color={textColor}
        anchorX="center"
        anchorY="middle"
      >
        {display.rank}
      </Text>
      <Text
        position={[0, -0.2, 0.011]}
        fontSize={0.3}
        color={textColor}
        anchorX="center"
        anchorY="middle"
      >
        {display.suit}
      </Text>
    </group>
  );
}

/**
 * 3D Three.js rendering of Kaeng game
 */
export function Kaeng3D({
  playerHands,
  myPlayerId,
  phase: _phase,
  canTakeAction: _canTakeAction,
  allCardsRevealed,
  onReveal: _onReveal,
  onFold: _onFold,
}: Kaeng3DProps) {
  // Find my hand
  const myHand = playerHands.find((h) => h.playerId === myPlayerId);

  return (
    <group>
      {/* Table surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <circleGeometry args={[5, 64]} />
        <meshStandardMaterial color="#581c87" />
      </mesh>

      {/* Table edge */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <ringGeometry args={[4.8, 5.2, 64]} />
        <meshStandardMaterial color="#7c3aed" />
      </mesh>

      {/* My cards at bottom */}
      {myHand?.cards.map((card, idx) => (
        <Card3D
          key={idx}
          card={card}
          position={[(idx - 1) * 0.8, 0, 3]}
          hidden={false}
        />
      ))}

      {/* Other players' cards arranged in a circle */}
      {playerHands
        .filter((hand) => hand.playerId !== myPlayerId)
        .map((hand, playerIdx) => {
          const angle = (Math.PI / 3) * (playerIdx + 1);
          const radius = 2.5;
          const x = Math.sin(angle) * radius;
          const z = -Math.cos(angle) * radius;

          return (
            <group key={hand.playerId}>
              {hand.cards.map((card, cardIdx) => (
                <Card3D
                  key={cardIdx}
                  card={card}
                  position={[x + (cardIdx - 1) * 0.5, 0, z]}
                  rotation={[0, angle, 0]}
                  hidden={!allCardsRevealed}
                />
              ))}
            </group>
          );
        })}

      {/* Ambient light */}
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 5, 0]} intensity={1} />
    </group>
  );
}
