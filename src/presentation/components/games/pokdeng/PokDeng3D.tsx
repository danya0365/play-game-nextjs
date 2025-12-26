"use client";

import type {
  PokDengCard,
  PokDengPhase,
  PokDengPlayerHand,
} from "@/src/domain/types/pokdengState";
import {
  evaluateHand,
  getCardDisplay,
  getHandTypeName,
} from "@/src/domain/types/pokdengState";
import { Html, RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import * as THREE from "three";

interface PokDeng3DProps {
  dealerHand: PokDengCard[];
  dealerRevealed: boolean;
  playerHands: PokDengPlayerHand[];
  myPlayerId: string;
  phase: PokDengPhase;
  canTakeAction: boolean;
  onDraw: () => void;
  onStand: () => void;
}

/**
 * 3D Three.js rendering of Pok Deng game
 * Casino-style table view
 */
export function PokDeng3D({
  dealerHand,
  dealerRevealed,
  playerHands,
  myPlayerId,
  phase,
  canTakeAction,
  onDraw,
  onStand,
}: PokDeng3DProps) {
  const myHand = playerHands.find((h) => h.playerId === myPlayerId);
  const myHandEval = myHand ? evaluateHand(myHand.cards) : null;
  const dealerEval = dealerRevealed ? evaluateHand(dealerHand) : null;

  return (
    <group>
      {/* Casino Table */}
      <CasinoTable />

      {/* Dealer Area */}
      <group position={[0, 0.15, -2.5]}>
        {/* Dealer Label */}
        <Html position={[0, 0.8, -0.5]} center>
          <div className="px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-sm border border-white/10">
            <span className="text-white/80 text-sm font-medium">เจ้ามือ</span>
          </div>
        </Html>

        {/* Dealer Cards */}
        <group position={[0, 0, 0]}>
          {dealerHand.map((card, index) => (
            <Card3D
              key={index}
              card={card}
              position={[(index - (dealerHand.length - 1) / 2) * 1.3, 0, 0]}
              hidden={!dealerRevealed && index > 0}
              rotation={[-0.2, 0, 0]}
            />
          ))}
        </group>

        {/* Dealer Score */}
        {dealerRevealed && dealerEval && (
          <Html position={[0, 0.3, 1]} center>
            <div className="flex flex-col items-center">
              <div className="px-4 py-1.5 rounded-full bg-black/50 backdrop-blur-sm">
                <span className="text-amber-400 font-bold text-lg">
                  {dealerEval.points} แต้ม
                </span>
                {dealerEval.isPok && (
                  <span className="ml-2 text-yellow-300 text-sm font-bold">
                    ป๊อก!
                  </span>
                )}
              </div>
              {dealerEval.deng > 1 && (
                <span className="text-emerald-300 text-xs mt-1">
                  {getHandTypeName(dealerEval.handType)} ({dealerEval.deng}{" "}
                  เด้ง)
                </span>
              )}
            </div>
          </Html>
        )}
      </group>

      {/* Center Area - Actions & Results */}
      <group position={[0, 0.5, 0]}>
        {/* Result Display */}
        {phase === "finished" && myHand?.result && (
          <Html position={[0, 1, 0]} center>
            <div className="flex flex-col items-center animate-bounce">
              <div
                className={`text-4xl md:text-5xl font-black ${
                  myHand.result === "win"
                    ? "text-yellow-400 drop-shadow-[0_0_30px_rgba(250,204,21,0.6)]"
                    : myHand.result === "lose"
                    ? "text-red-400 drop-shadow-[0_0_30px_rgba(248,113,113,0.6)]"
                    : "text-white"
                }`}
              >
                {myHand.result === "win"
                  ? "🎉 ชนะ!"
                  : myHand.result === "lose"
                  ? "แพ้"
                  : "เสมอ"}
              </div>
              {myHand.result !== "tie" && (
                <div
                  className={`text-2xl font-bold mt-2 ${
                    myHand.result === "win" ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {myHand.result === "win" ? "+" : ""}
                  {myHand.payout}
                </div>
              )}
            </div>
          </Html>
        )}

        {/* Turn Indicator */}
        {phase === "player_turn" && canTakeAction && (
          <Html position={[0, 0.5, 0]} center>
            <div className="px-5 py-2 rounded-full bg-amber-500/20 border border-amber-500/50 backdrop-blur-sm">
              <span className="text-amber-300 font-medium animate-pulse">
                ตาของคุณ
              </span>
            </div>
          </Html>
        )}

        {/* Action Buttons */}
        {canTakeAction && (
          <Html position={[0, -0.3, 0]} center>
            <div className="flex gap-4">
              <button
                onClick={onDraw}
                className="relative px-8 py-4 rounded-2xl font-bold text-xl
                         bg-gradient-to-b from-blue-400 to-blue-600 text-white
                         shadow-[0_6px_0_0_#1e40af,0_8px_30px_rgba(59,130,246,0.5)]
                         hover:shadow-[0_4px_0_0_#1e40af,0_6px_25px_rgba(59,130,246,0.5)]
                         hover:translate-y-[2px]
                         active:shadow-[0_0px_0_0_#1e40af]
                         active:translate-y-[6px]
                         transition-all duration-100"
              >
                <span className="flex items-center gap-2">
                  <span className="text-2xl">🃏</span>
                  จั่ว
                </span>
              </button>
              <button
                onClick={onStand}
                className="relative px-8 py-4 rounded-2xl font-bold text-xl
                         bg-gradient-to-b from-amber-400 to-amber-600 text-black
                         shadow-[0_6px_0_0_#b45309,0_8px_30px_rgba(245,158,11,0.5)]
                         hover:shadow-[0_4px_0_0_#b45309,0_6px_25px_rgba(245,158,11,0.5)]
                         hover:translate-y-[2px]
                         active:shadow-[0_0px_0_0_#b45309]
                         active:translate-y-[6px]
                         transition-all duration-100"
              >
                <span className="flex items-center gap-2">
                  <span className="text-2xl">✋</span>
                  หงาย
                </span>
              </button>
            </div>
          </Html>
        )}

        {/* Waiting indicator */}
        {phase === "player_turn" && !canTakeAction && (
          <Html position={[0, 0, 0]} center>
            <div className="flex items-center gap-2 text-white/60 bg-black/30 px-4 py-2 rounded-full backdrop-blur-sm">
              <div className="w-2 h-2 rounded-full bg-white/60 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-white/60 animate-bounce [animation-delay:0.1s]" />
              <div className="w-2 h-2 rounded-full bg-white/60 animate-bounce [animation-delay:0.2s]" />
              <span className="ml-2 text-sm">รอผู้เล่นอื่น...</span>
            </div>
          </Html>
        )}
      </group>

      {/* Player Area */}
      <group position={[0, 0.15, 3]}>
        {/* Player Score */}
        {myHandEval && (
          <Html position={[0, 0.8, -0.5]} center>
            <div className="flex flex-col items-center">
              <div
                className={`px-4 py-1.5 rounded-full backdrop-blur-sm ${
                  myHandEval.isPok
                    ? "bg-yellow-500/30 border border-yellow-400/50"
                    : "bg-black/40"
                }`}
              >
                <span
                  className={`font-bold text-xl ${
                    myHandEval.isPok ? "text-yellow-300" : "text-white"
                  }`}
                >
                  {myHandEval.points} แต้ม
                </span>
                {myHandEval.isPok && (
                  <span className="ml-2 text-yellow-200 font-bold">ป๊อก!</span>
                )}
              </div>
              {myHandEval.deng > 1 && (
                <span className="text-emerald-300 text-xs mt-1">
                  {getHandTypeName(myHandEval.handType)} ({myHandEval.deng}{" "}
                  เด้ง)
                </span>
              )}
            </div>
          </Html>
        )}

        {/* Player Cards */}
        <group position={[0, 0, 0]}>
          {myHand?.cards.map((card, index) => (
            <Card3D
              key={`${card.suit}-${card.rank}-${index}`}
              card={card}
              position={[(index - (myHand.cards.length - 1) / 2) * 1.3, 0, 0]}
              hidden={false}
              rotation={[0.2, 0, 0]}
              isPlayer
            />
          ))}
        </group>

        {/* Player Label */}
        <Html position={[0, 0.3, 1]} center>
          <div className="px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-sm border border-white/10">
            <span className="text-white/80 text-sm font-medium">มือของคุณ</span>
          </div>
        </Html>
      </group>

      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 8, 0]} intensity={0.8} color="#fff5e6" />
      <spotLight
        position={[0, 10, 5]}
        angle={0.4}
        penumbra={0.5}
        intensity={0.6}
        color="#fff"
        castShadow
      />
      <spotLight
        position={[5, 6, 0]}
        angle={0.5}
        penumbra={1}
        intensity={0.3}
        color="#ffd700"
      />
      <spotLight
        position={[-5, 6, 0]}
        angle={0.5}
        penumbra={1}
        intensity={0.3}
        color="#ffd700"
      />
    </group>
  );
}

/**
 * Casino Table Component
 */
function CasinoTable() {
  return (
    <group>
      {/* Main table surface - green felt */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 10]} />
        <meshStandardMaterial color="#1a5f3c" roughness={0.8} metalness={0} />
      </mesh>

      {/* Table edge - wood rim */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <ringGeometry args={[6.5, 7.2, 64]} />
        <meshStandardMaterial color="#5d3a1a" roughness={0.6} metalness={0.2} />
      </mesh>

      {/* Decorative inner ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[3.5, 3.6, 64]} />
        <meshStandardMaterial
          color="#c9a84c"
          roughness={0.4}
          metalness={0.6}
          emissive="#c9a84c"
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* Center decoration */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[1.5, 32]} />
        <meshStandardMaterial
          color="#0d4028"
          roughness={0.9}
          transparent
          opacity={0.5}
        />
      </mesh>
    </group>
  );
}

interface Card3DProps {
  card: PokDengCard;
  position: [number, number, number];
  hidden?: boolean;
  rotation?: [number, number, number];
  isPlayer?: boolean;
}

function Card3D({
  card,
  position,
  hidden = false,
  rotation = [0, 0, 0],
  isPlayer = false,
}: Card3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const display = getCardDisplay(card);

  // Hover animation
  useFrame(() => {
    if (groupRef.current && isPlayer) {
      const targetY = hovered ? 0.15 : 0;
      groupRef.current.position.y = THREE.MathUtils.lerp(
        groupRef.current.position.y,
        targetY,
        0.1
      );
    }
  });

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      {/* Card base */}
      <RoundedBox
        args={[1, 1.5, 0.02]}
        radius={0.05}
        smoothness={4}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color={hidden ? "#1e3a8a" : "#ffffff"}
          roughness={hidden ? 0.6 : 0.2}
          metalness={0.1}
        />
      </RoundedBox>

      {/* Card content overlay */}
      <Html position={[0, 0, 0.015]} transform scale={0.12} center occlude>
        {hidden ? (
          <div className="w-36 h-52 bg-gradient-to-br from-blue-700 via-blue-800 to-purple-900 rounded-lg flex items-center justify-center border-2 border-blue-500/50 overflow-hidden">
            <div className="absolute inset-2 border border-white/20 rounded">
              <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_4px,rgba(255,255,255,0.05)_4px,rgba(255,255,255,0.05)_8px)]" />
            </div>
            <span className="text-4xl z-10">🎴</span>
          </div>
        ) : (
          <div className="w-36 h-52 bg-white rounded-lg flex flex-col items-center justify-center shadow-lg overflow-hidden">
            {/* Top corner */}
            <div className="absolute top-2 left-2 flex flex-col items-center leading-tight">
              <span
                className={`text-xl font-bold ${
                  display.color === "red" ? "text-red-600" : "text-gray-900"
                }`}
              >
                {display.rank}
              </span>
              <span
                className={`text-lg ${
                  display.color === "red" ? "text-red-600" : "text-gray-900"
                }`}
              >
                {display.suit}
              </span>
            </div>

            {/* Center suit */}
            <span
              className={`text-5xl ${
                display.color === "red" ? "text-red-600" : "text-gray-900"
              }`}
            >
              {display.suit}
            </span>

            {/* Bottom corner (rotated) */}
            <div className="absolute bottom-2 right-2 flex flex-col items-center leading-tight rotate-180">
              <span
                className={`text-xl font-bold ${
                  display.color === "red" ? "text-red-600" : "text-gray-900"
                }`}
              >
                {display.rank}
              </span>
              <span
                className={`text-lg ${
                  display.color === "red" ? "text-red-600" : "text-gray-900"
                }`}
              >
                {display.suit}
              </span>
            </div>
          </div>
        )}
      </Html>
    </group>
  );
}
