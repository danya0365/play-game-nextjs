"use client";

import { AIDifficulty, AI_AVATARS, AI_NAMES } from "@/src/domain/types/ai";
import { useAIStore } from "@/src/presentation/stores/aiStore";
import { Bot, Zap } from "lucide-react";

/**
 * AI Settings Component for Waiting Room
 * Allows host to enable AI and set difficulty
 */
export function AISettings() {
  const { enabled, difficulty, setEnabled, setDifficulty } = useAIStore();

  const difficulties: AIDifficulty[] = ["easy", "medium", "hard"];

  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-info" />
          <span className="font-medium">เล่นกับ AI</span>
        </div>
        <button
          onClick={() => setEnabled(!enabled)}
          className={`relative w-12 h-6 rounded-full transition-colors ${
            enabled ? "bg-info" : "bg-muted-light dark:bg-muted-dark"
          }`}
        >
          <span
            className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
              enabled ? "left-7" : "left-1"
            }`}
          />
        </button>
      </div>

      {enabled && (
        <div className="space-y-3">
          <p className="text-sm text-muted">เลือกระดับความยาก:</p>
          <div className="grid grid-cols-3 gap-2">
            {difficulties.map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all ${
                  difficulty === d
                    ? "border-info bg-info/10"
                    : "border-border hover:border-info/50"
                }`}
              >
                <span className="text-2xl">{AI_AVATARS[d]}</span>
                <span className="text-xs font-medium">{AI_NAMES[d]}</span>
                <DifficultyStars level={d} />
              </button>
            ))}
          </div>

          {/* AI Info */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-info/10 text-info text-sm">
            <Zap className="w-4 h-4 shrink-0" />
            <span>
              {difficulty === "easy" &&
                "AI จะเล่นแบบสุ่ม เหมาะสำหรับผู้เริ่มต้น"}
              {difficulty === "medium" && "AI จะเล่นอย่างมีกลยุทธ์พอประมาณ"}
              {difficulty === "hard" && "AI จะเล่นอย่างฉลาด ท้าทายมาก!"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function DifficultyStars({ level }: { level: AIDifficulty }) {
  const stars = level === "easy" ? 1 : level === "medium" ? 2 : 3;
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3].map((i) => (
        <span
          key={i}
          className={`text-xs ${i <= stars ? "text-warning" : "text-muted/30"}`}
        >
          ★
        </span>
      ))}
    </div>
  );
}

/**
 * Compact AI indicator for game view
 */
export function AIIndicator() {
  const { enabled, aiPlayer } = useAIStore();

  if (!enabled || !aiPlayer) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-info/10 border border-info/30">
      <span className="text-lg">{aiPlayer.avatar}</span>
      <span className="text-sm font-medium text-info">{aiPlayer.nickname}</span>
    </div>
  );
}
