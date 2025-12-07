import { GAMES, getGameBySlug } from "@/src/domain/data/games";
import { GameLobby } from "@/src/presentation/components/lobby";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

interface GamePageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Generate static params for all games
 */
export async function generateStaticParams() {
  return GAMES.map((game) => ({
    slug: game.slug,
  }));
}

/**
 * Generate metadata for the game page
 */
export async function generateMetadata({
  params,
}: GamePageProps): Promise<Metadata> {
  const { slug } = await params;
  const game = getGameBySlug(slug);

  if (!game) {
    return {
      title: "ไม่พบเกม | Play Game",
    };
  }

  return {
    title: `${game.nameTh || game.name} | Play Game`,
    description: `เล่น ${game.nameTh || game.name} ออนไลน์กับเพื่อน ${
      game.minPlayers
    }-${game.maxPlayers} คน`,
  };
}

/**
 * Game Lobby Page
 */
export default async function GamePage({ params }: GamePageProps) {
  const { slug } = await params;
  const game = getGameBySlug(slug);

  if (!game) {
    notFound();
  }

  // Check if game is available
  if (game.status !== "available" && game.status !== "coming_soon") {
    notFound();
  }

  return <GameLobby game={game} />;
}
