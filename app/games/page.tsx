import type { GameCategoryKey } from "@/src/domain/types/game";
import { GamesView } from "@/src/presentation/components/games/GamesView";
import { MainLayout } from "@/src/presentation/components/layout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "เกมทั้งหมด | Play Game",
  description:
    "รวมเกมออนไลน์ P2P มากกว่า 75 เกม เล่นกับเพื่อนได้ทันที เกมไพ่ บอร์ดเกม เกมปาร์ตี้ และอีกมากมาย",
};

interface GamesPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function GamesPage({ searchParams }: GamesPageProps) {
  const params = await searchParams;
  const category = params.category as GameCategoryKey | undefined;

  return (
    <MainLayout>
      <GamesView initialCategory={category || null} />
    </MainLayout>
  );
}
