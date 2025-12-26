"use client";

import { GameBgmStyle, useSound } from "@/src/presentation/stores/soundStore";
import {
  AlertTriangle,
  Beer,
  Castle,
  Compass,
  Music,
  Settings,
  Swords,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const BGM_STYLES: {
  id: GameBgmStyle;
  name: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    id: "tavern",
    name: "โรงเตี๊ยม",
    description: "สบาย ผ่อนคลาย",
    icon: <Beer className="w-5 h-5" />,
  },
  {
    id: "adventure",
    name: "ผจญภัย",
    description: "สนุก ตื่นเต้น",
    icon: <Compass className="w-5 h-5" />,
  },
  {
    id: "battle",
    name: "สู้รบ",
    description: "เร้าใจ ดุเดือด",
    icon: <Swords className="w-5 h-5" />,
  },
  {
    id: "castle",
    name: "ปราสาท",
    description: "สง่างาม หรูหรา",
    icon: <Castle className="w-5 h-5" />,
  },
  {
    id: "tension",
    name: "ลุ้นระทึก",
    description: "ตึงเครียด ลึกลับ",
    icon: <AlertTriangle className="w-5 h-5" />,
  },
];

interface SoundSettingsProps {
  variant?: "button" | "inline";
}

/**
 * Sound Settings Component
 * Toggle button that opens a settings panel
 */
