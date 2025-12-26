"use client";

import { ThemeToggle } from "@/src/presentation/components/ui/ThemeToggle";
import { useUserStore } from "@/src/presentation/stores/userStore";
import { Gamepad2, Menu, User, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

/**
 * Header Component
 * Navigation header with logo, menu, theme toggle, and user info
 */
export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isHydrated } = useUserStore();

  const navLinks = [
    { href: "/", label: "หน้าแรก" },
    { href: "/games", label: "เกมทั้งหมด" },
    { href: "/how-to-play", label: "วิธีเล่น" },
    { href: "/about", label: "เกี่ยวกับ" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-xl hover:opacity-80 transition-opacity"
          >
            <Gamepad2 className="w-7 h-7 text-info" />
            <span className="hidden sm:inline">Play Game</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-muted hover:text-foreground transition-colors font-medium"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* User Info */}
            {isHydrated && user ? (
              <Link
                href="/profile"
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-border hover:border-info transition-colors cursor-pointer"
              >
                <span className="text-lg">{user.avatar}</span>
                <span className="text-sm font-medium">{user.nickname}</span>
              </Link>
            ) : isHydrated ? (
              <Link
                href="/setup"
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-info text-white hover:bg-info-dark transition-colors text-sm font-medium"
              >
                <User className="w-4 h-4" />
                <span>สร้างโปรไฟล์</span>
              </Link>
            ) : null}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-muted-light dark:hover:bg-muted-dark md:hidden transition-colors"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border py-4">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-2 rounded-lg text-muted hover:text-foreground hover:bg-muted-light dark:hover:bg-muted-dark transition-colors font-medium"
                >
                  {link.label}
                </Link>
              ))}

              {/* Mobile User Info */}
              {isHydrated && user ? (
                <Link
                  href="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 mt-2 border-t border-border hover:bg-muted-light dark:hover:bg-muted-dark transition-colors"
                >
                  <span className="text-lg">{user.avatar}</span>
                  <span className="text-sm font-medium">{user.nickname}</span>
                </Link>
              ) : isHydrated ? (
                <Link
                  href="/setup"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 mt-2 text-info font-medium"
                >
                  <User className="w-4 h-4" />
                  <span>สร้างโปรไฟล์</span>
                </Link>
              ) : null}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
