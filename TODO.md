# 🎮 Play Game P2P - TODO

## Project Overview

เว็บเกมออนไลน์ P2P สำหรับเล่นกับเพื่อน หลายเกม โดยใช้ PeerJS สำหรับการเชื่อมต่อ P2P และ React Three Fiber + Rapier Physics สำหรับ rendering

---

## Phase 1: P2P with PeerJS & React Three

### Core Features

- **ไม่มีระบบ Login** - ใช้ Local User Storage
- **ไม่มี Database** - ทุกอย่างผ่าน PeerJS (Peer-to-Peer)
- **Game Rendering** - React Three Fiber + Rapier Physics
- **State Management** - Zustand + LocalForage persistence

---

## 📋 TODO List

### ✅ Completed

- [x] Initialize Next.js project with dependencies
- [x] MainLayout with Header, Footer, ThemeToggle
- [x] User Store (Zustand + LocalForage)
- [x] Landing Page
- [x] Games List Page (รวมเกมทั้งหมด)
- [x] Game Room System (สร้างห้อง / เข้าห้อง via PeerJS)
- [x] PeerJS Connection Manager
- [x] Room State Synchronization
- [x] Player Presence System
- [x] Base Game Canvas Component (React Three + Rapier)
- [x] Game State Machine
- [x] AI System (Easy/Medium/Hard)
- [x] Sound System (SFX + BGM)
- [x] Connection Status (Ping-Pong)
- [x] Reconnect after refresh

### 🚧 In Progress

- [ ] เพิ่มเกมใหม่

### 📝 Pending

- [ ] เพิ่ม More Games

---

## 🎯 Game List by Category

### 🃏 เกมไพ่ (Card Games)

#### ไพ่คลาสสิก (Classic)

| #   | เกม           | Slug           | Status     |
| --- | ------------- | -------------- | ---------- |
| 1   | ดัมมี่        | `dummy`        | ⏳ Pending |
| 2   | ป๊อกเด้ง      | `pokdeng`      | ⏳ Pending |
| 3   | เก้าเก        | `kao-kae`      | ⏳ Pending |
| 4   | Blackjack     | `blackjack`    | ⏳ Pending |
| 5   | Texas Hold'em | `texas-holdem` | ⏳ Pending |
| 6   | Omaha Poker   | `omaha-poker`  | ⏳ Pending |
| 7   | Baccarat      | `baccarat`     | ⏳ Pending |
| 8   | สลาฟ          | `slave`        | ⏳ Pending |
| 9   | Big Two       | `big-two`      | ⏳ Pending |
| 10  | UNO           | `uno`          | ⏳ Pending |
| 11  | Speed         | `speed`        | ⏳ Pending |
| 12  | Hearts        | `hearts`       | ⏳ Pending |
| 13  | Spades        | `spades`       | ⏳ Pending |
| 14  | Gin Rummy     | `gin-rummy`    | ⏳ Pending |
| 15  | Go Fish       | `go-fish`      | ⏳ Pending |
| 16  | Crazy Eights  | `crazy-eights` | ⏳ Pending |

#### เกมไพ่ปาร์ตี้ / Bluff (Party / Bluff)

| #   | เกม           | Slug          | Status     |
| --- | ------------- | ------------- | ---------- |
| 1   | Liar Card     | `liar-card`   | ⏳ Pending |
| 2   | Cheat / Bluff | `cheat-bluff` | ⏳ Pending |
| 3   | Red Dog       | `red-dog`     | ⏳ Pending |
| 4   | Mau Mau       | `mau-mau`     | ⏳ Pending |

---

### 🎲 บอร์ดเกม (Board Games)

#### วางแผน / กลยุทธ์ (Strategy)

| #   | เกม               | Slug               | Status      |
| --- | ----------------- | ------------------ | ----------- |
| 1   | Chess             | `chess`            | ⏳ Pending  |
| 2   | Checkers          | `checkers`         | ⏳ Pending  |
| 3   | Reversi / Othello | `reversi`          | ⏳ Pending  |
| 4   | Go                | `go`               | ⏳ Pending  |
| 5   | Connect 4         | `connect-four`     | ✅ Complete |
| 6   | Tic Tac Toe       | `tic-tac-toe`      | ✅ Complete |
| 7   | Gomoku            | `gomoku`           | ⏳ Pending  |
| 8   | Nine Men's Morris | `nine-mens-morris` | ⏳ Pending  |
| 9   | Battleship        | `battleship`       | ⏳ Pending  |

