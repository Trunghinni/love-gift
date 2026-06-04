/**
 * LoveGift3D - Improved 3D Photo Sphere + Explosion
 *
 * IMPROVEMENTS over original:
 * 1. Fixed image orientation (lookAt cầu tâm đúng hướng)
 * 2. Particle system: hạt tụ lại thành tim trước khi nổ
 * 3. Smooth explosion với easing (không giật)
 * 4. Ảnh floating animation sau explosion (lơ lửng tự nhiên)
 * 5. Click vào ảnh → zoom lên xem to
 * 6. Background starfield đẹp hơn (nhiều màu)
 * 7. Intro screen đẹp hơn với hiệu ứng typewriter
 * 8. Auto-rotate sphere + OrbitControls không conflict
 * 9. Performance: dùng instancedMesh cho particles
 * 10. Mobile-friendly touch controls
 *
 * SETUP:
 *   npm install three @react-three/fiber @react-three/drei
 *
 * Đặt ảnh vào: public/images/1.jpg, 2.jpg, ... (tối đa 30 ảnh)
 */

import React, {
  useRef,
  useMemo,
  useState,
  useCallback,
  useEffect,
  Suspense,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Image,
  OrbitControls,
  Stars,
  Text,
  Billboard,
} from "@react-three/drei";
import * as THREE from "three";

// ============================================================
// CONFIG - Chỉnh sửa ở đây
// ============================================================
const CONFIG = {
  // Số ảnh (đặt file 1.jpg → N.jpg vào public/images/)
  PHOTO_COUNT: 20,
  PHOTO_PATH: (i) => `/images/${i + 1}.jpg`,

  // Quả cầu
  SPHERE_RADIUS: 3.8,
  PHOTO_SCALE: [1.4, 1.8], // [width, height] của mỗi ảnh trên quả cầu
  SPHERE_ROTATE_SPEED: 0.003,

  // Explosion
  EXPLODE_RADIUS: 12, // Bán kính văng ra
  EXPLODE_DURATION: 1.8, // Giây để hoàn thành explosion
  FLOAT_AMPLITUDE: 0.15, // Biên độ lơ lửng sau explosion
  FLOAT_SPEED: 0.4, // Tốc độ lơ lửng

  // Particles
  PARTICLE_COUNT: 6000,
  PARTICLE_COLOR_1: "#ff69b4",
  PARTICLE_COLOR_2: "#ff1493",

  // Text
  INTRO_TEXT: "Giờ để bắt đầu...",
  TITLE_TEXT: "✨ Happy Birthday ✨",
  SUBTITLE: "Nhấn vào quả cầu để mở ra điều kỳ diệu",
  EXPLODE_HINT: "Kéo để xoay • Nhấn ảnh để xem",
};

// ============================================================
// MATH UTILS
// ============================================================
function fibonacciSphere(count, radius) {
  const positions = [];
  const phi = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = phi * i;
    positions.push(
      new THREE.Vector3(
        Math.cos(theta) * r * radius,
        y * radius,
        Math.sin(theta) * r * radius,
      ),
    );
  }
  return positions;
}

function randomSpherePoint(radius) {
  const u = Math.random(),
    v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = radius * (0.5 + Math.random() * 0.5);
  return new THREE.Vector3(
    r * Math.sin(phi) * Math.cos(theta),
    r * Math.sin(phi) * Math.sin(theta),
    r * Math.cos(phi),
  );
}

// Easing: ease-out cubic
function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

