"use client";

import { useEffect, useState } from "react";

type PerformanceLevel = "high" | "medium" | "low";

interface DevicePerformance {
  level: PerformanceLevel;
  supportsWebGL: boolean;
  isMobile: boolean;
  hardwareConcurrency: number;
  deviceMemory: number | null;
  isLowEnd: boolean;
}

/**
 * Hook to detect device performance and WebGL support
 * Used to decide between 3D and 2D rendering
 */
export function useDevicePerformance(): DevicePerformance {
  const [performance, setPerformance] = useState<DevicePerformance>({
    level: "high",
    supportsWebGL: true,
    isMobile: false,
    hardwareConcurrency: 4,
    deviceMemory: null,
    isLowEnd: false,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkPerformance = () => {
      // Check WebGL support
      let supportsWebGL = false;
      try {
        const canvas = document.createElement("canvas");
        supportsWebGL = !!(
          canvas.getContext("webgl") || canvas.getContext("webgl2")
        );
      } catch {
        supportsWebGL = false;
      }

      // Check if mobile
      const isMobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        ) || window.innerWidth < 768;

      // Hardware concurrency (CPU cores)
      const hardwareConcurrency = navigator.hardwareConcurrency || 2;

      // Device memory (GB) - only available in some browsers
      const deviceMemory =
        (navigator as Navigator & { deviceMemory?: number }).deviceMemory ||
        null;

      // Determine performance level
      let level: PerformanceLevel = "high";

      // Low-end indicators
      const isLowCPU = hardwareConcurrency <= 2;
      const isLowMemory = deviceMemory !== null && deviceMemory < 4;
      const isOldMobile =
        isMobile && (isLowCPU || (deviceMemory !== null && deviceMemory < 2));

      if (!supportsWebGL || isOldMobile) {
        level = "low";
      } else if (isLowCPU || isLowMemory || isMobile) {
        level = "medium";
      }

      const isLowEnd = level === "low" || !supportsWebGL;

      setPerformance({
        level,
        supportsWebGL,
        isMobile,
        hardwareConcurrency,
        deviceMemory,
        isLowEnd,
      });

      console.log("[Performance]", {
        level,
        supportsWebGL,
        isMobile,
        hardwareConcurrency,
        deviceMemory,
        isLowEnd,
      });
    };

    checkPerformance();
  }, []);

  return performance;
}

/**
 * Hook to allow user preference for render mode
 */
export function useRenderModePreference() {
  const [preferredMode, setPreferredMode] = useState<"auto" | "3d" | "2d">(
    "auto"
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("render_mode");
    if (saved === "3d" || saved === "2d") {
      setPreferredMode(saved);
    }
  }, []);

  const setMode = (mode: "auto" | "3d" | "2d") => {
    setPreferredMode(mode);
    if (mode === "auto") {
      localStorage.removeItem("render_mode");
    } else {
      localStorage.setItem("render_mode", mode);
    }
  };

  return { preferredMode, setMode };
}
