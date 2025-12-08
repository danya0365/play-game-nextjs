# Create Game Template - Clean Architecture Pattern

## Prompt Template for Creating New Games

Use this prompt template to create new games following Clean Architecture, SOLID principles, and the established Game Base architecture.

## Pattern Overview

This template follows the established Game Architecture pattern with:

1. **Game State Types** - Domain types for game state (`src/domain/types/[gameName]State.ts`)
2. **Game AI Logic** - AI calculation function (`src/presentation/components/games/[game-name]/use[GameName]AI.ts`)
3. **Game Hook** - Game-specific logic extending useGameBase (`src/presentation/hooks/use[GameName]Game.ts`)
4. **2D Component** - HTML/CSS fallback rendering (`src/presentation/components/games/[game-name]/[GameName]2D.tsx`)
5. **3D Component** - Three.js rendering (`src/presentation/components/games/[game-name]/[GameName]3D.tsx`)
6. **Game View** - Main view using GameViewBase (`src/presentation/components/games/[game-name]/[GameName]View.tsx`)

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         GameViewBase                                │
│   ┌──────────────────────────────────────────────────────────────┐  │
│   │  Shared: AI Indicator, Turn Indicator, Result Modal, Chat    │  │
│   │  Shared: 2D/3D Toggle, Waiting Overlay, Host Action Bar      │  │
│   └──────────────────────────────────────────────────────────────┘  │
│                    │                         │                      │
│                    ▼                         ▼                      │
│            ┌─────────────┐           ┌─────────────┐                │
│            │  render2D   │           │  render3D   │                │
│            │ (ReactNode) │           │ (ReactNode) │                │
│            └─────────────┘           └─────────────┘                │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Game-Specific Components                         │
│   ┌────────────────┐  ┌────────────────┐  ┌────────────────┐        │
│   │ [GameName]2D   │  │ [GameName]3D   │  │ use[GameName]  │        │
│   │   Component    │  │   Component    │  │    Game Hook   │        │
│   └────────────────┘  └────────────────┘  └────────────────┘        │
│                              │                    │                 │
│                              ▼                    ▼                 │
│                    ┌────────────────┐   ┌────────────────┐          │
│                    │ [GameName]AI   │   │  useGameBase   │          │
│                    │   Function     │   │  (inherited)   │          │
│                    └────────────────┘   └────────────────┘          │
└─────────────────────────────────────────────────────────────────────┘
```

---

## File Structure

```
src/
├── domain/types/
│   └── [gameName]State.ts          # Game state types
│
├── presentation/
│   ├── hooks/
│   │   └── use[GameName]Game.ts    # Game-specific hook
│   │
│   └── components/
│       └── games/
│           └── [game-name]/
│               ├── [GameName]View.tsx   # Main view
│               ├── [GameName]2D.tsx     # 2D rendering
│               ├── [GameName]3D.tsx     # 3D rendering
│               └── use[GameName]AI.ts   # AI logic
```

---

## 1. Pattern: `src/domain/types/[gameName]State.ts`

```typescript
/**
 * [GameName] Game State Types
 */

import type { BaseGameState, GamePlayer } from "./gameState";

// Define game-specific mark/piece type
export type [GameName]Mark = "Player1" | "Player2" | null;

// Extend BaseGameState with game-specific fields
export interface [GameName]State extends BaseGameState {
  board: [GameName]Mark[];  // or [GameName]Mark[][] for 2D boards
  player1: string;          // Player ID
  player2: string;          // Player ID
  winningCells: number[] | null;
  // Add game-specific fields here
}

// Game-specific action
export interface [GameName]Action {
  type: "place_piece" | "move_piece";  // Define your action types
  playerId: string;
  timestamp: number;
  data: {
    // Action-specific data
    cellIndex: number;
    // or fromIndex, toIndex for move actions
  };
}

// Constants
export const BOARD_SIZE = 9;  // Adjust for your game
export const WIN_LENGTH = 3;  // Adjust for your game

/**
 * Create initial game state
 * @param roomId - Room ID
 * @param players - List of players (can include AI player)
 * @param aiPlayer - Optional AI player to add if not enough players
 */
