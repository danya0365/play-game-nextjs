import { GamePlayView } from "@/src/presentation/components/game/GamePlayView";
import type { Metadata } from "next";

interface PlayPageProps {
  params: Promise<{ peerId: string }>;
}

export const metadata: Metadata = {
  title: "กำลังเล่นเกม | Play Game",
  description: "เล่นเกมออนไลน์ P2P กับเพื่อน",
};

/**
 * Game Play Page
 * Dynamically renders the correct game based on room.gameSlug
 */
export default async function PlayPage({ params }: PlayPageProps) {
  // peerId is used to maintain URL consistency with room
  // The actual game state comes from the room store
  await params; // Await params to satisfy Next.js

  return <GamePlayView />;
}
