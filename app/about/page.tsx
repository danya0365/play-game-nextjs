import { AboutView } from "@/src/presentation/components/about/AboutView";
import type { Metadata } from "next";

/**
 * About Page - Server Component for SEO optimization
 * Uses View component for rendering following Clean Architecture pattern
 */
export const metadata: Metadata = {
  title: "เกี่ยวกับ | Play Game",
  description: "เกี่ยวกับ Play Game P2P - แพลตฟอร์มเกมออนไลน์แบบ P2P",
  openGraph: {
    title: "เกี่ยวกับ | Play Game",
    description: "เกี่ยวกับ Play Game P2P - แพลตฟอร์มเกมออนไลน์แบบ P2P",
    type: "website",
  },
};

export default function AboutPage() {
  return <AboutView />;
}
