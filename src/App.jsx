import React, { useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGalaxy } from "./hooks/useGalaxy";
import GalaxyScreen from "./components/GalaxyScreen";
import CollageScreen from "./components/CollageScreen";
import MessagesScreen from "./components/MessagesScreen";

const variants = {
  0: {
    initial: { opacity: 0, scale: 1.04 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.96, filter: "blur(3px)" },
  },
  1: {
    initial: { opacity: 0, y: 30, scale: 1.02 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -20, filter: "blur(5px)" },
  },
  2: {
    initial: { opacity: 0, scale: 0.94, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 1.04 },
  },
};

export default function App() {
  const [step, setStep] = useState(0); // ← PHẢI LÀ 0
  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const audioStartedRef = useRef(false);

  useGalaxy(canvasRef, true);

  const goTo = useCallback((nextStep) => {
    if (!audioStartedRef.current && audioRef.current) {
      audioStartedRef.current = true;
      audioRef.current.volume = 0;
      audioRef.current.play().catch(() => {});
      let vol = 0;
      const fade = setInterval(() => {
        vol = Math.min(0.55, vol + 0.02);
        if (audioRef.current) audioRef.current.volume = vol;
        if (vol >= 0.55) clearInterval(fade);
      }, 80);
    }
    setStep(nextStep);
  }, []);

  const v = variants[step] || variants[0];

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: "#0a000e",
      }}
    >
      <audio ref={audioRef} src="/bgm.mp3" loop preload="none" />
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(8,0,12,0.55) 100%)",
        }}
      />
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={v.initial}
          animate={v.animate}
          exit={v.exit}
          transition={{ duration: 0.75, ease: [0.4, 0, 0.2, 1] }}
          style={{ position: "absolute", inset: 0, zIndex: 10 }}
        >
          {step === 0 && <GalaxyScreen onNext={() => goTo(1)} />}
          {step === 1 && <CollageScreen onNext={() => goTo(2)} />}
          {step === 2 && <MessagesScreen onBack={() => goTo(1)} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
