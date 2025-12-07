import { ThemeProvider } from "@/src/presentation/providers/ThemeProvider";
import type { Metadata } from "next";
import "../public/styles/index.css";

export const metadata: Metadata = {
  title: "Play Game - เกมออนไลน์ P2P เล่นกับเพื่อน",
  description:
    "เว็บเกมออนไลน์ P2P เล่นกับเพื่อนได้ทุกที่ทุกเวลา ไม่ต้องสมัครสมาชิก ไม่ต้องดาวน์โหลด เล่นได้เลย!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
