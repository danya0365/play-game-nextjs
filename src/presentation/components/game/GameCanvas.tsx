"use client";

import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { AlertTriangle, Loader2, RefreshCw } from "lucide-react";
import React, {
  Component,
  ErrorInfo,
  ReactNode,
  Suspense,
  useEffect,
  useState,
} from "react";

interface GameCanvasProps {
  children: ReactNode;
  enableOrbit?: boolean;
  enablePhysics?: boolean;
  cameraPosition?: [number, number, number];
  mobileCameraPosition?: [number, number, number];
  cameraFov?: number;
  mobileCameraFov?: number;
  backgroundColor?: string;
  className?: string;
}

/**
 * Error Boundary for Canvas
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class CanvasErrorBoundary extends Component<
  { children: ReactNode; onReset: () => void },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode; onReset: () => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Canvas Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background gap-4 p-4">
          <AlertTriangle className="w-12 h-12 text-warning" />
          <h3 className="font-semibold">เกิดข้อผิดพลาดในการแสดงผล 3D</h3>
          <p className="text-sm text-muted text-center max-w-sm">
            กรุณาลองรีเฟรชหน้าเว็บ หรือปิด tab อื่นที่ใช้ WebGL
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false });
              this.props.onReset();
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-info text-white hover:bg-info-dark transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            ลองใหม่
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Loading fallback for canvas
 */
function CanvasLoader() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 text-info animate-spin" />
        <span className="text-sm text-muted">กำลังโหลดเกม...</span>
      </div>
    </div>
  );
}

/**
 * Base Game Canvas Component
 * Wrapper for React Three Fiber with common settings
 */
export function GameCanvas({
  children,
  enableOrbit = false,
  enablePhysics = false,
  cameraPosition = [0, 5, 10],
  mobileCameraPosition,
  cameraFov = 50,
  mobileCameraFov,
  backgroundColor = "transparent",
  className = "",
}: GameCanvasProps) {
  const [mounted, setMounted] = useState(false);
  const [key, setKey] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Wait for client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Responsive camera settings
  const finalCameraPosition =
    isMobile && mobileCameraPosition ? mobileCameraPosition : cameraPosition;
  const finalCameraFov =
    isMobile && mobileCameraFov ? mobileCameraFov : cameraFov;

  const handleReset = () => {
    setKey((k: number) => k + 1);
  };

  if (!mounted) {
    return <CanvasLoader />;
  }

  return (
    <div
      className={`absolute inset-0 ${className}`}
      style={{ background: backgroundColor }}
    >
      <CanvasErrorBoundary onReset={handleReset}>
        <Suspense fallback={<CanvasLoader />}>
          <Canvas
            key={key}
            shadows
            dpr={[1, 1.5]}
            gl={{
              antialias: true,
              alpha: true,
              powerPreference: "default",
              failIfMajorPerformanceCaveat: false,
            }}
            onCreated={({ gl }) => {
              console.log("[GameCanvas] Canvas created");
              gl.domElement.addEventListener("webglcontextlost", (e) => {
                e.preventDefault();
                console.warn("[GameCanvas] WebGL context lost");
              });
              gl.domElement.addEventListener("webglcontextrestored", () => {
                console.log("[GameCanvas] WebGL context restored");
                handleReset();
              });
            }}
          >
            {/* Camera - responsive for mobile */}
            <PerspectiveCamera
              makeDefault
              position={finalCameraPosition}
              fov={finalCameraFov}
            />

            {/* Orbit Controls - touch enabled for mobile */}
            {enableOrbit && (
              <OrbitControls
                enablePan={false}
                enableZoom={true}
                enableRotate={true}
                minDistance={isMobile ? 6 : 3}
                maxDistance={isMobile ? 20 : 15}
                maxPolarAngle={Math.PI / 2.2}
                touches={{
                  ONE: 1, // TOUCH.ROTATE
                  TWO: 2, // TOUCH.DOLLY_PAN
                }}
                rotateSpeed={isMobile ? 0.5 : 1}
                zoomSpeed={isMobile ? 0.5 : 1}
              />
            )}

            {/* Lighting - simplified */}
            <ambientLight intensity={0.8} />
            <directionalLight
              position={[5, 10, 5]}
              intensity={1.2}
              castShadow
            />

            {/* Background color */}
            <color attach="background" args={[backgroundColor]} />

            {/* Physics wrapper or direct children */}
            {enablePhysics ? (
              <Physics gravity={[0, -9.81, 0]} debug={false}>
                {children}
              </Physics>
            ) : (
              children
            )}
          </Canvas>
        </Suspense>
      </CanvasErrorBoundary>
    </div>
  );
}

/**
 * Game Board Base - A simple plane for board games
 */
export function GameBoard({
  size = 6,
  color = "#1a1a2e",
  ...props
}: {
  size?: number;
  color?: string;
} & React.ComponentProps<"mesh">) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow {...props}>
      <planeGeometry args={[size, size]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}