export function create[GameName]State(
  roomId: string,
  players: GamePlayer[],
  aiPlayer?: GamePlayer | null
): [GameName]State {
  // Add AI player if provided and needed
  const allPlayers = aiPlayer && players.length < 2
    ? [...players, aiPlayer]
    : [...players];

  // Ensure minimum players
  if (allPlayers.length < 2) {
    throw new Error("Need at least 2 players to start [GameName]");
  }

  // Randomly assign player roles
  const shuffled = [...allPlayers].sort(() => Math.random() - 0.5);

  return {
    gameId: `[game-prefix]_${Date.now()}`,
    roomId,
    status: "playing",
    currentTurn: shuffled[0].odId,  // First player starts
    turnNumber: 1,
    winner: null,
    players: allPlayers,
    startedAt: Date.now(),
    lastActionAt: Date.now(),
    board: Array(BOARD_SIZE).fill(null),
    player1: shuffled[0].odId,
    player2: shuffled[1].odId,
    winningCells: null,
  };
}

/**
 * Winning combinations (if applicable)
 */
export const WIN_LINES = [
  // Define your winning combinations
  [0, 1, 2],
  [3, 4, 5],
  // ...
];

/**
 * Check for winner
 */
export function check[GameName]Winner(
  board: [GameName]Mark[]
): { winner: [GameName]Mark; line: number[] } | null {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line };
    }
  }
  return null;
}

/**
 * Apply action to state
 */
export function apply[GameName]Action(
  state: [GameName]State,
  action: [GameName]Action
): [GameName]State {
  // Implement your game logic here
  const newBoard = [...state.board];

  // Apply the action
  // newBoard[action.data.cellIndex] = ...

  // Check for winner
  // const winResult = check[GameName]Winner(newBoard);

  // Return new state
  return {
    ...state,
    board: newBoard,
    currentTurn: state.currentTurn === state.player1 ? state.player2 : state.player1,
    turnNumber: state.turnNumber + 1,
    lastActionAt: Date.now(),
    // winner: winResult?.winner === "Player1" ? state.player1 : state.player2,
    // winningCells: winResult?.line ?? null,
    // status: winResult ? "finished" : "playing",
  };
}
```

### Key Features:

- **Extends BaseGameState** for consistent structure
- **AI player support** built-in
- **Type-safe actions** with TypeScript
- **Pure functions** for state transitions

---

## 2. Pattern: `src/presentation/components/games/[game-name]/use[GameName]AI.ts`

```typescript
"use client";

import { AIDifficulty } from "@/src/domain/types/ai";
import type { [GameName]State } from "@/src/domain/types/[gameName]State";

/**
 * Calculate the best move for [GameName] AI
 * @param gameState - Current game state
 * @param difficulty - AI difficulty level
 * @returns The move to make (e.g., cell index)
 */
export function calculate[GameName]AIMove(
  gameState: [GameName]State,
  difficulty: AIDifficulty
): number {
  const { board } = gameState;

  // Get valid moves
  const validMoves = board
    .map((cell, index) => (cell === null ? index : -1))
    .filter((i) => i !== -1);

  if (validMoves.length === 0) return -1;

  switch (difficulty) {
    case "easy":
      return easyMove(validMoves);
    case "medium":
      return mediumMove(board, validMoves, gameState);
    case "hard":
      return hardMove(board, gameState);
    default:
      return easyMove(validMoves);
  }
}

/**
 * Easy AI - Random moves
 */
function easyMove(validMoves: number[]): number {
  return validMoves[Math.floor(Math.random() * validMoves.length)];
}

/**
 * Medium AI - Basic strategy
 */
function mediumMove(
  board: ([GameName]Mark)[],
  validMoves: number[],
  gameState: [GameName]State
): number {
  // 1. Check if AI can win
  const winMove = findWinningMove(board, gameState.currentTurn);
  if (winMove !== -1) return winMove;

  // 2. Block opponent from winning
  const opponentId = gameState.currentTurn === gameState.player1
    ? gameState.player2
    : gameState.player1;
  const blockMove = findWinningMove(board, opponentId);
  if (blockMove !== -1) return blockMove;

  // 3. Take strategic position (e.g., center)
  // Implement game-specific strategy

  // 4. Random fallback
  return easyMove(validMoves);
}

/**
 * Hard AI - Minimax or advanced algorithm
 */
function hardMove(
  board: ([GameName]Mark)[],
  gameState: [GameName]State
): number {
  // Implement minimax, alpha-beta pruning, or game-specific algorithm
  // Example: return minimax(board, gameState, true).move;

  // For now, use medium as fallback
  const validMoves = board
    .map((cell, index) => (cell === null ? index : -1))
    .filter((i) => i !== -1);
  return mediumMove(board, validMoves, gameState);
}