export function SoundSettings({ variant = "button" }: SoundSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const {
    enabled,
    volume,
    bgmVolume,
    bgmPlaying,
    gameBgmStyle,
    toggleSound,
    updateVolume,
    updateBgmVolume,
    startBgm,
    stopBgm,
    setGameBgmStyle,
    playClick,
  } = useSound();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggleSound = () => {
    playClick();
    toggleSound();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateVolume(parseFloat(e.target.value));
  };

  const handleBgmVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateBgmVolume(parseFloat(e.target.value));
  };

  const handleToggleBgm = () => {
    playClick();
    if (bgmPlaying) {
      stopBgm();
    } else {
      startBgm("game");
    }
  };

  const handleStyleChange = (style: GameBgmStyle) => {
    playClick();
    setGameBgmStyle(style);
  };

  if (variant === "inline") {
    return <SettingsPanel />;
  }

  return (
    <>
      {/* Settings Button */}
      <button
        onClick={() => {
          playClick();
          setIsOpen(true);
        }}
        className="p-2 rounded-lg hover:bg-muted-light dark:hover:bg-muted-dark transition-colors"
        title="ตั้งค่าเสียง"
      >
        <Settings className="w-5 h-5" />
      </button>

      {/* Settings Modal - using Portal to escape parent overflow */}
      {mounted &&
        isOpen &&
        createPortal(
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-100 p-4">
            <div className="bg-surface border border-border rounded-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 fade-in duration-200">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-info" />
                  <h2 className="font-semibold text-lg">ตั้งค่าเสียง</h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-muted-light dark:hover:bg-muted-dark transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-5 space-y-6">
                {/* Sound Effects */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {enabled ? (
                        <Volume2 className="w-5 h-5 text-success" />
                      ) : (
                        <VolumeX className="w-5 h-5 text-muted" />
                      )}
                      <span className="font-medium">เสียงเอฟเฟกต์</span>
                    </div>
                    <button
                      onClick={handleToggleSound}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        enabled ? "bg-success" : "bg-muted-light "
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                          enabled ? "left-7" : "left-1"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Volume Slider */}
                  {enabled && (
                    <div className="flex items-center gap-3 pl-7">
                      <VolumeX className="w-4 h-4 text-muted shrink-0" />
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="flex-1 h-2 bg-muted-light  rounded-full appearance-none cursor-pointer accent-info"
                      />
                      <Volume2 className="w-4 h-4 text-muted shrink-0" />
                      <span className="text-sm text-muted w-8">
                        {Math.round(volume * 100)}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="border-t border-border" />

                {/* Background Music */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Music
                        className={`w-5 h-5 ${
                          bgmPlaying ? "text-info" : "text-muted"
                        }`}
                      />
                      <span className="font-medium">เพลงประกอบ</span>
                    </div>
                    <button
                      onClick={handleToggleBgm}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        bgmPlaying ? "bg-info" : "bg-muted-light "
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                          bgmPlaying ? "left-7" : "left-1"
                        }`}
                      />
                    </button>
                  </div>

                  {/* BGM Volume Slider */}
                  {bgmPlaying && (
                    <div className="flex items-center gap-3 pl-7">
                      <VolumeX className="w-4 h-4 text-muted shrink-0" />
                      <input
                        type="range"
                        min="0"
                        max="0.5"
                        step="0.05"
                        value={bgmVolume}
                        onChange={handleBgmVolumeChange}
                        className="flex-1 h-2 bg-muted-light  rounded-full appearance-none cursor-pointer accent-info"
                      />
                      <Volume2 className="w-4 h-4 text-muted shrink-0" />
                      <span className="text-sm text-muted w-8">
                        {Math.round(bgmVolume * 200)}%
                      </span>
                    </div>
                  )}

                  {/* BGM Style Selection */}
                  <div className="space-y-2">
                    <p className="text-sm text-muted pl-7">เลือกสไตล์เพลง</p>
                    <div className="grid grid-cols-2 gap-2">
                      {BGM_STYLES.map((style) => (
                        <button
                          key={style.id}
                          onClick={() => handleStyleChange(style.id)}
                          disabled={!enabled}
                          className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${
                            gameBgmStyle === style.id
                              ? "border-info bg-info/10 text-info"
                              : "border-border hover:border-info/50 hover:bg-muted-light dark:hover:bg-muted-dark"
                          } ${!enabled ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          <span
                            className={
                              gameBgmStyle === style.id
                                ? "text-info"
                                : "text-muted"
                            }
                          >
                            {style.icon}
                          </span>
                          <div className="text-left">
                            <p className="text-sm font-medium">{style.name}</p>
                            <p className="text-xs text-muted">
                              {style.description}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 py-4 border-t border-border bg-muted-light/50 dark:bg-muted-dark/50">
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-info text-white font-medium hover:bg-info-dark transition-colors"
                >
                  เสร็จสิ้น
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );

  function SettingsPanel() {
    return (
      <div className="space-y-4">
        {/* Sound Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {enabled ? (
              <Volume2 className="w-5 h-5 text-success" />
            ) : (
              <VolumeX className="w-5 h-5 text-muted" />
            )}
            <span>เสียง</span>
          </div>
          <button
            onClick={handleToggleSound}
            className={`relative w-10 h-5 rounded-full transition-colors ${
              enabled ? "bg-success" : "bg-muted-light "
            }`}
          >
            <span
              className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                enabled ? "left-5" : "left-0.5"
              }`}
            />
          </button>
        </div>

        {/* BGM Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Music
              className={`w-5 h-5 ${bgmPlaying ? "text-info" : "text-muted"}`}
            />
            <span>BGM</span>
          </div>
          <button
            onClick={handleToggleBgm}
            className={`relative w-10 h-5 rounded-full transition-colors ${
              bgmPlaying ? "bg-info" : "bg-muted-light "
            }`}
          >
            <span
              className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                bgmPlaying ? "left-5" : "left-0.5"
              }`}
            />
          </button>
        </div>
      </div>
    );
  }
}

/**
 * Quick Sound Toggle Button
 * Simple button to toggle sound on/off
 */
export function SoundToggle() {
  const { enabled, toggleSound, playClick } = useSound();

  const handleClick = () => {
    if (enabled) {
      playClick();
    }
    toggleSound();
  };

  return (
    <button
      onClick={handleClick}
      className="p-2 rounded-lg hover:bg-muted-light dark:hover:bg-muted-dark transition-colors"
      title={enabled ? "ปิดเสียง" : "เปิดเสียง"}
    >
      {enabled ? (
        <Volume2 className="w-5 h-5" />
      ) : (
        <VolumeX className="w-5 h-5 text-muted" />
      )}
    </button>
  );
}