#### ปาร์ตี้ / ลุ้นดวง (Party)

| #   | เกม              | Slug             | Status     |
| --- | ---------------- | ---------------- | ---------- |
| 1   | Bingo            | `bingo`          | ⏳ Pending |
| 2   | Snakes & Ladders | `snakes-ladders` | ⏳ Pending |
| 3   | Ludo             | `ludo`           | ⏳ Pending |
| 4   | Monopoly (Lite)  | `monopoly-lite`  | ⏳ Pending |
| 5   | Sorry!           | `sorry`          | ⏳ Pending |
| 6   | Clue (Lite)      | `clue-lite`      | ⏳ Pending |

#### ทายคำ / วาดภาพ (Word & Guess)

| #   | เกม           | Slug            | Status     |
| --- | ------------- | --------------- | ---------- |
| 1   | Charades      | `charades`      | ⏳ Pending |
| 2   | Pictionary    | `pictionary`    | ⏳ Pending |
| 3   | Taboo         | `taboo`         | ⏳ Pending |
| 4   | Heads Up      | `heads-up`      | ⏳ Pending |
| 5   | Scattergories | `scattergories` | ⏳ Pending |

---

### 🎉 เกมปาร์ตี้ / เดาใจ (Party Games)

#### จับโกหก / หาตัวร้าย (Social Deduction)

| #   | เกม           | Slug            | Status     |
| --- | ------------- | --------------- | ---------- |
| 1   | Mafia         | `mafia`         | ⏳ Pending |
| 2   | Werewolf      | `werewolf`      | ⏳ Pending |
| 3   | Spyfall       | `spyfall`       | ⏳ Pending |
| 4   | Secret Hitler | `secret-hitler` | ⏳ Pending |
| 5   | Codenames     | `codenames`     | ⏳ Pending |

#### เกมตอบคำถาม (Quiz & Challenge)

| #   | เกม              | Slug               | Status     |
| --- | ---------------- | ------------------ | ---------- |
| 1   | Trivia Quiz      | `trivia-quiz`      | ⏳ Pending |
| 2   | Guess the Song   | `guess-song`       | ⏳ Pending |
| 3   | Movie Quiz       | `movie-quiz`       | ⏳ Pending |
| 4   | 20 Questions     | `twenty-questions` | ⏳ Pending |
| 5   | Would You Rather | `would-you-rather` | ⏳ Pending |
| 6   | Truth or Dare    | `truth-or-dare`    | ⏳ Pending |

---

### 🎰 คาสิโน (Casino)

#### เกมโต๊ะ (Table Games)

| #   | เกม              | Slug               | Status     |
| --- | ---------------- | ------------------ | ---------- |
| 1   | Blackjack        | `casino-blackjack` | ⏳ Pending |
| 2   | Baccarat         | `casino-baccarat`  | ⏳ Pending |
| 3   | Roulette         | `roulette`         | ⏳ Pending |
| 4   | Sic Bo           | `sic-bo`           | ⏳ Pending |
| 5   | Dragon Tiger     | `dragon-tiger`     | ⏳ Pending |
| 6   | Three Card Poker | `three-card-poker` | ⏳ Pending |

#### เกมตู้ / สล็อต (Machine Games)

| #   | เกม          | Slug           | Status     |
| --- | ------------ | -------------- | ---------- |
| 1   | Slot Machine | `slot-machine` | ⏳ Pending |
| 2   | Video Poker  | `video-poker`  | ⏳ Pending |
| 3   | Keno         | `keno`         | ⏳ Pending |

---

### 🕹️ เกมเล่นหลายคนแบบง่าย (Casual Multiplayer)

#### แข่งตัวต่อตัว (Duel)

| #   | เกม                 | Slug                  | Status      |
| --- | ------------------- | --------------------- | ----------- |
| 1   | Rock Paper Scissors | `rock-paper-scissors` | ✅ Complete |
| 2   | Coin Flip           | `coin-flip`           | ✅ Complete |
| 3   | Dice Roll           | `dice-roll`           | ✅ Complete |
| 4   | Higher Lower        | `higher-lower`        | ✅ Complete |
| 5   | Fast Typing Duel    | `typing-duel`         | ⏳ Pending  |
| 6   | Reaction Speed Test | `reaction-test`       | ⏳ Pending  |