/**
 * Find a winning move for the given player
 */
function findWinningMove(
  board: ([GameName]Mark)[],
  playerId: string
): number {
  // Implement logic to find a move that wins
  // Return -1 if no winning move found
  return -1;
}

/**
 * Optional: Minimax algorithm for hard difficulty
 */
function minimax(
  board: ([GameName]Mark)[],
  gameState: [GameName]State,
  isMaximizing: boolean,
  depth: number = 0
): { score: number; move: number } {
  // Implement minimax with alpha-beta pruning
  return { score: 0, move: -1 };
}
```

### Key Features:

- **Three difficulty levels** with different strategies
- **Pure function** - no side effects
- **Game-agnostic interface** - receives state, returns move
- **Extensible** - easy to add more algorithms

---

## 3. Pattern: `src/presentation/hooks/use[GameName]Game.ts`

```typescript
"use client";

import type { [GameName]State } from "@/src/domain/types/[gameName]State";
import { calculate[GameName]AIMove } from "@/src/presentation/components/games/[game-name]/use[GameName]AI";
import { useAIPlayer } from "@/src/presentation/hooks/useAIPlayer";
import { useAIStore } from "@/src/presentation/stores/aiStore";
import { useGameStore } from "@/src/presentation/stores/gameStore";
import { useSound } from "@/src/presentation/stores/soundStore";
import { useCallback } from "react";
import { useGameBase } from "./useGameBase";

/**
 * Custom hook for [GameName] game logic
 * Extends useGameBase with [GameName]-specific logic
 * Includes AI player support
 */
export function use[GameName]Game() {
  // Base game logic
  const base = useGameBase();
  const { gameState, user, isMyTurn, isPlaying } = base;

  // AI Store
  const { enabled: isAIEnabled, aiPlayer } = useAIStore();

  // Game-specific store actions
  const { placeMark } = useGameStore();  // or your action name
  const { playPlaceMark } = useSound();  // or your sound effect

  // Game-specific: determine player role
  const myRole = (gameState as [GameName]State)?.player1 === user?.id
    ? "Player1"
    : "Player2";
  const aiRole = myRole === "Player1" ? "Player2" : "Player1";

  // Check if it's AI's turn
  const isAITurn =
    isAIEnabled &&
    isPlaying &&
    aiPlayer !== null &&
    gameState?.currentTurn === aiPlayer?.id;

  // AI Player hook
  const { isAITurn: isAIMoving } = useAIPlayer<[GameName]State, number>({
    gameState: gameState as [GameName]State | null,
    isAITurn,
    isPlaying,
    calculateAIMove: calculate[GameName]AIMove,
    executeMove: (move: number) => {
      if (move >= 0 && aiPlayer) {
        playPlaceMark();
        placeMark(move, aiPlayer.id);  // Pass AI player ID
      }
    },
    moveDelay: 600,  // Adjust for your game
    // IMPORTANT: Provide fresh state getter to avoid stale closures
    getLatestState: () => useGameStore.getState().gameState as [GameName]State | null,
  });

  // Game-specific: cell/move handler
  const handleMove = useCallback(
    (index: number) => {
      if (!isMyTurn || !isPlaying || isAIMoving) return;
      playPlaceMark();
      placeMark(index);
    },
    [isMyTurn, isPlaying, isAIMoving, playPlaceMark, placeMark]
  );

  // Game-specific result info
  const getResultInfo = useCallback(() => {
    const baseResult = base.getBaseResultInfo();
    if (!baseResult) return null;
    return baseResult;
  }, [base]);

  // Cast gameState to specific type
  const typedGameState = gameState as [GameName]State | null;

  return {
    // Base game state & actions
    ...base,

    // Game-specific state
    myRole,
    aiRole,
    board: typedGameState?.board ?? [],
    winningCells: typedGameState?.winningCells ?? null,

    // AI state
    isAIEnabled,
    aiPlayer,
    isAITurn: isAIMoving,

    // Game-specific actions
    handleMove,
    getResultInfo,
  };
}
```

### Key Features:

- **Extends useGameBase** for common logic
- **AI integration** built-in
- **Type-safe** with game-specific state
- **Sound effects** support

---

## 4. Pattern: `src/presentation/components/games/[game-name]/[GameName]2D.tsx`

```typescript
"use client";

import type { [GameName]Mark } from "@/src/domain/types/[gameName]State";

interface [GameName]2DProps {
  board: [GameName]Mark[];
  winningCells: number[] | null;
  isMyTurn: boolean;
  onCellClick: (index: number) => void;
}