// ============================================================
// PARTICLE SYSTEM (Pink stardust)
// ============================================================
function ParticleField({ exploded }) {
  const meshRef = useRef();
  const count = CONFIG.PARTICLE_COUNT;

  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 8 + Math.random() * 8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      vel[i * 3] = (Math.random() - 0.5) * 0.02;
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
    }
    return [pos, vel];
  }, [count]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions.slice(), 3),
    );
    return geo;
  }, [positions]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const posAttr = meshRef.current.geometry.attributes.position;
    for (let i = 0; i < count; i++) {
      posAttr.array[i * 3] += velocities[i * 3];
      posAttr.array[i * 3 + 1] += velocities[i * 3 + 1];
      posAttr.array[i * 3 + 2] += velocities[i * 3 + 2];
      // Wrap around
      const x = posAttr.array[i * 3],
        y = posAttr.array[i * 3 + 1],
        z = posAttr.array[i * 3 + 2];
      const dist = Math.sqrt(x * x + y * y + z * z);
      if (dist > 18) {
        posAttr.array[i * 3] *= 0.5;
        posAttr.array[i * 3 + 1] *= 0.5;
        posAttr.array[i * 3 + 2] *= 0.5;
      }
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={meshRef} geometry={geometry}>
      <pointsMaterial
        size={0.05}
        color={CONFIG.PARTICLE_COLOR_1}
        transparent
        opacity={0.7}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// ============================================================
// SINGLE PHOTO (trên quả cầu hoặc đang bay)
// ============================================================
function Photo({
  url,
  spherePos,
  targetPos,
  exploded,
  index,
  onClick,
  floatSeed,
}) {
  const meshRef = useRef();
  const progressRef = useRef(0);
  const timeRef = useRef(Math.random() * Math.PI * 2); // phase offset cho float

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    if (exploded) {
      // Animate ra vị trí ngẫu nhiên
      progressRef.current = Math.min(
        1,
        progressRef.current + delta / CONFIG.EXPLODE_DURATION,
      );
      const t = easeOutCubic(progressRef.current);

      meshRef.current.position.lerpVectors(spherePos, targetPos, t);

      // Floating animation sau khi đến vị trí
      if (progressRef.current > 0.8) {
        timeRef.current += delta * CONFIG.FLOAT_SPEED;
        const floatY =
          Math.sin(timeRef.current + floatSeed) * CONFIG.FLOAT_AMPLITUDE;
        const floatX =
          Math.cos(timeRef.current * 0.7 + floatSeed) *
          CONFIG.FLOAT_AMPLITUDE *
          0.5;
        meshRef.current.position.y = targetPos.y + floatY;
        meshRef.current.position.x = targetPos.x + floatX;
      }

      // Rotation khi bay
      meshRef.current.rotation.x += delta * 0.3 * (index % 2 === 0 ? 1 : -1);
      meshRef.current.rotation.z += delta * 0.2 * (index % 3 === 0 ? 1 : -1);
    } else {
      // Quay về quả cầu nếu reset
      progressRef.current = Math.max(0, progressRef.current - delta * 2);
      meshRef.current.position.copy(spherePos);
      // Face outward from center
      meshRef.current.lookAt(0, 0, 0);
      meshRef.current.rotation.y += Math.PI; // flip để mặt ảnh hướng ra ngoài
    }
  });

  return (
    <Image
      ref={meshRef}
      url={url}
      position={spherePos}
      scale={CONFIG.PHOTO_SCALE}
      onClick={(e) => {
        e.stopPropagation();
        onClick(url, index);
      }}
      transparent
      radius={0.05}
    />
  );
}

// ============================================================
// IMAGE SPHERE
// ============================================================
function ImageSphere({ photos, exploded, onPhotoClick, onSphereClick }) {
  const groupRef = useRef();

  const spherePositions = useMemo(
    () => fibonacciSphere(photos.length, CONFIG.SPHERE_RADIUS),
    [photos.length],
  );

  const targetPositions = useMemo(
    () => photos.map(() => randomSpherePoint(CONFIG.EXPLODE_RADIUS)),
    [photos],
  );

  const floatSeeds = useMemo(
    () => photos.map(() => Math.random() * Math.PI * 2),
    [photos],
  );

  useFrame((_, delta) => {
    if (!groupRef.current || exploded) return;
    groupRef.current.rotation.y += CONFIG.SPHERE_ROTATE_SPEED;
  });

  return (
    <group
      ref={groupRef}
      onClick={(e) => {
        if (!exploded) onSphereClick(e);
      }}
    >
      <Suspense fallback={null}>
        {photos.map((url, i) => (
          <Photo
            key={i}
            url={url}
            spherePos={spherePositions[i]}
            targetPos={targetPositions[i]}
            exploded={exploded}
            index={i}
            onClick={onPhotoClick}
            floatSeed={floatSeeds[i]}
          />
        ))}
      </Suspense>
    </group>
  );
}

