import { RoomLobby } from "@/src/presentation/components/lobby";
import type { Metadata } from "next";

interface RoomPageProps {
  params: Promise<{ peerId: string }>;
}

export const metadata: Metadata = {
  title: "ห้องเกม | Play Game",
  description: "ห้องเกมออนไลน์ P2P",
};

/**
 * Room Page - Dynamic route for game rooms
 */
export default async function RoomPage({ params }: RoomPageProps) {
  const { peerId } = await params;

  return <RoomLobby hostPeerId={peerId} />;
}
