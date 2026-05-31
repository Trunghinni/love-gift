import React, { useState, useRef, Suspense, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Image as ThreeImage,
  OrbitControls,
  Environment,
} from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

// --- COMPONENT 1: BẦU TRỜI SAO LẤP LÁNH ---
const ParticleBackground = () => {
  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine);
  }, []);

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        background: { color: { value: "#000000" } },
        fpsLimit: 60,
        particles: {
          color: { value: ["#ffb6c1", "#ff69b4", "#ffffff"] },
          links: { enable: false },
          move: { enable: true, speed: 0.5, direction: "none", random: true },
          number: { value: 150 },
          opacity: {
            value: { min: 0.1, max: 0.8 },
            animation: { enable: true, speed: 1 },
          },
          size: { value: { min: 1, max: 3 } },
        },
        detectRetina: true,
      }}
      className="absolute inset-0 z-0"
    />
  );
};

// --- COMPONENT 2: VÒNG TRÒN ẢNH 3D ---
const Gallery3D = ({ setStep }) => {
  // Thay đổi mảng này tương ứng với số ảnh bạn có trong folder public/images
  const images = Array.from({ length: 10 }, (_, i) => `/images/${i + 1}.jpg`);
  const radius = 4; // Bán kính vòng tròn

  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 60 }}
      className="w-full h-full z-10 cursor-grab"
    >
      <ambientLight intensity={0.5} />
      <Suspense fallback={null}>
        <group position={[0, -0.5, 0]}>
          {images.map((url, i) => {
            const angle = (i / images.length) * Math.PI * 2;
            const x = Math.sin(angle) * radius;
            const z = Math.cos(angle) * radius;
            return (
              <ThreeImage
                key={i}
                url={url}
                position={[x, 0, z]}
                rotation={[0, angle, 0]}
                scale={[2, 2.5]} // Tỉ lệ khung ảnh
              />
            );
          })}
        </group>
        <Environment preset="city" />
      </Suspense>
      {/* Tự động xoay không gian 3D */}
      <OrbitControls autoRotate autoRotateSpeed={1.5} enableZoom={true} />
    </Canvas>
  );
};

// --- COMPONENT CHÍNH: APP ---
export default function App() {
  const [step, setStep] = useState(0);
  const audioRef = useRef(null);

  const handleStart = () => {
    // Phát nhạc
    if (audioRef.current) {
      audioRef.current.play();
    }
    setStep(1); // Chuyển sang hiện chữ

    // Đếm ngược 4s chuyển sang thư viện ảnh
    setTimeout(() => setStep(2), 4000);
  };

  return (
    <div className="relative w-screen h-screen text-white overflow-hidden bg-black font-serif">
      <audio ref={audioRef} src="/bgm.mp3" loop />

      {/* Bầu trời sao luôn chạy làm nền */}
      <ParticleBackground />

      <AnimatePresence mode="wait">
        {/* BƯỚC 0: MÀN HÌNH CHỜ */}
        {step === 0 && (
          <motion.div
            key="intro"
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 flex flex-col items-center justify-center z-20"
          >
            <motion.button
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              onClick={handleStart}
              className="bg-pink-600 hover:bg-pink-500 text-white px-8 py-4 rounded-full text-xl shadow-[0_0_20px_rgba(255,105,180,0.6)] backdrop-blur-sm"
            >
              Nhấn để mở quà 💖
            </motion.button>
          </motion.div>
        )}

        {/* BƯỚC 1: LỜI TỰA */}
        {step === 1 && (
          <motion.div
            key="text"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, filter: "blur(10px)" }}
            transition={{ duration: 1 }}
            className="absolute inset-0 flex items-center justify-center text-3xl md:text-5xl text-center px-4 z-20 text-pink-200 tracking-wider drop-shadow-lg"
          >
            "Ngày ta nắm tay..."
          </motion.div>
        )}

        {/* BƯỚC 2: KHÔNG GIAN ẢNH 3D */}
        {step === 2 && (
          <motion.div
            key="gallery"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            className="absolute inset-0 z-10"
          >
            <Gallery3D />

            {/* Nút chuyển sang đọc thư */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30">
              <button
                onClick={() => setStep(3)}
                className="bg-white/10 hover:bg-white/20 border border-white/50 text-white px-6 py-2 rounded-full backdrop-blur-md transition-all"
              >
                Đọc thư 💌
              </button>
            </div>
          </motion.div>
        )}

        {/* BƯỚC 3: LÁ THƯ KẾT THÚC */}
        {step === 3 && (
          <motion.div
            key="letter"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute inset-0 flex items-center justify-center z-20 bg-black/50 backdrop-blur-sm px-4"
          >
            <motion.div
              initial={{ rotateX: 90 }}
              animate={{ rotateX: 0 }}
              transition={{ type: "spring", damping: 15 }}
              className="bg-[#fcf8f2] text-gray-800 p-8 md:p-12 rounded-xl shadow-2xl max-w-lg w-full text-center origin-bottom"
            >
              <h2 className="text-2xl md:text-3xl text-pink-600 mb-6 font-bold">
                Ngày Quốc Tế Thiếu Nhi
              </h2>
              <p className="text-lg leading-relaxed mb-6 italic">
                Cả kiếp này anh có được em là hạnh phúc lắm rồi. Chúc bé ngoan
                của anh luôn vui vẻ, nụ cười trên môi và đặc biệt là không được
                tiêu cực nhé!
              </p>
              <button
                onClick={() => setStep(2)}
                className="text-sm text-gray-500 hover:text-pink-500 underline"
              >
                Quay lại ngắm ảnh
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