/**
 * 2D HTML/CSS rendering of [GameName] board
 * Used as fallback for low-performance devices
 */
export function [GameName]2D({
  board,
  winningCells,
  isMyTurn,
  onCellClick,
}: [GameName]2DProps) {
  const isWinningCell = (index: number) => winningCells?.includes(index) ?? false;

  return (
    <div className="h-full flex items-center justify-center p-4">
      <div
        className="grid gap-2"
        style={{
          gridTemplateColumns: "repeat(3, 1fr)",  // Adjust for your game
          maxWidth: "400px",
          aspectRatio: "1",
        }}
      >
        {board.map((cell, index) => (
          <Cell
            key={index}
            value={cell}
            isWinning={isWinningCell(index)}
            isClickable={isMyTurn && cell === null}
            onClick={() => onCellClick(index)}
          />
        ))}
      </div>
    </div>
  );
}

interface CellProps {
  value: [GameName]Mark;
  isWinning: boolean;
  isClickable: boolean;
  onClick: () => void;
}

function Cell({ value, isWinning, isClickable, onClick }: CellProps) {
  return (
    <button
      onClick={onClick}
      disabled={!isClickable}
      className={`
        aspect-square rounded-xl text-4xl font-bold
        flex items-center justify-center
        transition-all duration-200
        ${isWinning
          ? "bg-success/20 border-2 border-success"
          : "bg-surface border-2 border-border"
        }
        ${isClickable
          ? "hover:bg-info/10 hover:border-info cursor-pointer"
          : "cursor-default"
        }
      `}
    >
      {value && <Mark type={value} />}
    </button>
  );
}

interface MarkProps {
  type: [GameName]Mark;
}

function Mark({ type }: MarkProps) {
  if (type === "Player1") {
    return <span className="text-error">X</span>;  // Customize for your game
  }
  if (type === "Player2") {
    return <span className="text-info">O</span>;  // Customize for your game
  }
  return null;
}
```

### Key Features:

- **Pure presentational component** - no logic
- **Mobile responsive** with Tailwind CSS
- **Accessible** with proper button elements
- **Winning highlight** animation

---

## 5. Pattern: `src/presentation/components/games/[game-name]/[GameName]3D.tsx`

```typescript
"use client";

import type { [GameName]Mark } from "@/src/domain/types/[gameName]State";
import { useRef, useState } from "react";
import { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";

interface [GameName]3DProps {
  board: [GameName]Mark[];
  winningCells: number[] | null;
  isMyTurn: boolean;
  onCellClick: (index: number) => void;
}

/**
 * 3D Three.js rendering of [GameName] board
 * Uses React Three Fiber for WebGL rendering
 */
export function [GameName]3D({
  board,
  winningCells,
  isMyTurn,
  onCellClick,
}: [GameName]3DProps) {
  const isWinningCell = (index: number) => winningCells?.includes(index) ?? false;

  // Calculate cell positions (adjust for your game)
  const getCellPosition = (index: number): [number, number, number] => {
    const row = Math.floor(index / 3);
    const col = index % 3;
    return [col * 2 - 2, 0, row * 2 - 2];
  };

  return (
    <group>
      {/* Board base */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <boxGeometry args={[7, 7, 0.2]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>

      {/* Grid lines */}
      <GridLines />

      {/* Cells */}
      {board.map((cell, index) => (
        <Cell3D
          key={index}
          position={getCellPosition(index)}
          value={cell}
          isWinning={isWinningCell(index)}
          isClickable={isMyTurn && cell === null}
          onClick={() => onCellClick(index)}
        />
      ))}
    </group>
  );
}

interface Cell3DProps {
  position: [number, number, number];
  value: [GameName]Mark;
  isWinning: boolean;
  isClickable: boolean;
  onClick: () => void;
}

function Cell3D({ position, value, isWinning, isClickable, onClick }: Cell3DProps) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (isClickable) onClick();
  };

  return (
    <group position={position}>
      {/* Cell base */}
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={() => isClickable && setHovered(true)}
        onPointerOut={() => setHovered(false)}
        position={[0, 0.05, 0]}
      >
        <boxGeometry args={[1.8, 0.1, 1.8]} />
        <meshStandardMaterial
          color={isWinning ? "#22c55e" : hovered ? "#3b82f6" : "#2a2a4a"}
          emissive={isWinning ? "#22c55e" : hovered ? "#3b82f6" : "#000000"}
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Render piece if exists */}
      {value && <Piece3D type={value} isWinning={isWinning} />}
    </group>
  );
}

