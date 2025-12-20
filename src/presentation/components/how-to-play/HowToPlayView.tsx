"use client";

import { MainLayout } from "@/src/presentation/components/layout/MainLayout";
import {
    ArrowLeft,
    Gamepad2,
    Monitor,
    Share2,
    Smartphone,
    Users,
    Wifi,
    Zap,
} from "lucide-react";
import Link from "next/link";

/**
 * How to Play View Component
 * Presentational component for how-to-play page
 */
export function HowToPlayView() {
  const steps = [
    {
      icon: <Gamepad2 className="w-8 h-8" />,
      title: "1. เลือกเกม",
      description: "ไปที่หน้า 'เกมทั้งหมด' แล้วเลือกเกมที่ต้องการเล่น",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "2. สร้างหรือเข้าห้อง",
      description:
        "สร้างห้องใหม่เพื่อเป็น Host หรือใส่รหัสห้องเพื่อเข้าร่วมเกม",
    },
    {
      icon: <Share2 className="w-8 h-8" />,
      title: "3. แชร์รหัสห้อง",
      description: "ส่งรหัสห้อง 6 หลักให้เพื่อน เพื่อให้เข้ามาเล่นด้วยกัน",
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "4. เริ่มเล่น!",
      description: "เมื่อเพื่อนเข้าร่วมแล้ว Host กดเริ่มเกมได้เลย",
    },
  ];

  const features = [
    {
      icon: <Wifi className="w-6 h-6" />,
      title: "เชื่อมต่อ P2P",
      description: "เล่นกันตรงๆ ไม่ผ่าน server ลดความหน่วง",
    },
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: "รองรับทุกอุปกรณ์",
      description: "เล่นได้ทั้งบน PC และมือถือ",
    },
    {
      icon: <Monitor className="w-6 h-6" />,
      title: "2D / 3D",
      description: "สลับโหมดแสดงผลได้ตามต้องการ",
    },
  ];

  return (
    <MainLayout>
      <div className="min-h-screen py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Back Button */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>กลับหน้าหลัก</span>
          </Link>

          {/* Title */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              🎮 วิธีเล่น
            </h1>
            <p className="text-lg text-muted max-w-2xl mx-auto">
              เริ่มต้นเล่นเกมกับเพื่อนได้ง่ายๆ ใน 4 ขั้นตอน
            </p>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {steps.map((step, index) => (
              <div
                key={index}
                className="relative p-6 rounded-2xl bg-surface border border-border hover:border-info transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-info/10 text-info">
                    {step.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      {step.title}
                    </h3>
                    <p className="text-muted">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Features */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              ✨ ฟีเจอร์เด่น
            </h2>
            <p className="text-muted">สิ่งที่ทำให้ Play Game พิเศษ</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-5 rounded-xl bg-surface border border-border text-center"
              >
                <div className="inline-flex p-3 rounded-full bg-primary/10 text-primary mb-3">
                  {feature.icon}
                </div>
                <h3 className="font-bold text-foreground mb-1">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link
              href="/games"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-info text-white font-bold text-lg hover:bg-info/90 transition-colors"
            >
              <Gamepad2 className="w-6 h-6" />
              เริ่มเล่นเลย!
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
