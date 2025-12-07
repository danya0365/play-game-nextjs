"use client";

import {
  ArrowRight,
  Dice5,
  Gamepad2,
  Puzzle,
  Shield,
  Spade,
  Sparkles,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";

/**
 * Game category data for display
 */
const gameCategories = [
  {
    id: "card_games",
    name: "เกมไพ่",
    icon: Spade,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    games: ["ดัมมี่", "ป๊อกเด้ง", "Blackjack", "UNO"],
    count: 20,
  },
  {
    id: "board_games",
    name: "บอร์ดเกม",
    icon: Dice5,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    games: ["Chess", "Checkers", "Tic Tac Toe", "Connect 4"],
    count: 20,
  },
  {
    id: "party_games",
    name: "เกมปาร์ตี้",
    icon: Users,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    games: ["Mafia", "Werewolf", "Trivia Quiz", "Charades"],
    count: 11,
  },
  {
    id: "casual_multiplayer",
    name: "เกมหลายคน",
    icon: Gamepad2,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    games: ["Snake Battle", "Tank Battle", "Bomberman"],
    count: 7,
  },
  {
    id: "puzzle_and_word",
    name: "ปริศนา",
    icon: Puzzle,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    games: ["Hangman", "Word Guess", "Memory Pair"],
    count: 8,
  },
  {
    id: "casino",
    name: "คาสิโน",
    icon: Trophy,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    games: ["Roulette", "Baccarat", "Slot Machine"],
    count: 9,
  },
];

/**
 * Feature highlights
 */
const features = [
  {
    icon: Zap,
    title: "เล่นได้ทันที",
    description: "ไม่ต้องสมัครสมาชิก ไม่ต้องดาวน์โหลด เปิดเว็บแล้วเล่นได้เลย",
  },
  {
    icon: Users,
    title: "P2P Connection",
    description: "เชื่อมต่อตรงกับเพื่อน ไม่ผ่าน server ลดความหน่วง",
  },
  {
    icon: Shield,
    title: "ความเป็นส่วนตัว",
    description: "ข้อมูลเก็บในเครื่องคุณเท่านั้น ไม่มีการเก็บบน server",
  },
  {
    icon: Sparkles,
    title: "กราฟิก 3D",
    description: "เกมสวยงามด้วย React Three และ Rapier Physics",
  },
];

/**
 * Landing Page View Component
 */
export function LandingView() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-info/5 via-transparent to-success/5" />

        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-info/10 text-info text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              <span>Phase 1: P2P with PeerJS</span>
            </div>

            {/* Heading */}
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              เล่นเกมออนไลน์
              <br />
              <span className="text-info">กับเพื่อน</span> ได้ทุกที่
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-muted mb-8 max-w-2xl mx-auto">
              เว็บเกมออนไลน์ P2P มากกว่า 75 เกม เล่นได้ทันทีไม่ต้องสมัคร
              ส่งลิงก์ให้เพื่อนแล้วเล่นด้วยกันได้เลย!
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/games"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-info text-white font-semibold hover:bg-info-dark transition-colors"
              >
                <Gamepad2 className="w-5 h-5" />
                <span>เริ่มเล่นเกม</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/setup"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-border bg-surface hover:bg-muted-light dark:hover:bg-muted-dark font-semibold transition-colors"
              >
                <Users className="w-5 h-5" />
                <span>สร้างโปรไฟล์</span>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-12 max-w-lg mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-info">75+</div>
                <div className="text-sm text-muted">เกม</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-success">6</div>
                <div className="text-sm text-muted">หมวดหมู่</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-warning">P2P</div>
                <div className="text-sm text-muted">Connection</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-surface">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">ทำไมต้องเลือกเรา?</h2>
            <p className="text-muted max-w-xl mx-auto">
              Play Game ออกแบบมาเพื่อให้คุณเล่นเกมกับเพื่อนได้ง่ายที่สุด
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-xl bg-background border border-border hover:border-info/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-lg bg-info/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-info" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Game Categories Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">หมวดหมู่เกม</h2>
              <p className="text-muted">เลือกหมวดหมู่ที่คุณสนใจ</p>
            </div>
            <Link
              href="/games"
              className="hidden sm:flex items-center gap-2 text-info hover:text-info-dark transition-colors font-medium"
            >
              <span>ดูทั้งหมด</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {gameCategories.map((category) => (
              <Link
                key={category.id}
                href={`/games?category=${category.id}`}
                className="group p-6 rounded-xl border border-border bg-surface hover:border-info/50 hover:shadow-lg transition-all"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-lg ${category.bgColor} flex items-center justify-center shrink-0`}
                  >
                    <category.icon className={`w-6 h-6 ${category.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-lg font-semibold group-hover:text-info transition-colors">
                        {category.name}
                      </h3>
                      <span className="text-sm text-muted">
                        {category.count} เกม
                      </span>
                    </div>
                    <p className="text-sm text-muted truncate">
                      {category.games.join(", ")}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Mobile View All Link */}
          <div className="mt-6 sm:hidden">
            <Link
              href="/games"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-lg border border-border text-info font-medium"
            >
              <span>ดูเกมทั้งหมด</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-info to-info-dark">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            พร้อมเล่นเกมกับเพื่อนหรือยัง?
          </h2>
          <p className="text-white/80 mb-8 max-w-xl mx-auto">
            สร้างห้องเกม ส่งลิงก์ให้เพื่อน แล้วเริ่มเล่นได้ทันที!
          </p>
          <Link
            href="/games"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg bg-white text-info font-semibold hover:bg-gray-100 transition-colors"
          >
            <Gamepad2 className="w-5 h-5" />
            <span>เลือกเกมเลย</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