interface Piece3DProps {
  type: [GameName]Mark;
  isWinning: boolean;
}

function Piece3D({ type, isWinning }: Piece3DProps) {
  // Customize for your game pieces
  if (type === "Player1") {
    return (
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[1, 0.4, 0.2]} />
        <meshStandardMaterial
          color="#ef4444"
          emissive={isWinning ? "#ef4444" : "#000000"}
          emissiveIntensity={isWinning ? 0.5 : 0}
        />
      </mesh>
    );
  }

  if (type === "Player2") {
    return (
      <mesh position={[0, 0.3, 0]}>
        <torusGeometry args={[0.4, 0.15, 16, 32]} />
        <meshStandardMaterial
          color="#3b82f6"
          emissive={isWinning ? "#3b82f6" : "#000000"}
          emissiveIntensity={isWinning ? 0.5 : 0}
        />
      </mesh>
    );
  }

  return null;
}

function GridLines() {
  return (
    <group position={[0, 0.01, 0]}>
      {/* Customize grid lines for your game */}
    </group>
  );
}
```

### Key Features:

- **React Three Fiber** for 3D rendering
- **Interactive** with hover and click states
- **Winning animation** with emissive materials
- **Performance optimized** with proper Three.js patterns

---

## 6. Pattern: `src/presentation/components/games/[game-name]/[GameName]View.tsx`

```typescript
"use client";

import { GameViewBase } from "@/src/presentation/components/game/GameViewBase";
import { GameLayout } from "@/src/presentation/components/game/GameLayout";
import { use[GameName]Game } from "@/src/presentation/hooks/use[GameName]Game";
import { [GameName]2D } from "./[GameName]2D";
import { [GameName]3D } from "./[GameName]3D";

/**
 * [GameName] Game View
 * Uses GameViewBase for common UI, only provides game-specific rendering
 */
