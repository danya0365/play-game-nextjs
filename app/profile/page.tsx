import { ProfileView } from "@/src/presentation/components/profile/ProfileView";
import type { Metadata } from "next";

/**
 * Profile Page - Server Component for SEO optimization
 * Uses View component for rendering following Clean Architecture pattern
 */
export const metadata: Metadata = {
  title: "โปรไฟล์ | Play Game",
  description: "จัดการโปรไฟล์และแก้ไขข้อมูลส่วนตัว",
  openGraph: {
    title: "โปรไฟล์ | Play Game",
    description: "จัดการโปรไฟล์และแก้ไขข้อมูลส่วนตัว",
    type: "website",
  },
};

export default function ProfilePage() {
  return <ProfileView />;
}