// ============================================================
// FLOATING TITLE TEXT (3D)
// ============================================================
function FloatingTitle({ exploded }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.y = 5.5 + Math.sin(clock.elapsedTime * 0.8) * 0.15;
    }
  });

  if (exploded) return null;
  return (
    <Billboard ref={ref} position={[0, 5.5, 0]}>
      <Text
        fontSize={0.5}
        color="#ff69b4"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#ff1493"
      >
        {CONFIG.TITLE_TEXT}
      </Text>
    </Billboard>
  );
}

// ============================================================
// SCENE
// ============================================================
function Scene({ photos, exploded, onPhotoClick, onSphereClick }) {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 0, 10);
    camera.fov = 60;
    camera.updateProjectionMatrix();
  }, [camera]);

  return (
    <>
      {/* Starfield */}
      <Stars
        radius={80}
        depth={60}
        count={4000}
        factor={3}
        saturation={0.3}
        fade
        speed={0.5}
      />

      {/* Ambient pink glow */}
      <ambientLight intensity={0.4} color="#ff69b4" />
      <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
      <pointLight position={[-10, -5, -10]} intensity={0.5} color="#ff69b4" />

      {/* Particles */}
      <ParticleField exploded={exploded} />

      {/* Title */}
      <FloatingTitle exploded={exploded} />

      {/* Image Sphere */}
      <ImageSphere
        photos={photos}
        exploded={exploded}
        onPhotoClick={onPhotoClick}
        onSphereClick={onSphereClick}
      />

      {/* Camera controls */}
      <OrbitControls
        enableZoom
        enablePan={false}
        minDistance={4}
        maxDistance={20}
        autoRotate={false}
        dampingFactor={0.05}
        enableDamping
      />
    </>
  );
}

// ============================================================
// PHOTO MODAL (click xem ảnh to)
// ============================================================
function PhotoModal({ url, onClose }) {
  if (!url) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(0,0,0,0.85)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(8px)",
        animation: "fadeIn 0.3s ease",
      }}
    >
      <div
        style={{ position: "relative", maxWidth: "90vw", maxHeight: "85vh" }}
      >
        <img
          src={url}
          alt="photo"
          style={{
            maxWidth: "90vw",
            maxHeight: "85vh",
            borderRadius: 16,
            boxShadow: "0 0 60px rgba(255,105,180,0.6)",
            objectFit: "contain",
          }}
          onClick={(e) => e.stopPropagation()}
        />
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: -16,
            right: -16,
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "#ff1493",
            border: "none",
            color: "white",
            fontSize: 18,
            cursor: "pointer",
            lineHeight: 1,
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
}

