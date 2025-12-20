"use client";

import { MainLayout } from "@/src/presentation/components/layout/MainLayout";
import { ArrowLeft, Code2, Gamepad2, Heart, Users, Zap } from "lucide-react";
import Link from "next/link";

/**
 * About View Component
 * Presentational component for about page
 */
export function AboutView() {
  const techStack = [
    { name: "Next.js 15", desc: "App Router" },
    { name: "TypeScript", desc: "Type-safe" },
    { name: "Tailwind CSS", desc: "Styling" },
    { name: "Zustand", desc: "State Management" },
    { name: "PeerJS", desc: "P2P Connection" },
    { name: "React Three Fiber", desc: "3D Graphics" },
  ];

  const stats = [
    { icon: <Gamepad2 className="w-6 h-6" />, value: "75+", label: "เกม" },
    { icon: <Users className="w-6 h-6" />, value: "P2P", label: "ไร้ Server" },
    { icon: <Zap className="w-6 h-6" />, value: "0", label: "ค่าใช้จ่าย" },
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

          {/* Hero */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-4">
              <Gamepad2 className="w-12 h-12 text-info" />
              <h1 className="text-4xl font-bold text-foreground">Play Game</h1>
            </div>
            <p className="text-xl text-muted max-w-2xl mx-auto">
              แพลตฟอร์มเกมออนไลน์แบบ P2P สำหรับเล่นกับเพื่อน
              <br />
              ไม่ต้องสมัครสมาชิก ไม่มีค่าใช้จ่าย เล่นได้เลย!
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-12">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl bg-surface border border-border text-center"
              >
                <div className="inline-flex p-3 rounded-full bg-info/10 text-info mb-3">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-foreground">
                  {stat.value}
                </div>
                <div className="text-sm text-muted">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* About */}
          <div className="p-8 rounded-2xl bg-surface border border-border mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Heart className="w-6 h-6 text-error" />
              เกี่ยวกับโปรเจค
            </h2>
            <div className="space-y-4 text-muted">
              <p>
                Play Game เป็นโปรเจคเกมออนไลน์แบบ Open Source ที่ใช้เทคโนโลยี
                Peer-to-Peer (P2P) ทำให้ผู้เล่นสามารถเชื่อมต่อกันได้โดยตรง
                โดยไม่ต้องผ่าน server กลาง
              </p>
              <p>
                เป้าหมายคือสร้างแพลตฟอร์มที่ทุกคนสามารถเล่นเกมกับเพื่อนได้ง่ายๆ
                ไม่ว่าจะเป็นเกมไพ่ เกมบอร์ด หรือเกมปาร์ตี้
                โดยไม่ต้องติดตั้งอะไรเพิ่มเติม แค่เปิดเว็บแล้วเล่นได้เลย
              </p>
            </div>
          </div>

          {/* Tech Stack */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Code2 className="w-6 h-6 text-primary" />
              Tech Stack
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {techStack.map((tech, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl bg-surface border border-border"
                >
                  <div className="font-bold text-foreground">{tech.name}</div>
                  <div className="text-sm text-muted">{tech.desc}</div>
                </div>
              ))}
            </div>
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