export function [GameName]View() {
  // Game logic hook
  const game = use[GameName]Game();

  const {
    room,
    gameState,
    isHost,
    isPlaying,
    isFinished,
    isMyTurn,
    myRole,
    currentTurnPlayer,
    showResult,
    playerScores,
    board,
    winningCells,
    handleMove,
    handleRestart,
    handleLeave,
    handleCloseResult,
    handleShowResult,
    getResultInfo,
  } = game;

  // Loading state
  if (!room || !gameState) {
    return (
      <GameLayout gameName="[GameThaiName]" onLeave={handleLeave}>
        <div className="h-full flex items-center justify-center">
          <p className="text-muted">กำลังโหลดเกม...</p>
        </div>
      </GameLayout>
    );
  }

  return (
    <GameViewBase
      // Game info
      gameName="[GameThaiName]"
      roomCode={room.code}
      // Players
      players={playerScores}
      currentTurnPlayer={currentTurnPlayer}
      isHost={isHost}
      // Game state
      isMyTurn={isMyTurn}
      isPlaying={isPlaying}
      isFinished={isFinished}
      showResult={showResult}
      turnNumber={gameState.turnNumber}
      // Player symbol/role
      mySymbol={myRole}
      symbolColor={myRole === "Player1" ? "error" : "info"}
      // Result
      result={getResultInfo()}
      // Actions
      onRestart={handleRestart}
      onLeave={handleLeave}
      onCloseResult={handleCloseResult}
      onShowResult={handleShowResult}
      // Camera settings (adjust for your game)
      cameraPosition={[0, 8, 8]}
      mobileCameraPosition={[0, 12, 10]}
      cameraFov={45}
      mobileCameraFov={55}
      backgroundColor="#0f0f1a"
      // Render 2D board
      render2D={
        <[GameName]2D
          board={board}
          winningCells={winningCells}
          isMyTurn={isMyTurn && isPlaying}
          onCellClick={handleMove}
        />
      }
      // Render 3D board
      render3D={
        <[GameName]3D
          board={board}
          winningCells={winningCells}
          isMyTurn={isMyTurn && isPlaying}
          onCellClick={handleMove}
        />
      }
    />
  );
}
```

### Key Features:

- **Minimal code** - uses GameViewBase for all common UI
- **Clean separation** - only game-specific rendering
- **2D/3D support** built-in
- **AI support** inherited from base

---

## 7. Checklist: Creating a New Game

### Required Files:

- [ ] `src/domain/types/[gameName]State.ts` - Game state types
- [ ] `src/presentation/components/games/[game-name]/use[GameName]AI.ts` - AI logic
- [ ] `src/presentation/hooks/use[GameName]Game.ts` - Game hook
- [ ] `src/presentation/components/games/[game-name]/[GameName]2D.tsx` - 2D component
- [ ] `src/presentation/components/games/[game-name]/[GameName]3D.tsx` - 3D component
- [ ] `src/presentation/components/games/[game-name]/[GameName]View.tsx` - Main view

### Optional Files:

- [ ] `src/presentation/components/games/[game-name]/index.ts` - Exports

### Updates Required:

- [ ] Add game to game list in `/src/domain/types/game.ts`
- [ ] Update `gameStore.ts` to support new game type (if using different actions)
- [ ] Add game page route in `app/play/` if needed

---

## 8. Example: Variable Replacements

| Variable         | Example Value     |
| ---------------- | ----------------- |
| `[GameName]`     | `ConnectFour`     |
| `[game-name]`    | `connect-four`    |
| `[gameName]`     | `connectFour`     |
| `[GameThaiName]` | `เรียง 4`         |
| `[game-prefix]`  | `cf`              |
| `[GameName]Mark` | `ConnectFourMark` |

---

## 9. AI Integration Summary

The AI system is designed to be game-agnostic:

| Component                     | Purpose                       | Reusable    |
| ----------------------------- | ----------------------------- | ----------- |
| `domain/types/ai.ts`          | AI types & constants          | ✅ 100%     |
| `stores/aiStore.ts`           | AI settings state             | ✅ 100%     |
| `hooks/useAIPlayer.ts`        | AI turn detection & execution | ✅ 100%     |
| `game/AISettings.tsx`         | AI settings UI                | ✅ 100%     |
| `games/[game]/use[Game]AI.ts` | Game-specific AI logic        | ❌ Per-game |

### To add AI to a new game:

1. Create `use[GameName]AI.ts` with `calculate[GameName]AIMove` function
2. Use `useAIPlayer` hook in your game hook
3. Pass AI player ID when executing moves: `action(move, aiPlayer.id)`

---

## 10. Testing Checklist

- [ ] Game loads correctly
- [ ] 2D rendering works
- [ ] 3D rendering works
- [ ] 2D/3D toggle works
- [ ] Player can make moves
- [ ] Turn switches correctly
- [ ] Win detection works
- [ ] Draw detection works
- [ ] Result modal shows correctly
- [ ] Restart game works
- [ ] AI Easy mode works
- [ ] AI Medium mode works
- [ ] AI Hard mode works
- [ ] AI moves are executed correctly
- [ ] Sound effects play
- [ ] Mobile responsive
- [ ] Connection status indicator shows
- [ ] Reconnecting overlay shows when host disconnects
- [ ] Player ping/latency displays correctly

---

## 11. Connection Status System

The connection system provides ping-pong heartbeat for connection monitoring:

| Component                 | Purpose                     | Location           |
| ------------------------- | --------------------------- | ------------------ |
| `connectionStore.ts`      | Connection state management | `stores/`          |
| `useConnectionStatus.ts`  | Connection hook             | `hooks/`           |
| `ConnectionStatus.tsx`    | UI indicator                | `components/game/` |
| `ReconnectingOverlay.tsx` | Disconnect overlay          | `components/game/` |

### Features:

- **Host pings clients** every 1 second
- **Clients respond with pong** automatically
- **Latency tracking** for each player
- **Connection quality** indicators (excellent/good/poor/disconnected)
- **Auto-leave** after 10 seconds of no response

### Already integrated in:

- `GameViewBase` - Shows connection indicator during game
- `RoomLobby` - Shows connection indicator in waiting room
- `PlayerCard` - Shows per-player connection quality

---

## Summary

This pattern provides a complete, reusable architecture for creating new games with:

- ✅ **Clean Architecture** - Domain types separate from presentation
- ✅ **SOLID Principles** - Single responsibility, Open for extension
- ✅ **AI Support** - Built-in with 3 difficulty levels
- ✅ **2D/3D Rendering** - Automatic fallback for low-end devices
- ✅ **Mobile Responsive** - Works on all screen sizes
- ✅ **Type Safety** - Full TypeScript support
- ✅ **Sound Effects** - Integrated sound system
- ✅ **Multiplayer Ready** - P2P architecture support
- ✅ **Connection Monitoring** - Ping-pong heartbeat with auto-reconnect
