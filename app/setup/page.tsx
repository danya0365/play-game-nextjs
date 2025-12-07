import { MainLayout } from "@/src/presentation/components/layout";
import { SetupView } from "@/src/presentation/components/setup/SetupView";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "สร้างโปรไฟล์ | Play Game",
  description: "สร้างโปรไฟล์เพื่อเริ่มเล่นเกมออนไลน์กับเพื่อน",
};

export default function SetupPage() {
  return (
    <MainLayout>
      <SetupView />
    </MainLayout>
  );
}
