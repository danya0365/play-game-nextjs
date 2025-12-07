"use client";

import { Gamepad2, Github, Heart } from "lucide-react";
import Link from "next/link";

/**
 * Footer Component
 * Site footer with links and credits
 */
export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: "เกม",
      links: [
        { href: "/games?category=card_games", label: "เกมไพ่" },
        { href: "/games?category=board_games", label: "บอร์ดเกม" },
        { href: "/games?category=party_games", label: "เกมปาร์ตี้" },
        { href: "/games?category=casual_multiplayer", label: "เกมหลายคน" },
      ],
    },
    {
      title: "เกี่ยวกับ",
      links: [
        { href: "/about", label: "เกี่ยวกับเรา" },
        { href: "/how-to-play", label: "วิธีเล่น" },
        { href: "/contact", label: "ติดต่อ" },
      ],
    },
  ];

  return (
    <footer className="border-t border-border bg-surface">
      <div className="container mx-auto px-4 py-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <Link
              href="/"
              className="flex items-center gap-2 font-bold text-xl mb-4"
            >
              <Gamepad2 className="w-7 h-7 text-info" />
              <span>Play Game</span>
            </Link>
            <p className="text-muted text-sm max-w-md">
              เว็บเกมออนไลน์ P2P เล่นกับเพื่อนได้ทุกที่ทุกเวลา
              ไม่ต้องสมัครสมาชิก ไม่ต้องดาวน์โหลด เล่นได้เลย!
            </p>

            {/* Tech Badge */}
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="px-2 py-1 text-xs rounded-full bg-info/10 text-info">
                PeerJS
              </span>
              <span className="px-2 py-1 text-xs rounded-full bg-success/10 text-success">
                React Three
              </span>
              <span className="px-2 py-1 text-xs rounded-full bg-warning/10 text-warning">
                Rapier Physics
              </span>
            </div>
          </div>

          {/* Links Sections */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold mb-3">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted">
            © {currentYear} Play Game. All rights reserved.
          </p>

          <div className="flex items-center gap-4">
            {/* Made with love */}
            <span className="text-sm text-muted flex items-center gap-1">
              Made with <Heart className="w-4 h-4 text-error fill-error" /> in
              Thailand
            </span>

            {/* GitHub Link */}
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg hover:bg-muted-light dark:hover:bg-muted-dark transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
