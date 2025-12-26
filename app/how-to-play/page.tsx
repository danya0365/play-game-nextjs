import { HowToPlayView } from "@/src/presentation/components/how-to-play/HowToPlayView";
import type { Metadata } from "next";

/**
 * How to Play Page - Server Component for SEO optimization
 * Uses View component for rendering following Clean Architecture pattern
 */
export const metadata: Metadata = {
  title: "วิธีเล่น | Play Game",
  description: "คู่มือการใช้งาน Play Game P2P - เล่นเกมออนไลน์กับเพื่อน",
  openGraph: {
    title: "วิธีเล่น | Play Game",
    description: "คู่มือการใช้งาน Play Game P2P - เล่นเกมออนไลน์กับเพื่อน",
    type: "website",
  },
};

export default function HowToPlayPage() {
  return <HowToPlayView />;
}
