"use client";

import type {
    BlackjackCard,
    BlackjackPhase,
    BlackjackPlayerHand
} from "@/src/domain/types/blackjackState";
import {
    calculateHandValue,
    getSuitColor,
} from "@/src/domain/types/blackjackState";

interface Blackjack3DProps {
  dealerHand: BlackjackCard[];
  dealerRevealed: boolean;
  playerHands: BlackjackPlayerHand[];
  myPlayerId: string;
  myHand?: BlackjackPlayerHand;
  phase: BlackjackPhase;
  canTakeAction: boolean;
  currentTurn: string;
  dealerId: string;
  players: { odId: string; nickname: string; isAI?: boolean }[];
  onHit: () => void;
  onStand: () => void;
}

/**
 * 3D Three.js rendering of Blackjack game
 * For now, uses a styled 3D-like 2D view
 * TODO: Implement full Three.js 3D rendering
 */
export function Blackjack3D({
  dealerHand,
  dealerRevealed,
  myHand,
  phase,
  canTakeAction,
  onHit,
  onStand,
}: Blackjack3DProps) {
  // Get values
  const myHandValue = myHand ? calculateHandValue(myHand.cards) : 0;
  const dealerValue = dealerRevealed
    ? calculateHandValue(dealerHand)
    : dealerHand.length > 0
      ? calculateHandValue([dealerHand[0]])
      : 0;

  return (
    <group>
      {/* Table surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <boxGeometry args={[12, 8, 0.3]} />
        <meshStandardMaterial color="#1a5f2a" />
      </mesh>

      {/* Table edge */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.65, 0]}>
        <boxGeometry args={[13, 9, 0.3]} />
        <meshStandardMaterial color="#5c3a21" />
      </mesh>

      {/* Dealer area light */}
      <pointLight position={[0, 3, -2]} intensity={0.5} color="#ffd700" />

      {/* Dealer cards */}
      <group position={[0, 0, -2]}>
        {dealerHand.map((card, index) => (
          <Card3D
            key={index}
            card={card}
            position={[index * 1.2 - (dealerHand.length - 1) * 0.6, 0, 0]}
            hidden={!dealerRevealed && index === 1}
          />
        ))}
      </group>

      {/* Dealer value indicator */}
      <mesh position={[0, 0.1, -3.5]}>
        <planeGeometry args={[1.5, 0.5]} />
        <meshBasicMaterial color="#000000" opacity={0.6} transparent />
      </mesh>

      {/* Player cards */}
      <group position={[0, 0, 2]}>
        {myHand?.cards.map((card, index) => (
          <Card3D
            key={index}
            card={card}
            position={[index * 1.2 - (myHand.cards.length - 1) * 0.6, 0, 0]}
            hidden={false}
          />
        ))}
      </group>

      {/* Player/dealer indicators */}
      <mesh position={[0, 0.1, 3.5]}>
        <planeGeometry args={[1.5, 0.5]} />
        <meshBasicMaterial color="#000000" opacity={0.6} transparent />
      </mesh>
    </group>
  );
}

interface Card3DProps {
  card: BlackjackCard;
  position: [number, number, number];
  hidden?: boolean;
}

function Card3D({ card, position, hidden = false }: Card3DProps) {
  const color = getSuitColor(card.suit);

  return (
    <group position={position}>
      {/* Card body */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <boxGeometry args={[0.9, 1.3, 0.02]} />
        <meshStandardMaterial
          color={hidden ? "#2a4a8a" : "#ffffff"}
          roughness={0.3}
        />
      </mesh>

      {/* Card face content (if not hidden) */}
      {!hidden && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
          <planeGeometry args={[0.85, 1.25]} />
          <meshBasicMaterial color={color === "red" ? "#dc2626" : "#1a1a1a"} />
        </mesh>
      )}

      {/* Card back pattern (if hidden) */}
      {hidden && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
          <planeGeometry args={[0.8, 1.2]} />
          <meshBasicMaterial color="#1e3a5f" />
        </mesh>
      )}
    </group>
  );
}

// Export for use
export { Card3D as BlackjackCard3D };
