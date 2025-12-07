"use client";

import { Footer } from "./Footer";
import { Header } from "./Header";

interface MainLayoutProps {
  children: React.ReactNode;
  /**
   * Whether to show the footer
   * @default true
   */
  showFooter?: boolean;
  /**
   * Whether to show the header
   * @default true
   */
  showHeader?: boolean;
  /**
   * Additional class names for the main content area
   */
  className?: string;
}

/**
 * Main Layout Component
 * Wraps pages with Header and Footer
 */
export function MainLayout({
  children,
  showFooter = true,
  showHeader = true,
  className = "",
}: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {showHeader && <Header />}

      <main className={`flex-1 ${className}`}>{children}</main>

      {showFooter && <Footer />}
    </div>
  );
}
