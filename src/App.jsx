/**
 * App.jsx — Điều phối toàn bộ flow + nhạc nền
 */

import React, { useRef, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";

import { useGalaxy } from "./hooks/useGalaxy";
import GalaxyScreen from "./components/GalaxyScreen";
import GalaxyIntro from "./components/GalaxyIntro";
import CollageScreen from "./components/CollageScreen";
import MessagesScreen from "./components/MessagesScreen";

import "./App.css";

export default function App() {
  const [stage, setStage] = useState(0);
  const isHolding = useRef(false);
  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const musicStarted = useRef(false);

  // Khởi tạo audio một lần
  useEffect(() => {
    audioRef.current = new Audio("/bgm.mp3");
    audioRef.current.loop = true;
    audioRef.current.volume = 0.5;
  }, []);

  // Play nhạc lần đầu user chạm — chỉ gọi 1 lần
  function startMusic() {
    if (musicStarted.current) return;
    musicStarted.current = true;
    audioRef.current?.play().catch(() => {});
  }

  const bgActive = stage !== 1;
  useGalaxy(canvasRef, bgActive);

  return (
    <div
      onClick={startMusic}
      style={{
        position: "fixed",
        inset: 0,
        background: "#0a000e",
        overflow: "hidden",
      }}
    >
      {/* Background canvas (nebula + stars + hearts) */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: stage === 1 ? 0 : 1,
          transition: "opacity 0.6s ease",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* STAGE 0: Galaxy Intro */}
      {stage === 0 && (
        <>
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
              <GalaxyIntro
                isHolding={isHolding}
                onComplete={() => setStage(1)}
                stage={stage}
              />
            </Canvas>
          </div>

          <div style={{ position: "absolute", inset: 0, zIndex: 2 }}>
            <GalaxyScreen isHolding={isHolding} onNext={() => setStage(1)} />
          </div>
        </>
      )}

      {/* STAGE 1: CollageScreen */}
      {stage === 1 && (
        <div style={{ position: "absolute", inset: 0, zIndex: 2 }}>
          <CollageScreen onNext={() => setStage(2)} />
        </div>
      )}

      {/* STAGE 2: MessagesScreen */}
      {stage === 2 && (
        <div style={{ position: "absolute", inset: 0, zIndex: 2 }}>
          <MessagesScreen onBack={() => setStage(1)} />
        </div>
      )}
    </div>
  );
}
