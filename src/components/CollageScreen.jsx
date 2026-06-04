/**
 * CollageScreen.jsx — Màn hình quả cầu ảnh 3D
 *
 * FIX:
 * 1. Dùng Three.js Canvas + PhotoUniverse thay cho CSS sphere
 *    → Khớp đúng với các ảnh trong video (sphere 3D thật, không phải CSS transform)
 * 2. stage nội bộ: 1 = sphere đang xoay, 2 = exploded
 * 3. Nút "Nổ tung" → set stage 2, nút "Gom lại" → set stage 1
 * 4. Giữ lyricsSystem và nút "Đọc thư" từ bản gốc
 * 5. Giữ viewMode toggle (Khối 3D / Lưới Oval) nhưng
 *    "Khối 3D" giờ dùng Three.js thật
 */

import React, { useState, useEffect, useRef, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Stars, OrbitControls } from "@react-three/drei";
import PhotoUniverse from "./PhotoUniverse";
import styles from "./CollageScreen.module.css";

const LYRICS = [
  '"Ngày ta nắm tay yêu công khai giữa đời"',
  '"Là ngày thế giới mất hai nỗi buồn"',
  '"Cả kiếp này anh có được em là siêu đẳng cấp rồi"',
  '"Ah em xinh ngoan yêu em số một trên thế giới"',
  '"Làm gì có được ai thế thay"',
  '"Tay trong tay đưa em đi ngắm hoàng hôn kéo tới"',
  '"Em cười vẽ trời thêm màu thơ"',
  '"Như bao bông hoa tươi em còn hơn cả thế"',
  '"Vì em xinh số một trên thế giới"',
  '"Ánh mắt em hiền là muốn đến hôn lên liền trời ơi"',
];

// Grid/Oval view giữ nguyên từ bản gốc (CSS-only)
function GridView() {
  const [photos] = useState(() =>
    Array.from({ length: 12 }, (_, i) => `images/${i + 1}.jpg`),
  );
  return (
    <div className={styles.gridWrap}>
      <div className={styles.ovalOuter}>
        <div className={styles.ring1} />
        <div className={styles.ring2} />
        <div className={styles.ring3} />
        <div className={styles.oval}>
          <div className={styles.grid}>
            {photos.map((src, i) => (
              <div key={i} className={styles.cell}>
                <img src={src} alt="" className={styles.img} />
              </div>
            ))}
          </div>
        </div>
        <div className={styles.ovalGlow} />
      </div>
    </div>
  );
}

export default function CollageScreen({ onNext }) {
  const [lyricIdx, setLyricIdx] = useState(0);
  const [lyricVisible, setLyricVisible] = useState(true);
  const [viewMode, setViewMode] = useState("sphere"); // "sphere" | "grid"
  // sphereStage: 1 = xoay bình thường, 2 = nổ tung
  const [sphereStage, setSphereStage] = useState(1);

  // Lyric cycling
  useEffect(() => {
    const interval = setInterval(() => {
      setLyricVisible(false);
      setTimeout(() => {
        setLyricIdx((i) => (i + 1) % LYRICS.length);
        setLyricVisible(true);
      }, 500);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  function handleNext() {
    window.__spawnHearts?.();
    setTimeout(onNext, 400);
  }

  return (
    <div className={styles.screen}>
      {/* ── Header ── */}
      <div className={styles.header}>
        <span className={styles.tag}>"Aaa em xinh ngoan yêu em số 1"</span>
        <div className={styles.viewToggle}>
          <button
            className={`${styles.toggleBtn} ${viewMode === "sphere" ? styles.active : ""}`}
            onClick={() => setViewMode("sphere")}
          >
            Khối 3D
          </button>
          <button
            className={`${styles.toggleBtn} ${viewMode === "grid" ? styles.active : ""}`}
            onClick={() => setViewMode("grid")}
          >
            Lưới Oval
          </button>
        </div>
      </div>

      {/* ── Sphere 3D View (Three.js) ── */}
      {viewMode === "sphere" && (
        <div
          style={{
            position: "relative",
            flex: 1,
            width: "100%",
            minHeight: 0,
          }}
        >
          <Canvas
            camera={{ position: [0, 0, 10], fov: 55 }}
            gl={{ antialias: true, alpha: true }}
            style={{ background: "transparent", width: "100%", height: "100%" }}
            dpr={[1, 2]}
          >
            <Stars
              radius={60}
              depth={40}
              count={1500}
              factor={2}
              saturation={0.2}
              fade
              speed={0.3}
            />
            <ambientLight intensity={0.5} color="#ffb6e0" />
            <pointLight position={[8, 8, 8]} intensity={1.2} color="#fff" />
            <pointLight
              position={[-6, -4, -6]}
              intensity={0.4}
              color="#ff69b4"
            />

            <Suspense fallback={null}>
              <PhotoUniverse stage={sphereStage} />
            </Suspense>

            <OrbitControls
              enableZoom
              enablePan={false}
              minDistance={5}
              maxDistance={18}
              dampingFactor={0.06}
              enableDamping
            />
          </Canvas>

          {/* Nút nổ tung / gom lại — overlay trên canvas */}
          <div
            style={{
              position: "absolute",
              bottom: 8,
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "center",
              gap: 12,
              pointerEvents: "none",
            }}
          >
            {sphereStage === 1 ? (
              <button
                style={overlayBtn("#b82060", "#fff")}
                onClick={() => setSphereStage(2)}
              >
                💥 Nổ tung!
              </button>
            ) : (
              <button
                style={overlayBtn(
                  "transparent",
                  "#ff69b4",
                  "1px solid #ff69b4",
                )}
                onClick={() => setSphereStage(1)}
              >
                🔄 Gom lại
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Grid Oval View (CSS) ── */}
      {viewMode === "grid" && <GridView />}

      {/* ── Lyrics ── */}
      <div
        className={`${styles.lyricWrap} ${lyricVisible ? styles.lyricIn : styles.lyricOut}`}
      >
        <p className={styles.lyric}>{LYRICS[lyricIdx]}</p>
      </div>

      {/* ── Next button ── */}
      <button className={styles.nextBtn} onClick={handleNext}>
        Đọc thư 💌
      </button>
    </div>
  );
}

function overlayBtn(bg, color, border = "none") {
  return {
    pointerEvents: "auto",
    padding: "9px 28px",
    background: bg,
    color,
    border,
    borderRadius: 40,
    cursor: "pointer",
    fontSize: "0.88rem",
    letterSpacing: "0.1em",
    fontFamily: "'Cormorant Garamond', serif",
    boxShadow: bg !== "transparent" ? "0 0 20px rgba(180,32,96,0.5)" : "none",
    transition: "transform 0.15s",
  };
}