#### สนามประลอง (Arena)

| #   | เกม              | Slug               | Status     |
| --- | ---------------- | ------------------ | ---------- |
| 1   | Snake Battle     | `snake-battle`     | ⏳ Pending |
| 2   | Bomberman Mini   | `bomberman-mini`   | ⏳ Pending |
| 3   | Tank Battle      | `tank-battle`      | ⏳ Pending |
| 4   | Tron Light Cycle | `tron-light-cycle` | ⏳ Pending |

---

### 🧩 ปริศนา / คำศัพท์ (Puzzle & Word)

#### เกมคำศัพท์ (Word)

| #   | เกม                | Slug                 | Status     |
| --- | ------------------ | -------------------- | ---------- |
| 1   | Hangman            | `hangman`            | ⏳ Pending |
| 2   | Word Guess         | `word-guess`         | ⏳ Pending |
| 3   | Crossword Race     | `crossword-race`     | ⏳ Pending |
| 4   | Word Search Battle | `word-search-battle` | ⏳ Pending |

#### ความจำ / ตรรกะ (Memory & Logic)

| #   | เกม             | Slug              | Status     |
| --- | --------------- | ----------------- | ---------- |
| 1   | Memory Pair     | `memory-pair`     | ⏳ Pending |
| 2   | True/False Game | `true-false`      | ⏳ Pending |
| 3   | Number Puzzle   | `number-puzzle`   | ⏳ Pending |
| 4   | Matching Puzzle | `matching-puzzle` | ⏳ Pending |

---

## 📊 Summary

| Category    | Subcategory      | Games Count  |
| ----------- | ---------------- | ------------ |
| 🃏 เกมไพ่   | Classic          | 16           |
| 🃏 เกมไพ่   | Party/Bluff      | 4            |
| 🎲 บอร์ดเกม | Strategy         | 9            |
| 🎲 บอร์ดเกม | Party            | 6            |
| 🎲 บอร์ดเกม | Word & Guess     | 5            |
| 🎉 ปาร์ตี้  | Social Deduction | 5            |
| 🎉 ปาร์ตี้  | Quiz & Challenge | 6            |
| 🎰 คาสิโน   | Table Games      | 6            |
| 🎰 คาสิโน   | Machine Games    | 3            |
| 🕹️ Casual   | Duel             | 3            |
| 🕹️ Casual   | Arena            | 4            |
| 🧩 Puzzle   | Word             | 4            |
| 🧩 Puzzle   | Memory & Logic   | 4            |
| **Total**   |                  | **75 Games** |

---

## Phase 2: Game Server (Future)

> ⚠️ ยังไม่กำหนดว่าจะทำเมื่อไหร่

- [ ] Colyseus Game Server
- [ ] Supabase Database Integration
- [ ] Supabase Auth (Login System)
- [ ] Matchmaking System
- [ ] Leaderboards
- [ ] Friend System

---

## Tech Stack

| Category  | Technology                   |
| --------- | ---------------------------- |
| Framework | Next.js 15 (App Router)      |
| Language  | TypeScript                   |
| Styling   | Tailwind CSS 4               |
| State     | Zustand + LocalForage        |
| Forms     | react-hook-form + Zod        |
| P2P       | PeerJS                       |
| 3D/Canvas | React Three Fiber            |
| Physics   | Rapier (@react-three/rapier) |
| Icons     | Lucide React                 |
| Theme     | next-themes                  |

---

## File Structure

```
app/
├── layout.tsx              # Root layout with ThemeProvider
├── page.tsx                # Landing page
├── games/
│   ├── page.tsx            # Games list
│   └── [slug]/
│       └── page.tsx        # Game play page
└── room/
    └── [roomId]/
        └── page.tsx        # Room page

src/
├── presentation/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── MainLayout.tsx
│   │   │   ├── Header.tsx
│   │   │   └── Footer.tsx
│   │   ├── ui/
│   │   │   └── ThemeToggle.tsx
│   │   └── games/
│   │       └── GameCanvas.tsx
│   ├── providers/
│   │   └── ThemeProvider.tsx
│   └── stores/
│       └── userStore.ts
├── domain/
│   ├── types/
│   │   ├── user.ts
│   │   └── game.ts
│   └── entities/
└── infrastructure/
    └── p2p/
        └── peerManager.ts
```
