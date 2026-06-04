/**
 * App.jsx — Điều phối toàn bộ flow của app
 *
 * FLOW CÁC STAGE:
 *   stage 0 → GalaxyScreen   : Màn hình chào "Chạm để tiếp tục"
 *             GalaxyIntro (3D): Giữ nút → hạt bụi tụ thành chữ "Chúc Mừng"
 *   stage 1 → CollageScreen   : Quả cầu ảnh 3D xoay, nút "Đọc thư"
 *   stage 2 → MessagesScreen  : Lá thư tình
 *
 * Background canvas (useGalaxy) chạy xuyên suốt tất cả stage.
 */

import React, { useRef, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Stars, OrbitControls } from "@react-three/drei";

import { useGalaxy } from "./hooks/useGalaxy";
import GalaxyScreen from "./components/GalaxyScreen";
import GalaxyIntro from "./components/GalaxyIntro";
import CollageScreen from "./components/CollageScreen";
import MessagesScreen from "./components/MessagesScreen";

import "./App.css";

export default function App() {
  // stage 0 = intro galaxy, stage 1 = collage sphere, stage 2 = letter
  const [stage, setStage] = useState(0);

  // Ref dùng cho nút "giữ để bắt đầu" trong GalaxyIntro
  const isHolding = useRef(false);

  // Canvas background ref cho useGalaxy hook
  const canvasRef = useRef(null);

  // Background galaxy canvas active khi stage === 0 hoặc stage === 2
  // (CollageScreen dùng Three.js Canvas riêng nên không cần nebula)
  const bgActive = stage !== 1;
  useGalaxy(canvasRef, bgActive);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#0a000e",
        overflow: "hidden",
      }}
    >
      {/* ── Background canvas (nebula + stars + hearts) ── */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          // Ẩn khi ở stage 1 vì Three.js Canvas che phủ hoàn toàn
          opacity: stage === 1 ? 0 : 1,
          transition: "opacity 0.6s ease",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* ── STAGE 0: Galaxy Intro ── */}
      {stage === 0 && (
        <>
          {/* Three.js canvas chỉ cho particle galaxy + text */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 1,
              pointerEvents: "none",
            }}
          >
            <Canvas
              camera={{ position: [0, 0, 14], fov: 60 }}
              gl={{ antialias: true, alpha: true }}
              style={{ background: "transparent" }}
            >
              <Stars
                radius={60}
                depth={40}
                count={2000}
                factor={2}
                saturation={0.2}
                fade
                speed={0.3}
              />
              <ambientLight intensity={0.5} color="#ff1a75" />
              {/* GalaxyIntro: hạt bụi tụ thành chữ khi giữ nút */}
              <GalaxyIntro
                isHolding={isHolding}
                onComplete={() => setStage(1)}
                stage={stage}
              />
            </Canvas>
          </div>

          {/* GalaxyScreen: UI overlay (badge, quote, nút giữ) */}
          <div style={{ position: "absolute", inset: 0, zIndex: 2 }}>
            <GalaxyScreen isHolding={isHolding} onNext={() => setStage(1)} />
          </div>
        </>
      )}

      {/* ── STAGE 1: CollageScreen (quả cầu ảnh 3D) ── */}
      {stage === 1 && (
        <div style={{ position: "absolute", inset: 0, zIndex: 2 }}>
          <CollageScreen onNext={() => setStage(2)} />
        </div>
      )}

      {/* ── STAGE 2: MessagesScreen (lá thư) ── */}
      {stage === 2 && (
        <div style={{ position: "absolute", inset: 0, zIndex: 2 }}>
          <MessagesScreen onBack={() => setStage(1)} />
        </div>
      )}
    </div>
  );
}