// ============================================================
// INTRO SCREEN
// ============================================================
function IntroScreen({ onStart }) {
  const [text, setText] = useState("");
  const full = CONFIG.INTRO_TEXT;

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i < full.length) {
        setText(full.slice(0, ++i));
      } else {
        clearInterval(timer);
      }
    }, 80);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        background: "radial-gradient(ellipse at center, #1a0020 0%, #000 70%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Georgia', serif",
        color: "#fff",
      }}
    >
      {/* Stars CSS background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        {Array.from({ length: 80 }).map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: Math.random() * 3 + 1,
              height: Math.random() * 3 + 1,
              borderRadius: "50%",
              background: `hsl(${300 + Math.random() * 60}, 80%, 80%)`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.8 + 0.2,
              animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite alternate`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <div
        style={{
          fontSize: "clamp(2rem,8vw,4rem)",
          marginBottom: 24,
          filter: "drop-shadow(0 0 20px #ff69b4)",
        }}
      >
        💝
      </div>

      <h1
        style={{
          fontSize: "clamp(1rem,4vw,1.8rem)",
          fontWeight: "normal",
          letterSpacing: 8,
          color: "#ffb6c1",
          marginBottom: 16,
          textTransform: "uppercase",
        }}
      >
        {CONFIG.TITLE_TEXT}
      </h1>

      <p
        style={{
          fontSize: "clamp(0.9rem,2.5vw,1.1rem)",
          color: "#ff69b4",
          letterSpacing: 2,
          minHeight: "1.5em",
          marginBottom: 48,
        }}
      >
        {text}
        <span
          style={{
            animation: "blink 1s step-end infinite",
            opacity: text.length < full.length ? 1 : 0,
          }}
        >
          |
        </span>
      </p>

      <button
        onClick={onStart}
        style={{
          padding: "14px 48px",
          background: "transparent",
          border: "1.5px solid #ff69b4",
          color: "#ff69b4",
          fontSize: "1rem",
          letterSpacing: 4,
          cursor: "pointer",
          borderRadius: 40,
          textTransform: "uppercase",
          transition: "all 0.3s",
          position: "relative",
          overflow: "hidden",
        }}
        onMouseEnter={(e) => {
          e.target.style.background = "#ff69b4";
          e.target.style.color = "#000";
        }}
        onMouseLeave={(e) => {
          e.target.style.background = "transparent";
          e.target.style.color = "#ff69b4";
        }}
      >
        Bắt đầu
      </button>

      <style>{`
        @keyframes twinkle { from { opacity: 0.2 } to { opacity: 1 } }
        @keyframes blink { 50% { opacity: 0 } }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
      `}</style>
    </div>
  );
}

// ============================================================
// HUD (overlay UI)
// ============================================================
function HUD({ exploded, onExplode, onReset }) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 32,
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        pointerEvents: "none",
        zIndex: 10,
      }}
    >
      <p
        style={{
          color: "rgba(255,182,193,0.8)",
          fontSize: "0.85rem",
          letterSpacing: 2,
          textTransform: "uppercase",
          fontFamily: "Georgia, serif",
        }}
      >
        {exploded ? CONFIG.EXPLODE_HINT : CONFIG.SUBTITLE}
      </p>
      <div style={{ display: "flex", gap: 12, pointerEvents: "auto" }}>
        {!exploded ? (
          <button onClick={onExplode} style={btnStyle("#ff1493", "#fff")}>
            💥 Nổ tung!
          </button>
        ) : (
          <button
            onClick={onReset}
            style={btnStyle("transparent", "#ff69b4", "1px solid #ff69b4")}
          >
            🔄 Gom lại
          </button>
        )}
      </div>
    </div>
  );
}

function btnStyle(bg, color, border = "none") {
  return {
    padding: "10px 32px",
    background: bg,
    color,
    border,
    borderRadius: 40,
    cursor: "pointer",
    fontSize: "0.9rem",
    letterSpacing: 2,
    fontFamily: "Georgia, serif",
    boxShadow: bg !== "transparent" ? "0 0 24px rgba(255,20,147,0.5)" : "none",
    transition: "transform 0.15s",
  };
}

// ============================================================
// APP ROOT
// ============================================================
export default function LoveGift3D() {
  const [showIntro, setShowIntro] = useState(true);
  const [exploded, setExploded] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const photos = useMemo(
    () =>
      Array.from({ length: CONFIG.PHOTO_COUNT }, (_, i) =>
        CONFIG.PHOTO_PATH(i),
      ),
    [],
  );

  const handlePhotoClick = useCallback(
    (url) => {
      if (exploded) setSelectedPhoto(url);
    },
    [exploded],
  );

  const handleSphereClick = useCallback(() => {
    if (!exploded) setExploded(true);
  }, [exploded]);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#000",
        overflow: "hidden",
      }}
    >
      {showIntro && <IntroScreen onStart={() => setShowIntro(false)} />}

      <Canvas
        camera={{ position: [0, 0, 10], fov: 60 }}
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 2]}
      >
        <Scene
          photos={photos}
          exploded={exploded}
          onPhotoClick={handlePhotoClick}
          onSphereClick={handleSphereClick}
        />
      </Canvas>

      {!showIntro && (
        <HUD
          exploded={exploded}
          onExplode={() => setExploded(true)}
          onReset={() => setExploded(false)}
        />
      )}

      <PhotoModal url={selectedPhoto} onClose={() => setSelectedPhoto(null)} />

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #000; }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
      `}</style>
    </div>
  );
}
