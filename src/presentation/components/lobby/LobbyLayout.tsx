"use client";

import { SoundSettings } from "@/src/presentation/components/ui/SoundSettings";
import { ThemeToggle } from "@/src/presentation/components/ui/ThemeToggle";
import { ArrowLeft, Gamepad2 } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";

interface LobbyLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  backHref?: string;
  onBack?: () => void;
}

/**
 * Lobby Layout - Full screen layout without scroll
 * Used for game lobby and room screens
 */
export function LobbyLayout({
  children,
  title,
  subtitle,
  showBack = true,
  backHref = "/games",
  onBack,
}: LobbyLayoutProps) {
  return (
    <div className="fixed inset-0 flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <header className="shrink-0 h-12 sm:h-14 border-b border-border bg-surface flex items-center px-3 sm:px-4 gap-2 sm:gap-4">
        {/* Back Button */}
        {showBack &&
          (onBack ? (
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-muted hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">กลับ</span>
            </button>
          ) : (
            <Link
              href={backHref}
              className="flex items-center gap-2 text-muted hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">กลับ</span>
            </Link>
          ))}

        {/* Title */}
        <div className="flex-1 min-w-0">
          {title && <h1 className="font-semibold truncate">{title}</h1>}
          {subtitle && (
            <p className="text-xs text-muted truncate">{subtitle}</p>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          <SoundSettings />
          <ThemeToggle />
          <Link
            href="/"
            className="flex items-center gap-1.5 text-muted hover:text-foreground transition-colors"
          >
            <Gamepad2 className="w-5 h-5" />
            <span className="hidden sm:inline text-sm font-medium">
              Play Game
            </span>
          </Link>
        </div>
      </header>

      {/* Content - fills remaining space */}
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
