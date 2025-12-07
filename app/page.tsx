import { LandingView } from "@/src/presentation/components/landing/LandingView";
import { MainLayout } from "@/src/presentation/components/layout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Play Game - เกมออนไลน์ P2P เล่นกับเพื่อน",
  description:
    "เว็บเกมออนไลน์ P2P เล่นกับเพื่อนได้ทุกที่ทุกเวลา ไม่ต้องสมัครสมาชิก ไม่ต้องดาวน์โหลด เล่นได้เลย! มีเกมไพ่ บอร์ดเกม เกมปาร์ตี้ และอีกมากมาย",
};

export default function HomePage() {
  return (
    <MainLayout>
      <LandingView />
    </MainLayout>
  );
}
